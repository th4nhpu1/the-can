// Cloudflare Worker: keeps the Gemini key server-side and only answers the game's two questions.
// POST /chat   – an interest group answers the player about the current decision.
// POST /report – a short news-style summary when the term ends.
import { personas, chatSystemPrompt, reportSystemPrompt } from './personas.js';

const LABELS = ['Đời sống', 'Sản xuất', 'Công bằng', 'Ngân sách'];
const END_REASONS = { term: 'đi hết nhiệm kỳ 10 năm', crisis: 'kết thúc sớm vì một chỉ số rơi vào khủng hoảng', overthrow: 'kết thúc sớm vì mất lòng dân, kiến nghị và biểu tình lan rộng', resign: 'người điều hành từ chức giữa nhiệm kỳ' };
const MAX_MESSAGES = 6;
const RATE_LIMIT = 20; // requests per IP per minute, per Worker instance (best effort)

const hits = new Map();
function rateLimited(ip, now = Date.now()) {
  const h = hits.get(ip);
  if (!h || now > h.reset) { hits.set(ip, { count: 1, reset: now + 60_000 }); return false; }
  h.count++;
  return h.count > RATE_LIMIT;
}

class BadRequest extends Error {}
const text = (v, max) => { if (typeof v !== 'string') throw new BadRequest('text'); return v.replace(/\s+/g, ' ').trim().slice(0, max); };
const int = (v, lo, hi) => { if (!Number.isInteger(v) || v < lo || v > hi) throw new BadRequest('number'); return v; };
const list = (v, max) => { if (!Array.isArray(v)) throw new BadRequest('list'); return v.slice(-max); };
const statsLine = s => list(s, 4).map((v, i) => `${LABELS[i]} ${int(v, 0, 100)}/100`).join(', ');

export function buildChat(body) {
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
  return { system: chatSystemPrompt(p), contents, maxTokens: 1000 };
}

export function buildReport(body) {
  const reason = END_REASONS[body.endReason];
  if (!reason) throw new BadRequest('endReason');
  const support = list(body.support, personas.length).map((v, i) => `${personas[i].name} ${int(v, 0, 100)}/100`).join(', ');
  const decisions = list(body.decisions || [], 12).map(d => `- ${text(d?.title, 120)}: ${text(d?.text, 160)}`);
  const prompt = `Cách nhiệm kỳ kết thúc: ${reason}, sau ${int(body.turn, 0, 30)} quyết định.
Tình hình cuối nhiệm kỳ: ${statsLine(body.stats)}.
Mức ủng hộ của các nhóm: ${support}.
${body.contested ? 'Quyết định gây tranh cãi nhất: ' + text(body.contested, 300) + '\n' : ''}Các quyết định gần nhất:
${decisions.join('\n') || '- (không có)'}`;
  return { system: reportSystemPrompt(), contents: [{ role: 'user', parts: [{ text: prompt }] }], maxTokens: 2000 };
}

async function callGemini(env, req) {
  const model = env.GEMINI_MODEL || 'gemini-3.5-flash';
  const generationConfig = { temperature: 0.8, maxOutputTokens: req.maxTokens };
  if (env.GEMINI_THINKING_BUDGET !== undefined && env.GEMINI_THINKING_BUDGET !== '') generationConfig.thinkingConfig = { thinkingBudget: Number(env.GEMINI_THINKING_BUDGET) };
  else if (env.GEMINI_THINKING_LEVEL) generationConfig.thinkingConfig = { thinkingLevel: env.GEMINI_THINKING_LEVEL };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: req.system }] }, contents: req.contents, generationConfig }),
    signal: AbortSignal.timeout(req.timeoutMs || 18000),
  }).catch(e => { console.log('Gemini fetch failed', String(e)); return null; });
  if (!res) return null;
  if (!res.ok) { console.log('Gemini error', res.status, (await res.text()).slice(0, 500)); return null; }
  const data = await res.json();
  const out = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  return out || null;
}

function cors(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const ok = origin && allowed.includes(origin);
  return { ok, headers: ok ? { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400', vary: 'Origin' } : { vary: 'Origin' } };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { ok, headers } = cors(request.headers.get('origin'), env);
    const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'content-type': 'application/json; charset=utf-8' } });
    if (!ok) return json(403, { error: 'origin' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST' || !['/chat', '/report'].includes(url.pathname)) return json(404, { error: 'not_found' });
    if (!env.GEMINI_API_KEY) return json(503, { error: 'not_configured' });
    if (rateLimited(request.headers.get('cf-connecting-ip') || 'unknown')) return json(429, { error: 'rate_limited' });
    if (Number(request.headers.get('content-length') || 0) > 16_000) return json(413, { error: 'too_large' });
    let body;
    try { body = await request.json(); } catch { return json(400, { error: 'bad_json' }); }
    let req;
    try { req = url.pathname === '/chat' ? buildChat(body) : buildReport(body); }
    catch (e) { if (e instanceof BadRequest) return json(400, { error: 'bad_request', field: e.message }); throw e; }
    const reply = await callGemini(env, req);
    return reply ? json(200, { text: reply }) : json(502, { error: 'upstream' });
  },
};
