// Tests for the Vercel backend with a fake Gemini. Run: node tests/api.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { Readable } from 'node:stream';
import { handleRequest } from '../server/ai.js';
import chatHandler from '../api/chat.js';
import reportHandler from '../api/report.js';
import { handleDevRequest } from '../scripts/dev.mjs';
const networkFetch = globalThis.fetch;

const ORIGIN = 'http://localhost:5174';
const env = { GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'gemini-test', GEMINI_THINKING_BUDGET: '0' };
let calls = [], upstream = { ok: true, status: 200, body: { candidates: [{ content: { parts: [{ text: 'Chúng tôi lo về đồng lương.' }] } }] } };
globalThis.fetch = async (url, init) => { calls.push({ url, init, body: JSON.parse(init.body) }); return { ok: upstream.ok, status: upstream.status, json: async () => upstream.body, text: async () => JSON.stringify(upstream.body) }; };
const origLog = console.log; console.log = () => {};

let ip = 0;
const req = (path, body, { origin = ORIGIN, method = 'POST', e = env, sameIp } = {}) => handleRequest(new Request(ORIGIN + '/api' + path, { method, headers: { origin, 'content-type': 'application/json', 'x-forwarded-for': sameIp || '10.0.0.' + (++ip % 250) }, body: method === 'POST' ? JSON.stringify(body) : undefined }), e);
const chat = (over = {}) => ({ group: 0, turn: 4, stats: [60, 55, 50, 65], support: 52, card: { title: 'Tiền lương', q: 'Giá tăng, chọn cách nào?', options: ['Tăng lương tối thiểu', 'Hỗ trợ tiền'] }, past: ['Ưu tiên đầu tiên: Mở rộng sản xuất'], messages: [{ role: 'user', text: 'Các anh nghĩ sao?' }], ...over });

// Same-origin browser requests
let r = await req('/chat', chat(), { method: 'OPTIONS' });
assert.equal(r.status, 204); assert.equal(r.headers.get('cache-control'), 'no-store');
r = await req('/chat', chat(), { origin: 'https://evil.example' });
assert.equal(r.status, 403); assert.equal(r.headers.get('access-control-allow-origin'), null); assert.equal(calls.length, 0);

// Chat happy path: key stays in the header, persona and rules go to the system prompt.
r = await req('/chat', chat());
assert.equal(r.status, 200); assert.equal((await r.json()).text, 'Chúng tôi lo về đồng lương.');
assert.equal(r.headers.get('cache-control'), 'no-store');
let c = calls.at(-1);
assert.match(c.url, /models\/gemini-test:generateContent$/); assert.equal(c.init.headers['x-goog-api-key'], 'test-key'); assert(!c.url.includes('test-key'));
assert.match(c.body.systemInstruction.parts[0].text, /Công nhân/); assert.match(c.body.systemInstruction.parts[0].text, /Không nhắc tên người, đảng phái/);
assert.match(c.body.contents[0].parts[0].text, /Tăng lương tối thiểu/); assert.match(c.body.contents[0].parts[0].text, /Các anh nghĩ sao\?$/);
assert.deepEqual(c.body.generationConfig.thinkingConfig, { thinkingBudget: 0 });
r = await req('/chat', chat(), { e: { ...env, GEMINI_THINKING_BUDGET: '' } }); assert.equal(calls.at(-1).body.generationConfig.thinkingConfig, undefined);

// Multi-turn history keeps roles; the context is only added to the first message.
r = await req('/chat', chat({ group: 3, messages: [{ role: 'user', text: 'Hỏi 1' }, { role: 'model', text: 'Đáp 1' }, { role: 'user', text: 'Hỏi 2' }] }));
assert.equal(r.status, 200); c = calls.at(-1);
assert.deepEqual(c.body.contents.map(x => x.role), ['user', 'model', 'user']); assert.equal(c.body.contents[2].parts[0].text, 'Hỏi 2'); assert.match(c.body.systemInstruction.parts[0].text, /Doanh nghiệp tư nhân/);

// Long input is clipped.
await req('/chat', chat({ messages: [{ role: 'user', text: 'a'.repeat(5000) }] }));
assert(calls.at(-1).body.contents[0].parts[0].text.length < 2500);

// Validation
const before = calls.length;
for (const bad of [chat({ group: 9 }), chat({ group: '0' }), chat({ stats: [60, 60, 999, 60] }), chat({ messages: [] }), chat({ messages: [{ role: 'model', text: 'x' }] }), chat({ messages: [{ role: 'user', text: 'x' }, { role: 'model', text: 'y' }] }), chat({ messages: [{ role: 'system', text: 'x' }] }), chat({ card: { title: 'x', q: 'y', options: 'z' } })]) {
  r = await req('/chat', bad); assert.equal(r.status, 400, JSON.stringify(bad));
}
assert.equal(calls.length, before);
r = await handleRequest(new Request(ORIGIN + '/api/chat', { method: 'POST', headers: { origin: ORIGIN, 'content-type': 'application/json' }, body: '{oops' }), env); assert.equal(r.status, 400);

