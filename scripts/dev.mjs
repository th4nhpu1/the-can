import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Readable } from 'node:stream';
import chat from '../api/chat.js';
import report from '../api/report.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const routes = { '/api/chat': chat, '/api/report': report };

export async function handleDevRequest(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const api = routes[url.pathname];
      if (api) {
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
        // Match Vercel's trusted proxy behavior when testing locally.
        headers.set('x-forwarded-for', req.socket.remoteAddress || 'localhost');
        const request = new Request(url, {
          method: req.method, headers,
          ...(!['GET', 'HEAD'].includes(req.method) ? { body: Readable.toWeb(req), duplex: 'half' } : {}),
        });
        const response = await api.fetch(request);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
        return;
      }
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405, { allow: 'GET, HEAD' }); res.end(); return;
      }
      const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
      if (!path.startsWith(root + sep)) { res.writeHead(404); res.end(); return; }
      let body;
      try { body = await readFile(path); }
      catch { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(500, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify({ error: 'internal' }));
    }
}

export function createDevServer() {
  return createServer(handleDevRequest);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 5174);
  createDevServer().listen(port, '127.0.0.1', () => {
    console.log(`The Can: http://127.0.0.1:${port}`);
    if (!process.env.GEMINI_API_KEY) console.log('No GEMINI_API_KEY: gameplay works; AI uses written fallback replies.');
  });
}
