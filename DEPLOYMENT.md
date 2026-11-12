# Deploy the website and AI to Vercel

The frontend in `dist/` and the two Node.js API functions in `api/` deploy together.
The browser calls `/api/chat` and `/api/report` on the same domain. Cloudflare is
no longer required by this version. Gemini remains the AI provider.

## 1. Push this migration

Commit and push the updated project to your GitHub repository. Include `api/`,
`server/`, `dist/`, `package.json`, and `vercel.json`. Do not upload only `dist/`.
Keep the real API key out of Git and out of every file in `dist/`.

## 2. Import the repository in Vercel

Choose **Add New > Project**, then import `th4nhpu1/the-can`.

| Setting | Value |
| --- | --- |
| Root Directory | Repository root (`./`), NOT `dist` or `worker` |
| Framework Preset | Other |
| Build Command | Empty (override enabled) |
| Output Directory | `dist` |
| Install Command | Default |
| Node.js | 22.x (set in `package.json`) |

`vercel.json` supplies the build/output settings, runs the API in `iad1` (US),
and allows up to 30 seconds per function. There is no frontend build step and
no application dependency to install. Vercel packages the root `api/` handlers
separately from the static output.

If you previously imported the project with Root Directory `dist`, change it to
the repository root so Vercel can discover the API functions.

## 3. Add environment variables before deployment

Enter these under the project's **Environment Variables**. Enable **Production**
and **Preview** if you want AI in both. The values preserve the previous Worker
configuration; you can change models later without editing frontend code.

| Variable | Value |
| --- | --- |
| `GEMINI_API_KEY` | Your private Gemini API key (required for AI) |
| `GEMINI_MODEL` | `gemini-3.5-flash` |
| `GEMINI_FALLBACK_MODEL` | `gemini-3.1-flash-lite` |
| `GEMINI_THINKING_LEVEL` | `low` |

Leave `GEMINI_THINKING_BUDGET` unset. If you later select a model that supports a
thinking budget instead of a thinking level, set the budget and remove the level.
The fallback model is optional; leave it unset to disable the second attempt.

Use your existing private key or create a replacement in Google AI Studio. A
Cloudflare secret is not copied automatically to Vercel. Do not paste the key
into chat or prefix it with `VITE_`/`NEXT_PUBLIC_`.

No `ALLOWED_ORIGINS` or frontend endpoint variable is needed. The API accepts
browser requests only from its own origin, including preview/custom domains.
After changing environment variables, redeploy for the new values to take effect.

## 4. Deploy and verify

1. Open the deployed homepage and make a decision.
2. Reload and check that the saved game resumes.
3. Open the group chat and send a question. In browser Network tools, verify
   `POST /api/chat` returns **200** with a JSON `text` field. Written fallback
   replies alone do not prove the AI is configured.
4. End a term (or resign after making a decision) and verify `POST /api/report`
   returns **200**.
5. Confirm requests go to your Vercel domain, with no `workers.dev` calls.

| API status | Meaning / action |
| --- | --- |
| 503 | Missing `GEMINI_API_KEY`; add it to this deployment's environment and redeploy |
| 502 | Gemini failed, timed out, or returned no text; check Vercel function logs, model access and Gemini quota |
| 403 | The request is not from the same origin; test through the deployed website |
| 429 | Per-instance request limit reached; wait a minute |
| 400 / 413 / 415 | Invalid JSON/payload, oversized body, or incorrect content type |
| 404 | Check Root Directory is the repository root and `api/` was pushed |

Gameplay and written responses still work when AI is unavailable. The API key
and persona source files are server-only; AI responses are not cached.

## Local development

Use Node.js 22 or newer. No `npm install` is needed for the app.

```powershell
Copy-Item .env.example .env.local
# Edit .env.local privately to add your Gemini API key.
npm.cmd run dev
```

Open `http://127.0.0.1:5174`. This server runs both the static website and the same
API handlers used on Vercel. With no key, it returns a controlled 503 for AI and
the game uses written fallbacks. Opening `dist/index.html` directly or using
Python's static HTTP server does not run the AI backend.

```powershell
npm.cmd test
npm.cmd run test:api
```

Tests mock Gemini, including overload/fallback behavior; they do not spend quota.
They also exercise both public API entry points and local HTTP request handling
in process, without opening network sockets. Live Vercel routing and Gemini access
must be checked after deployment using the checklist above.

## After the new site is verified

Share the new Vercel URL. Browser saves belong to each origin, so existing saves
on the previous domain do not automatically move. Keep the previous live site
and Worker until you have verified the new site, then retire them in their
hosting dashboards if you no longer need them. This code migration does not
delete or change any existing online deployment.

The rate limit remains best effort (20 requests/IP/minute per function instance),
not a shared counter across Vercel instances. Same-origin checks are browser
restrictions, not user authentication. For a larger public launch, configure
platform rate limits and Gemini usage controls as appropriate.

References: [Vercel static build settings](https://vercel.com/docs/builds/configure-a-build),
[Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js),
[Function regions](https://vercel.com/docs/functions/configuring-functions/region).
