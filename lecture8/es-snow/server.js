import express from 'express';
import { config } from 'dotenv';
config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// ---------------------------------------------------------------------------
// Mammoth Mountain conditions – proxy to mtnpowder.com JSON feed
// ---------------------------------------------------------------------------
app.get('/api/mammoth/conditions', async (req, res) => {
  try {
    const r = await fetch('https://www.mtnpowder.com/feed?resortId=60');
    const data = await r.json();
    res.json(data);
  } catch {
    res.status(502).json({ error: 'Failed to fetch mountain conditions' });
  }
});

// ---------------------------------------------------------------------------
// Summit webcam image proxy (avoids referrer/hotlink issues)
// ---------------------------------------------------------------------------
app.get('/api/mammoth/webcam', async (req, res) => {
  try {
    const url = `https://media.mammothresorts.com/mmsa/mammoth/cams/Top_Of_Sierra_1_1280x720.jpg?t=${Date.now()}`;
    const r = await fetch(url);
    const buf = Buffer.from(await r.arrayBuffer());
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'no-cache');
    res.send(buf);
  } catch {
    res.status(502).json({ error: 'Failed to fetch webcam image' });
  }
});

// ---------------------------------------------------------------------------
// Crowley Lake weather station – Weather Underground PWS API
// Falls back to Open-Meteo if WU key is invalid
// ---------------------------------------------------------------------------
app.get('/api/crowley/current', async (req, res) => {
  try {
    const { WU_STATION_ID, WU_API_KEY } = process.env;
    const url = `https://api.weather.com/v2/pws/observations/current?stationId=${WU_STATION_ID}&format=json&units=e&apiKey=${WU_API_KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    if (data.observations) return res.json({ source: 'wunderground', ...data });
  } catch { /* fall through to Open-Meteo */ }

  try {
    const url = 'https://api.open-meteo.com/v1/forecast'
      + '?latitude=37.5652&longitude=-118.7298'
      + '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,precipitation'
      + '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch';
    const r = await fetch(url);
    const data = await r.json();
    res.json({ source: 'openmeteo', ...data });
  } catch {
    res.status(502).json({ error: 'Failed to fetch weather data from any source' });
  }
});

// ---------------------------------------------------------------------------
// NWS forecast proxy
// ---------------------------------------------------------------------------
const NWS_LOCATIONS = {
  'mammoth-mountain': { lat: 37.6308, lon: -119.0326 },
  'mammoth-lakes':    { lat: 37.6485, lon: -118.9721 },
  'crowley-lake':     { lat: 37.5652, lon: -118.7298 },
};

app.get('/api/forecast/:location', async (req, res) => {
  const coords = NWS_LOCATIONS[req.params.location];
  if (!coords) return res.status(404).json({ error: 'Unknown location' });
  try {
    const hdrs = { 'User-Agent': 'CS144-EasternSierraDashboard' };
    const pts = await (await fetch(
      `https://api.weather.gov/points/${coords.lat},${coords.lon}`, { headers: hdrs }
    )).json();
    const fc = await (await fetch(pts.properties.forecast, { headers: hdrs })).json();
    res.json(fc);
  } catch {
    res.status(502).json({ error: 'Failed to fetch forecast' });
  }
});

// ---------------------------------------------------------------------------
// Snow-condition ratings – POST with rate limiting
// 5 requests per 10 s window, then 429 + 5 s cooldown
// ---------------------------------------------------------------------------
const ratings = [];
const rateLimits = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimits.has(ip)) rateLimits.set(ip, { ts: [], cooldownUntil: 0 });
  const rec = rateLimits.get(ip);

  if (now < rec.cooldownUntil) {
    return { allowed: false };
  }

  rec.ts = rec.ts.filter(t => now - t < 10_000);

  if (rec.ts.length >= 5) {
    rec.cooldownUntil = now + 5_000;
    return { allowed: false };
  }

  rec.ts.push(now);
  return { allowed: true };
}

app.post('/api/ratings', (req, res) => {
  const check = checkRateLimit(req.ip);
  if (!check.allowed) {
    return res.status(429).json({ error: 'Too many requests, try again in 5 seconds' });
  }

  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const entry = {
    id: ratings.length + 1,
    rating: Number(rating),
    comment: comment || '',
    timestamp: new Date().toISOString(),
  };
  ratings.push(entry);
  res.status(201).json(entry);
});

app.get('/api/ratings', (_req, res) => res.json(ratings));

// ---------------------------------------------------------------------------
// Bearer-token-protected endpoint
// ---------------------------------------------------------------------------
app.get('/api/secret-report', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized – include header  Authorization: Bearer <token>',
    });
  }
  if (auth.split(' ')[1] !== process.env.BEARER_TOKEN) {
    return res.status(403).json({ error: 'Forbidden – invalid token' });
  }
  res.json({
    secretReport: {
      bestRun: 'Cornice Bowl – steep, soft, and uncrowded today',
      snowQuality: 'Hero snow: spring corn on south faces, powder stashes on north',
      crowdLevel: 'Low – midweek advantage',
      insiderTip: 'Chair 14 has the shortest lines before 10 AM',
    },
  });
});

// ---------------------------------------------------------------------------
// API-key-protected endpoint
// ---------------------------------------------------------------------------
app.get('/api/snow-quality', (req, res) => {
  const key = req.query.apiKey;
  if (!key) {
    return res.status(401).json({
      error: 'Missing API key – add ?apiKey=YOUR_KEY to the request',
    });
  }
  if (key !== process.env.API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  res.json({
    qualityIndex: 8.5,
    surface: 'Machine-groomed packed powder with soft spring corn after 10 AM',
    depthBase: '41 inches',
    depthSummit: '121 inches',
    recommendation: 'Get first tracks on groomed blues, switch to north-facing steeps by noon',
  });
});

// ---------------------------------------------------------------------------
// /api/class-demo intentionally does NOT exist – will be created live in class
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Eastern Sierra Dashboard  →  http://localhost:${PORT}`);
});
