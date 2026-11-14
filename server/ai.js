// Shared Vercel backend. The Gemini key and prompts stay outside the public dist/ folder.
// POST /api/chat and POST /api/report.
import { personas, chatSystemPrompt, reportSystemPrompt } from './personas.js';

const LABELS = ['Đời sống', 'Sản xuất', 'Công bằng', 'Ngân sách'];
const END_REASONS = { term: 'đi hết nhiệm kỳ 10 năm', crisis: 'kết thúc sớm vì một chỉ số rơi vào khủng hoảng', overthrow: 'kết thúc sớm vì mất lòng dân, kiến nghị và biểu tình lan rộng', resign: 'người điều hành từ chức giữa nhiệm kỳ' };
const MAX_MESSAGES = 6;
const RATE_LIMIT = 20; // requests per IP per minute, per function instance (best effort)
const MAX_BODY_BYTES = 16_000;

const hits = new Map();
function rateLimited(ip, now = Date.now()) {
  for (const [key, hit] of hits) if (now >= hit.reset) hits.delete(key);
  const h = hits.get(ip);
  if (!h) {
    if (hits.size >= 10_000) return true;
    hits.set(ip, { count: 1, reset: now + 60_000 }); return false;
  }
  h.count++;
  return h.count > RATE_LIMIT;
}

class BadRequest extends Error {}
const object = v => { if (!v || typeof v !== 'object' || Array.isArray(v)) throw new BadRequest('object'); return v; };
const text = (v, max) => { if (typeof v !== 'string') throw new BadRequest('text'); return v.replace(/\s+/g, ' ').trim().slice(0, max); };
const int = (v, lo, hi) => { if (!Number.isInteger(v) || v < lo || v > hi) throw new BadRequest('number'); return v; };
const list = (v, max) => { if (!Array.isArray(v)) throw new BadRequest('list'); return v.slice(-max); };
const statsLine = s => list(s, 4).map((v, i) => `${LABELS[i]} ${int(v, 0, 100)}/100`).join(', ');

export function buildChat(body) {
  object(body);
  const g = int(body.group, 0, personas.length - 1);
  const p = personas[g];
  const card = body.card || {};
  const options = list(card.options, 4).map((o, i) => `${String.fromCharCode(65 + i)}. ${text(o, 160)}`);
  const past = list(body.past || [], 8).map(t => '- ' + text(t, 160));
  const messages = list(body.messages, MAX_MESSAGES).map(m => {
    if (m?.role !== 'user' && m?.role !== 'model') throw new BadRequest('role');
    return { role: m.role, text: text(m.text, 400) };
  });
  if (!messages.length || messages[0].role !== 'user' || messages.at(-1).role !== 'user') throw new BadRequest('messages');
  const context = `[Thông tin trò chơi]
Năm ${Math.floor(int(body.turn, 0, 30) / 3) + 1} của nhiệm kỳ. Tình hình hiện tại: ${statsLine(body.stats)}.
Mức ủng hộ hiện tại của nhóm bạn với người điều hành: ${int(body.support, 0, 100)}/100.
Quyết định đang bàn: ${text(card.title, 120)} — ${text(card.q, 400)}
Các phương án:
${options.join('\n')}
${past.length ? 'Những quyết định gần đây của người chơi:\n' + past.join('\n') : 'Người chơi chưa có quyết định nào trước đó.'}

[Câu hỏi của người chơi]
`;
  const contents = messages.map((m, i) => ({ role: m.role, parts: [{ text: i === 0 ? context + m.text : m.text }] }));
  return { system: chatSystemPrompt(p), contents, maxTokens: 1600 };
}

export function buildReport(body) {
  object(body);
  const reason = END_REASONS[body.endReason];
  if (!reason) throw new BadRequest('endReason');
  const support = list(body.support, personas.length).map((v, i) => `${personas[i].name} ${int(v, 0, 100)}/100`).join(', ');
  const decisions = list(body.decisions || [], 12).map(d => `- ${text(d?.title, 120)}: ${text(d?.text, 160)}`);
  const scenario = body.scenario === undefined ? '' : text(body.scenario, 300);
  const prompt = `${scenario ? 'Hoàn cảnh xuất phát của nhiệm kỳ: ' + scenario + '\n' : ''}Cách nhiệm kỳ kết thúc: ${reason}, sau ${int(body.turn, 0, 30)} quyết định.
Tình hình cuối nhiệm kỳ: ${statsLine(body.stats)}.
Mức ủng hộ của các nhóm: ${support}.
${body.contested ? 'Quyết định gây tranh cãi nhất: ' + text(body.contested, 300) + '\n' : ''}Các quyết định gần nhất:
${decisions.join('\n') || '- (không có)'}`;
  return { system: reportSystemPrompt(), contents: [{ role: 'user', parts: [{ text: prompt }] }], maxTokens: 3000, timeoutMs: 27000 };
}

