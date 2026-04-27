# Eastern Sierra Snow Dashboard — CS144 Lecture 8 Demo

A live web app showing real-time conditions at Mammoth Mountain and Crowley Lake,
built to demonstrate key web-technology concepts in class: CORS, `fetch`, POST
requests, rate limiting (429), Bearer tokens, API keys, and working with
endpoints that don't exist yet.

---

## In-Class Demo Script

Follow these steps in order during the lecture. Each one builds on the previous
and maps to a concept in the slides.

### 1. Start the app and show the "Mountain Conditions" tab

```
npm start          # or: pm2 start server.js --name lecture8
```

Open `http://localhost:3000` in a browser (or your public domain if behind
Nginx).

**What to point out:**

- All data on this page came from **`fetch()`** calls in `public/app.js`.
- The temperatures, lift/trail/park counts, and snow report are pulled from the
  Mammoth Mountain JSON feed at `mtnpowder.com/feed?resortId=60`.
- The summit webcam image is proxied through our own server (`/api/mammoth/webcam`)
  to avoid referrer/hotlink blocks.
- Open DevTools → Network tab to show the fetch requests firing on page load.

### 2. Switch to the "Crowley Lake Weather" tab

- Show the current temperature, wind, and humidity for the Crowley Lake Fishcamp
  weather station (KCAMAMMO76).
- If using the Open-Meteo fallback (because the WU API key hasn't been set up
  yet), the Source row in the Details table will say so — use this to segue into
  the concept of API keys and why they belong in `.env`, not in client code.

### 3. Switch to the "Forecasts" tab

- Three NWS forecasts load in parallel via `Promise.all`.
- Open DevTools → Network to show three concurrent requests to
  `/api/forecast/mammoth-mountain`, `/api/forecast/mammoth-lakes`, and
  `/api/forecast/crowley-lake`.

### 4. Demonstrate CORS failure — "API Demos" tab

This is the most visual demo. Open DevTools → Console **before** clicking.

1. Click **"Fetch Directly (CORS Error)"**.
   - The browser tries `fetch('https://www.mammothmountain.com/')`
     directly from the frontend.
   - The request is blocked — the external server does not send an
     `Access-Control-Allow-Origin` header.
   - The red error box shows the `TypeError: Failed to fetch` message.
   - In the Console you'll see the full CORS error:
     ```
     Access to fetch at 'https://www.mammothmountain.com/' from origin
     'http://localhost:3000' has been blocked by CORS policy: No
     'Access-Control-Allow-Origin' header is present on the requested resource.
     ```
2. Click **"Fetch via Server Proxy"**.
   - This calls our own `/api/mammoth/conditions`, which fetches the same data
     server-side and relays it.
   - Success — the green box shows a summary.
3. **Explain:** The browser enforces the Same-Origin Policy on `fetch`.
   Our server is not a browser, so it can call any URL. The
   proxy pattern is the standard workaround when you don't control the external
   server's CORS headers.

### 5. Demonstrate Bearer Token auth — "API Demos" tab

1. Click **"Try Without Token"**.
   - The app calls `fetch('/api/secret-report')` with no `Authorization` header.
   - Result: `HTTP 401` — "Unauthorized".
2. Type a **wrong token** (e.g. `wrong`) and click **"Fetch Secret Report"**.
   - Sends `Authorization: Bearer wrong`.
   - Result: `HTTP 403` — "Forbidden – invalid token".
3. Type the **correct token** `cs144-secret-token-2026` and click again.
   - Result: `HTTP 200` — the secret insider snow report appears in green.
4. **Explain:** The `Authorization: Bearer <token>` header is how OAuth 2.0 and
   most modern APIs authenticate requests. Tokens are issued by a login flow and
   sent on every subsequent request.

### 6. Demonstrate API Key auth — "API Demos" tab

1. Click **"Try Without Key"**.
   - Calls `fetch('/api/snow-quality')` with no query parameter.
   - Result: `HTTP 401` — "Missing API key".
2. Type a **wrong key** and click **"Fetch Snow Quality"**.
   - Result: `HTTP 403` — "Invalid API key".
3. Type the **correct key** `mammoth-powder-key-2026` and click again.
   - Result: `HTTP 200` — snow quality data.