// Report
const report = { endReason: 'overthrow', turn: 14, stats: [30, 70, 20, 50], support: [30, 25, 35, 80, 70], decisions: [{ title: 'Thuế', text: 'Giảm thuế' }], contested: 'Giảm thuế: doanh nghiệp ủng hộ' };
r = await req('/report', report); assert.equal(r.status, 200); c = calls.at(-1);
assert.match(c.body.contents[0].parts[0].text, /mất lòng dân/); assert.match(c.body.contents[0].parts[0].text, /Nông dân 25\/100/); assert.match(c.body.systemInstruction.parts[0].text, /phóng viên/);
r = await req('/report', { ...report, endReason: 'win' }); assert.equal(r.status, 400);
assert.doesNotMatch(calls.at(-1).body.contents[0].parts[0].text, /Hoàn cảnh xuất phát/);
r = await req('/report', { ...report, scenario: 'Hậu khủng hoảng (rất khó): ngân sách cạn' }); assert.equal(r.status, 200);
assert.match(calls.at(-1).body.contents[0].parts[0].text, /Hoàn cảnh xuất phát của nhiệm kỳ: Hậu khủng hoảng/);
r = await req('/report', { ...report, scenario: 5 }); assert.equal(r.status, 400);

// Other failures
r = await req('/other', {}); assert.equal(r.status, 404);
r = await req('/chat', chat(), { method: 'GET' }); assert.equal(r.status, 405);
r = await req('/chat', chat(), { e: { ...env, GEMINI_API_KEY: '' } }); assert.equal(r.status, 503);
upstream = { ok: false, status: 500, body: { error: 'boom' } }; r = await req('/chat', chat()); assert.equal(r.status, 502);
upstream = { ok: true, status: 200, body: { candidates: [] } }; r = await req('/chat', chat()); assert.equal(r.status, 502);
upstream = { ok: true, status: 200, body: { candidates: [{ content: { parts: [{ text: 'ok' }] } }] } };

// Fallback model: used when the main model is overloaded, without thinking settings.
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => { calls.push({ url, init, body: JSON.parse(init.body) }); const busy = url.includes('gemini-test:'); return { ok: !busy, status: busy ? 503 : 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'dự phòng' }] } }] }), text: async () => 'high demand' }; };
const fb = { ...env, GEMINI_FALLBACK_MODEL: 'gemini-lite' };
r = await req('/chat', chat(), { e: fb });
assert.equal(r.status, 200); assert.equal((await r.json()).text, 'dự phòng');
assert.match(calls.at(-2).url, /gemini-test:/); assert.match(calls.at(-1).url, /gemini-lite:/); assert.equal(calls.at(-1).body.generationConfig.thinkingConfig, undefined);
globalThis.fetch = async (url, init) => { calls.push({ url, init, body: JSON.parse(init.body) }); return { ok: false, status: 503, json: async () => ({}), text: async () => 'busy' }; };
r = await req('/chat', chat(), { e: fb }); assert.equal(r.status, 502);
globalThis.fetch = realFetch;
const n = calls.length; r = await req('/chat', chat()); assert.equal(r.status, 200); assert.equal(calls.length, n + 1);

// Rate limit per IP
let last;
for (let i = 0; i < 21; i++) last = await req('/chat', chat(), { sameIp: '192.0.2.7' });
assert.equal(last.status, 429);
assert.equal((await req('/chat', chat(), { sameIp: '192.0.2.8' })).status, 200);

// Invalid bodies and real byte limits must not reach Gemini or throw server errors.
const invalidStart = calls.length;
for (const body of [null, [], 7, 'text', chat({ messages: [null] }), chat({ card: null })]) {
  assert.equal((await req('/chat', body)).status, 400);
}
assert.equal(calls.length, invalidStart);
const raw = (body, headers = {}) => handleRequest(new Request(ORIGIN + '/api/chat', {
  method: 'POST', headers: { origin: ORIGIN, 'content-type': 'application/json', ...headers }, body,
}), env);
assert.equal((await raw('x'.repeat(16001))).status, 413);
assert.equal((await raw(JSON.stringify(chat()), { 'content-length': '16001' })).status, 413);
assert.equal((await raw(JSON.stringify(chat({ messages: [{ role: 'user', text: '\u1ec7'.repeat(6000) }] })))).status, 413);
assert.equal((await raw(JSON.stringify(chat()), { 'content-type': 'text/plain' })).status, 415);
assert.equal((await raw(JSON.stringify(chat()), { origin: 'null' })).status, 403);
assert.equal((await raw(JSON.stringify(chat()), { origin: '' })).status, 403);