// Time kept back for the fallback model when the main one is overloaded or slow.
const FALLBACK_RESERVE_MS = 6000;

async function generate(env, req, model, thinkingConfig, timeoutMs) {
  const generationConfig = { temperature: 0.6, maxOutputTokens: req.maxTokens };
  if (thinkingConfig) generationConfig.thinkingConfig = thinkingConfig;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: req.system }] }, contents: req.contents, generationConfig }),
    signal: AbortSignal.timeout(timeoutMs),
  }).catch(e => { console.log('Gemini fetch failed', model, String(e)); return null; });
  if (!res) return null;
  if (!res.ok) { console.log('Gemini error', model, res.status); return null; }
  try {
    const data = await res.json();
    const out = (data.candidates?.[0]?.content?.parts || [])
      .filter(p => !p.thought && typeof p.text === 'string').map(p => p.text).join('').trim();
    return out || null;
  } catch { return null; }
}

async function callGemini(env, req) {
  const model = env.GEMINI_MODEL || 'gemini-3.5-flash';
  const fallback = env.GEMINI_FALLBACK_MODEL && env.GEMINI_FALLBACK_MODEL !== model ? env.GEMINI_FALLBACK_MODEL : '';
  let thinkingConfig = null;
  if (env.GEMINI_THINKING_BUDGET !== undefined && env.GEMINI_THINKING_BUDGET !== '') thinkingConfig = { thinkingBudget: Number(env.GEMINI_THINKING_BUDGET) };
  else if (env.GEMINI_THINKING_LEVEL) thinkingConfig = { thinkingLevel: env.GEMINI_THINKING_LEVEL };
  const total = req.timeoutMs || 18000, start = Date.now();
  const out = await generate(env, req, model, thinkingConfig, fallback ? total - FALLBACK_RESERVE_MS : total);
  if (out || !fallback) return out;
  // The fallback is a light model: no thinking settings, whatever time is left.
  return generate(env, req, fallback, null, Math.max(FALLBACK_RESERVE_MS, total - (Date.now() - start)));
}

async function readBody(request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) throw new BadRequest('too_large');
  const reader = request.body?.getReader();
  if (!reader) throw new BadRequest('bad_json');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new BadRequest('too_large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new BadRequest('bad_json'); }
}

export async function handleRequest(request, env = process.env, route) {
  const url = new URL(request.url);
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', vary: 'Origin' };
  const json = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } });
  const endpoint = route || url.pathname.replace(/^\/api\//, '');
  if (!['chat', 'report'].includes(endpoint)) return json(404, { error: 'not_found' });
  // Exact same-origin checks also work on Vercel previews and custom domains.
  // This is a browser restriction, not authentication against non-browser clients.
  if (request.headers.get('origin') !== url.origin) return json(403, { error: 'origin' });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, allow: 'POST, OPTIONS' } });
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, { allow: 'POST, OPTIONS' });
  if (!env.GEMINI_API_KEY) return json(503, { error: 'not_configured' });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return json(429, { error: 'rate_limited' }, { 'retry-after': '60' });
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json(415, { error: 'content_type' });
  let body;
  try { body = await readBody(request); }
  catch (e) { return json(e.message === 'too_large' ? 413 : 400, { error: e.message === 'too_large' ? 'too_large' : 'bad_json' }); }
  let req;
  try { req = endpoint === 'chat' ? buildChat(body) : buildReport(body); }
  catch (e) {
    if (e instanceof BadRequest || e instanceof TypeError) return json(400, { error: 'bad_request', field: e instanceof BadRequest ? e.message : 'object' });
    throw e;
  }
  const reply = await callGemini(env, req);
  return reply ? json(200, { text: reply }) : json(502, { error: 'upstream' });
}