4. **Explain:** API keys are simpler than Bearer tokens — they identify the
   *application* rather than the *user*. They're typically sent as a query
   parameter (`?apiKey=...`) or in a header (`X-API-Key: ...`). Services like
   Weather Underground, Google Maps, and OpenAI use this model.

### 7. Demonstrate rate limiting (429) — "Rate the Snow" tab

1. Select a star rating and submit. It works — `HTTP 201`.
2. Click **Submit Rating** rapidly — 5 times within 10 seconds.
3. On the 6th click the red error message appears:
   **"Too many requests, try again in 5 seconds"**
4. Wait 5 seconds and submit again — it works.
5. **Explain:** The server tracks requests per IP in a rolling 10-second window.
   After 5 requests, it returns `HTTP 429 Too Many Requests` and imposes a
   5-second cooldown. This protects the server from abuse. Show the
   `checkRateLimit()` function in `server.js`.

### 8. Demonstrate the missing endpoint — "API Demos" tab

1. Click **"Fetch /api/class-demo"**.
   - Result: `HTTP 404` — `Cannot GET /api/class-demo`.
2. **Now open `server.js` in your editor** and add a route live.
   The solution is provided below — type it out or paste it in.
3. Restart the server (or use `npm run dev` for auto-reload).
4. Click the button again — `HTTP 200`, data appears.
5. **Explain:** Building an API endpoint is this simple with Express. The
   frontend code didn't change at all — it was already written to call this URL.
   Frontend and backend development can happen in parallel when the API contract
   is agreed upon in advance.

#### Solution: `/api/class-demo` endpoint

Add the following to `server.js` (just above `app.listen`):

```js
// ---------------------------------------------------------------------------
// Class demo — created live during lecture
// ---------------------------------------------------------------------------
app.get('/api/class-demo', (req, res) => {
  res.json({
    message: 'Hello from the live demo!',
    lecture: 'CS144 — Lecture 8',
    topic: 'Building REST endpoints with Express',
    timestamp: new Date().toISOString(),
    query: req.query,
  });
});
```

**Stretch version** — after showing the basic endpoint, extend it to accept a
query parameter and echo it back, so you can demonstrate how the frontend can
pass data via the URL:

```js
app.get('/api/class-demo', (req, res) => {
  const name = req.query.name || 'World';
  res.json({
    greeting: `Hello, ${name}!`,
    tip: 'Try adding ?name=YourName to the URL',
    timestamp: new Date().toISOString(),
  });
});
```

Then update the frontend button in `public/app.js` to send a name:

```js
const res = await fetch('/api/class-demo?name=CS144');
```

This shows how query parameters flow from the browser URL through `fetch` into
`req.query` on the server.

---

## Quick Start

```bash
cd lecture8
cp .env.template .env       # then edit .env with your keys
npm install
npm start                    # http://localhost:3000
```

For auto-reload during development:

```bash
npm run dev
```

---

## Environment Variables (.env)

Copy `.env.template` to `.env` and fill in the values:

```bash
cp .env.template .env
```

| Variable        | Description                                                 |
|-----------------|-------------------------------------------------------------|
| `WU_API_KEY`    | Weather Underground data-read API key (see below)           |
| `WU_STATION_ID` | PWS station ID — default `KCAMAMMO76`                      |
| `BEARER_TOKEN`  | Token for the `/api/secret-report` demo — any string works |
| `API_KEY`       | Key for the `/api/snow-quality` demo — any string works     |
| `PORT`          | Server port — default `3000`                                |

### Getting a Weather Underground API Key

The station upload key (e.g. `Mf1kpkVD`) is **not** the data-read API key.
To actually read PWS data from Weather Underground:

1. Go to <https://www.wunderground.com/member/api-keys>
2. Sign in (or create an account).
3. Click **"Purchase Key"** — the free tier ("Anvil Plan") allows up to
   1,500 calls/day at no cost.
4. Copy the generated key (it will look like a 32-character hex string).
5. Paste it into your `.env` file as `WU_API_KEY`.

If the key is missing or invalid the app automatically falls back to
[Open-Meteo](https://open-meteo.com/) for Crowley Lake weather (free, no key
required, but not your specific PWS station data).

---

## Project Structure

```
lecture8/
  server.js           Express backend — API proxies, auth, rate limiting
  .env                Secret keys (git-ignored)
  .env.template       Template with instructions
  .gitignore          Ignores node_modules/ and .env
  package.json        Dependencies and scripts
  public/
    index.html        Tabbed dashboard UI
    style.css         Mountain-themed responsive styles
    app.js            All frontend logic — every data call uses fetch()
```