// No fixed allowlist is needed for production, previews, or custom domains.
for (const origin of ['https://the-can.vercel.app', 'https://the-can-git-feature-team.vercel.app', 'https://game.example']) {
  const response = await handleRequest(new Request(origin + '/api/chat', {
    method: 'POST', headers: { origin, 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.' + ++ip }, body: JSON.stringify(chat()),
  }), env);
  assert.equal(response.status, 200);
}
assert.equal((await raw(JSON.stringify(chat()), { origin: ORIGIN + '.evil.example' })).status, 403);

// Malformed upstream responses, transport errors and thought-only parts use the fallback path.
globalThis.fetch = async () => ({ ok: true, json: async () => { throw new SyntaxError('bad upstream JSON'); } });
assert.equal((await req('/chat', chat())).status, 502);
globalThis.fetch = async () => { throw new Error('network failure'); };
assert.equal((await req('/chat', chat())).status, 502);
globalThis.fetch = realFetch;
upstream.body = { candidates: [{ content: { parts: [{ thought: true, text: 'private thought' }, { text: 'visible answer' }] } }] };
assert.equal((await (await req('/chat', chat())).json()).text, 'visible answer');
upstream.body = { candidates: [{ content: { parts: [{ thought: true, text: 'private thought' }] } }] };
assert.equal((await req('/chat', chat())).status, 502);
upstream.body = { candidates: [{ content: { parts: [{ text: 'ok' }] } }] };

// Exercise the exact exports Vercel invokes, using runtime environment variables.
const previousEnv = Object.fromEntries(Object.keys(env).map(key => [key, process.env[key]]));
Object.assign(process.env, env);
// Exercise HTTP routing without opening sockets (works in restricted environments).
async function localFetch(input, options = {}) {
  const url = new URL(input);
  const req = Readable.from(options.body ? [Buffer.from(options.body)] : []);
  req.url = url.pathname + url.search;
  req.method = options.method || 'GET';
  req.headers = { host: url.host, ...options.headers };
  req.socket = { remoteAddress: '127.0.0.1' };
  let status, headers, body;
  await handleDevRequest(req, {
    writeHead(code, values) { status = code; headers = values; },
    end(value) { body = value; },
  });
  return new Response(body, { status, headers });
}
try {
  for (const [handler, path, payload] of [[chatHandler, 'chat', chat()], [reportHandler, 'report', report]]) {
    const response = await handler.fetch(new Request(ORIGIN + '/api/' + path, {
      method: 'POST', headers: { origin: ORIGIN, 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.' + ++ip }, body: JSON.stringify(payload),
    }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { text: 'ok' });
  }
  const base = 'http://127.0.0.1:5174';
  const page = await localFetch(base);
  assert.equal(page.status, 200);
  const html = await page.text();
  for (const [, asset] of html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)) {
    assert.equal((await localFetch(new URL(asset, base))).status, 200, asset);
  }
  for (const path of ['/server/ai.js', '/server/personas.js', '/.env.local', '/worker/wrangler.toml']) {
    assert.equal((await localFetch(base + path)).status, 404, path);
  }

  // Run the real frontend request function through local HTTP request handling.
  const browser = vm.createContext({
    AbortController, setTimeout, clearTimeout,
    fetch: (path, options) => localFetch(new URL(path, base), { ...options, headers: { ...options.headers, origin: base } }),
  });
  vm.runInContext(readFileSync('dist/ai-config.js', 'utf8') + '\n' + readFileSync('dist/ai.js', 'utf8'), browser);
  browser.chatInput = chat(); browser.reportInput = report;
  assert.equal(await vm.runInContext("aiPost('/chat', chatInput)", browser), 'ok');
  assert.equal(await vm.runInContext("aiPost('/report', reportInput)", browser), 'ok');
  delete process.env.GEMINI_API_KEY;
  assert.equal(await vm.runInContext("aiPost('/chat', chatInput)", browser), null);
} finally {
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  globalThis.fetch = networkFetch;
  console.log = origLog;
}
console.log(JSON.stringify({ api: 'pass', sameOrigin: 'pass', chat: 'pass', report: 'pass', validation: 'pass', fallback: 'pass', rateLimit: 'pass', entryPoints: 'pass', frontendHttp: 'pass', staticIsolation: 'pass' }));
