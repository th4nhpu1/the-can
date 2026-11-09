// Tests for the Worker with a fake Gemini. Run: node worker/test.mjs
import assert from 'node:assert/strict';
import worker from './src/index.js';

const ORIGIN = 'http://localhost:5174';
const env = { GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'gemini-test', GEMINI_THINKING_BUDGET: '0', ALLOWED_ORIGINS: ORIGIN + ',https://game.example' };
let calls = [], upstream = { ok: true, status: 200, body: { candidates: [{ content: { parts: [{ text: 'Chúng tôi lo về đồng lương.' }] } }] } };
globalThis.fetch = async (url, init) => { calls.push({ url, init, body: JSON.parse(init.body) }); return { ok: upstream.ok, status: upstream.status, json: async () => upstream.body, text: async () => JSON.stringify(upstream.body) }; };
const origLog = console.log; console.log = () => {};

let ip = 0;
const req = (path, body, { origin = ORIGIN, method = 'POST', e = env, sameIp } = {}) => worker.fetch(new Request('https://w.test' + path, { method, headers: { origin, 'content-type': 'application/json', 'cf-connecting-ip': sameIp || '10.0.0.' + (++ip % 250) }, body: method === 'POST' ? JSON.stringify(body) : undefined }), e);
const chat = (over = {}) => ({ group: 0, turn: 4, stats: [60, 55, 50, 65], support: 52, card: { title: 'Tiền lương', q: 'Giá tăng, chọn cách nào?', options: ['Tăng lương tối thiểu', 'Hỗ trợ tiền'] }, past: ['Ưu tiên đầu tiên: Mở rộng sản xuất'], messages: [{ role: 'user', text: 'Các anh nghĩ sao?' }], ...over });

// CORS
let r = await req('/chat', chat(), { method: 'OPTIONS' });
assert.equal(r.status, 204); assert.equal(r.headers.get('access-control-allow-origin'), ORIGIN);
r = await req('/chat', chat(), { origin: 'https://evil.example' });
assert.equal(r.status, 403); assert.equal(r.headers.get('access-control-allow-origin'), null); assert.equal(calls.length, 0);

// Chat happy path: key stays in the header, persona and rules go to the system prompt.
r = await req('/chat', chat());
assert.equal(r.status, 200); assert.equal((await r.json()).text, 'Chúng tôi lo về đồng lương.');
assert.equal(r.headers.get('access-control-allow-origin'), ORIGIN);
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
r = await worker.fetch(new Request('https://w.test/chat', { method: 'POST', headers: { origin: ORIGIN }, body: '{oops' }), env); assert.equal(r.status, 400);

// Report
const report = { endReason: 'overthrow', turn: 14, stats: [30, 70, 20, 50], support: [30, 25, 35, 80, 70], decisions: [{ title: 'Thuế', text: 'Giảm thuế' }], contested: 'Giảm thuế: doanh nghiệp ủng hộ' };
r = await req('/report', report); assert.equal(r.status, 200); c = calls.at(-1);
assert.match(c.body.contents[0].parts[0].text, /mất lòng dân/); assert.match(c.body.contents[0].parts[0].text, /Nông dân 25\/100/); assert.match(c.body.systemInstruction.parts[0].text, /phóng viên/);
r = await req('/report', { ...report, endReason: 'win' }); assert.equal(r.status, 400);

// Other failures
r = await req('/other', {}); assert.equal(r.status, 404);
r = await req('/chat', chat(), { method: 'GET' }); assert.equal(r.status, 404);
r = await req('/chat', chat(), { e: { ...env, GEMINI_API_KEY: '' } }); assert.equal(r.status, 503);
upstream = { ok: false, status: 500, body: { error: 'boom' } }; r = await req('/chat', chat()); assert.equal(r.status, 502);
upstream = { ok: true, status: 200, body: { candidates: [] } }; r = await req('/chat', chat()); assert.equal(r.status, 502);
upstream = { ok: true, status: 200, body: { candidates: [{ content: { parts: [{ text: 'ok' }] } }] } };

// Rate limit per IP
let last;
for (let i = 0; i < 21; i++) last = await req('/chat', chat(), { sameIp: '192.0.2.7' });
assert.equal(last.status, 429);
assert.equal((await req('/chat', chat(), { sameIp: '192.0.2.8' })).status, 200);

console.log = origLog;
console.log(JSON.stringify({ worker: 'pass', cors: 'pass', chat: 'pass', report: 'pass', validation: 'pass', rateLimit: 'pass' }));