---

## API Endpoints

| Method | Endpoint                       | Auth          | Description                                          |
|--------|--------------------------------|---------------|------------------------------------------------------|
| GET    | `/api/mammoth/conditions`      | None          | Proxies Mammoth Mountain JSON feed (mtnpowder.com)   |
| GET    | `/api/mammoth/webcam`          | None          | Proxies summit webcam JPEG                           |
| GET    | `/api/crowley/current`         | None          | Crowley Lake weather (WU PWS, fallback: Open-Meteo)  |
| GET    | `/api/forecast/:location`      | None          | NWS forecast (`mammoth-mountain`, `mammoth-lakes`, `crowley-lake`) |
| GET    | `/api/ratings`                 | None          | List all submitted ratings                           |
| POST   | `/api/ratings`                 | None (rate limited) | Submit a snow rating — 5 req / 10 s, then 429 + 5 s cooldown |
| GET    | `/api/secret-report`           | Bearer token  | Insider snow report (requires `Authorization: Bearer <token>`) |
| GET    | `/api/snow-quality?apiKey=...` | API key       | Snow quality data (requires `?apiKey=<key>`)         |
| GET    | `/api/class-demo`              | N/A           | **Does not exist** — create it live in class         |

---

## Running with PM2

[PM2](https://pm2.keymetrics.io/) keeps the app running in the background,
restarts it on crash, and can start it on boot.

### Install PM2

```bash
npm install -g pm2
```

### Start the app

```bash
cd /path/to/lecture8
pm2 start server.js --name lecture8
```

### Useful PM2 commands

```bash
pm2 list                  # show running processes
pm2 logs lecture8          # tail the logs
pm2 restart lecture8       # restart after code changes
pm2 stop lecture8          # stop without removing
pm2 delete lecture8        # stop and remove from PM2
```

### Start on boot

```bash
pm2 startup               # generates a system-specific startup command — run what it prints
pm2 save                   # saves the current process list so it restores after reboot
```

### Using an ecosystem file (optional)

Create `ecosystem.config.cjs` for repeatable deploys:

```js
module.exports = {
  apps: [{
    name: 'lecture8',
    script: 'server.js',
    cwd: '/path/to/lecture8',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

Then:

```bash
pm2 start ecosystem.config.cjs
```

---

## Nginx Reverse Proxy

Nginx sits in front of the Node app, handles TLS, and forwards requests to
`localhost:3000`.

### Install Nginx

```bash
# Debian / Ubuntu
sudo apt update && sudo apt install nginx

# RHEL / Fedora
sudo dnf install nginx
```

### Create a site config

Create `/etc/nginx/sites-available/lecture8`:

```nginx
server {
    listen 80;
    server_name your-domain.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (if you add it later)
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/lecture8 /etc/nginx/sites-enabled/
sudo nginx -t            # test the config
sudo systemctl reload nginx
```

### Add HTTPS with Let's Encrypt (recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example.com
```

Certbot will modify the Nginx config to redirect HTTP to HTTPS and install the
TLS certificate. It also sets up auto-renewal.

### Verify

```bash
curl -I https://your-domain.example.com
# Should return HTTP/2 200 with the proxied Express response
```

---

## Concepts Demonstrated

| Concept                   | Where in the app                                       |
|---------------------------|--------------------------------------------------------|
| `fetch()` API             | Every data call in `public/app.js`                     |
| CORS failure + fix        | API Demos tab — direct fetch vs. server proxy          |
| POST request              | Rate the Snow tab — `fetch('/api/ratings', { method: 'POST', ... })` |
| Rate limiting / HTTP 429  | POST `/api/ratings` — 5 per 10 s, then 429 + 5 s cooldown |
| Bearer token auth         | API Demos tab — `Authorization: Bearer <token>` header |
| API key auth              | API Demos tab — `?apiKey=...` query parameter          |
| Server-side proxy         | All `/api/*` routes proxy external APIs                |
| Missing / future endpoint | API Demos tab — `/api/class-demo` returns 404 until created live |
| Parallel async requests   | Forecasts tab — `Promise.all` for 3 NWS forecasts     |
| Environment variables     | `.env` keeps secrets out of source code                |
