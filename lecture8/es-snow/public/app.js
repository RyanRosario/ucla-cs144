document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadMammothConditions();
  loadCrowleyWeather();
  loadForecasts();
  loadRatings();
  setupRatingForm();
  setupCorsDemo();
  setupBearerDemo();
  setupApiKeyDemo();
  setupClassDemo();
  setupWebcam();
});

// ---------------------------------------------------------------------------
// Tab navigation
// ---------------------------------------------------------------------------
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

// ---------------------------------------------------------------------------
// Mammoth Mountain conditions
// ---------------------------------------------------------------------------
async function loadMammothConditions() {
  try {
    const res = await fetch('/api/mammoth/conditions');
    const data = await res.json();

    const cc = data.CurrentConditions || {};
    setText('temp-base', cc.Base?.TemperatureF ?? '--');
    setText('cond-base', cc.Base?.Conditions || '');
    setText('temp-mid', cc.MidMountain?.TemperatureF ?? '--');
    setText('cond-mid', cc.MidMountain?.Conditions || '');
    setText('temp-summit', cc.Summit?.TemperatureF ?? '--');
    setText('cond-summit', cc.Summit?.Conditions || '');

    const sr = data.SnowReport || {};
    setText('lifts-open', sr.TotalOpenLifts ?? '--');
    setText('lifts-total', `of ${sr.TotalLifts ?? '?'}`);
    setText('trails-open', sr.TotalOpenTrails ?? '--');
    setText('trails-total', `of ${sr.TotalTrails ?? '?'}`);
    setText('parks-open', sr.TotalOpenParks ?? '--');
    setText('parks-total', `of ${sr.TotalParks ?? '?'} parks / ${sr.TotalParkFeatures ?? '?'} features`);

    const snowEl = document.getElementById('snow-report');
    snowEl.innerHTML = `<dl>
      <dt>Base Depth</dt><dd>${sr.SnowBaseRangeIn || '--'}&Prime;</dd>
      <dt>24-hr Snowfall</dt><dd>${sr.BaseArea?.Last24HoursIn ?? '--'}&Prime;</dd>
      <dt>48-hr Snowfall</dt><dd>${sr.BaseArea?.Last48HoursIn ?? '--'}&Prime;</dd>
      <dt>Season Total</dt><dd>${sr.SeasonTotalIn ?? '--'}&Prime;</dd>
      <dt>Conditions</dt><dd>${sr.BaseConditions || '--'}</dd>
      <dt>Open Terrain</dt><dd>${sr.OpenTerrainAcres ?? '--'} / ${sr.TotalTerrainAcres ?? '--'} acres</dd>
    </dl>`;
  } catch (err) {
    console.error('Failed to load Mammoth conditions:', err);
    setText('temp-base', 'ERR');
    setText('temp-mid', 'ERR');
    setText('temp-summit', 'ERR');
  }
}

// ---------------------------------------------------------------------------
// Webcam refresh
// ---------------------------------------------------------------------------
function setupWebcam() {
  document.getElementById('refresh-cam').addEventListener('click', () => {
    const img = document.getElementById('webcam-img');
    img.src = `/api/mammoth/webcam?t=${Date.now()}`;
  });
}

// ---------------------------------------------------------------------------
// Crowley Lake weather station
// ---------------------------------------------------------------------------
async function loadCrowleyWeather() {
  try {
    const res = await fetch('/api/crowley/current');
    const data = await res.json();

    if (data.source === 'wunderground') {
      renderWunderground(data);
    } else if (data.source === 'openmeteo') {
      renderOpenMeteo(data);
    } else {
      setText('cw-temp', 'N/A');
    }
  } catch (err) {
    console.error('Failed to load Crowley weather:', err);
    setText('cw-temp', 'ERR');
  }
}

function renderWunderground(data) {
  const obs = data.observations?.[0];
  if (!obs) { setText('cw-temp', 'N/A'); return; }
  const imp = obs.imperial || {};
  setText('cw-temp', imp.temp ?? '--');
  setText('cw-wind', imp.windSpeed ?? '--');
  setText('cw-wind-dir', obs.winddir != null ? `${degToCompass(obs.winddir)} (${obs.winddir}&deg;)` : '');
  setText('cw-humidity', obs.humidity ?? '--');

  const tbody = document.querySelector('#crowley-details tbody');
  tbody.innerHTML = detailRow('Source', 'Weather Underground PWS')
    + detailRow('Heat Index', `${imp.heatIndex ?? '--'}&deg;F`)
    + detailRow('Dew Point', `${imp.dewpt ?? '--'}&deg;F`)
    + detailRow('Wind Chill', `${imp.windChill ?? '--'}&deg;F`)
    + detailRow('Wind Gust', `${imp.windGust ?? '--'} mph`)
    + detailRow('Pressure', `${imp.pressure ?? '--'} inHg`)
    + detailRow('Precip Rate', `${imp.precipRate ?? '--'} in/hr`)
    + detailRow('Precip Today', `${imp.precipTotal ?? '--'} in`)
    + detailRow('Solar Radiation', `${obs.solarRadiation ?? '--'} W/m&sup2;`)
    + detailRow('UV Index', obs.uv ?? '--')
    + detailRow('Elevation', `${imp.elev ?? '--'} ft`);

  const time = obs.obsTimeLocal || obs.obsTimeUtc;
  if (time) setText('cw-updated', `Last updated: ${time}`);
}

function renderOpenMeteo(data) {
  const c = data.current || {};
  setText('cw-temp', c.temperature_2m != null ? Math.round(c.temperature_2m) : '--');
  setText('cw-wind', c.wind_speed_10m != null ? Math.round(c.wind_speed_10m) : '--');
  setText('cw-wind-dir', c.wind_direction_10m != null ? `${degToCompass(c.wind_direction_10m)} (${c.wind_direction_10m}&deg;)` : '');
  setText('cw-humidity', c.relative_humidity_2m ?? '--');

  const tbody = document.querySelector('#crowley-details tbody');
  tbody.innerHTML = detailRow('Source', 'Open-Meteo (WU key not configured)')
    + detailRow('Wind Gust', `${c.wind_gusts_10m != null ? Math.round(c.wind_gusts_10m) : '--'} mph`)
    + detailRow('Pressure', `${c.surface_pressure != null ? (c.surface_pressure * 0.02953).toFixed(2) : '--'} inHg`)
    + detailRow('Precipitation', `${c.precipitation ?? '--'} in`);

  if (c.time) setText('cw-updated', `Last updated: ${c.time} (via Open-Meteo)`);
}

function degToCompass(d) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(d / 22.5) % 16];
}

function detailRow(label, val) {
  return `<tr><td>${label}</td><td>${val}</td></tr>`;
}

// ---------------------------------------------------------------------------
// Forecasts (NWS)
// ---------------------------------------------------------------------------
async function loadForecasts() {
  const locations = ['mammoth-mountain', 'mammoth-lakes', 'crowley-lake'];
  const fetches = locations.map(loc =>
    fetch(`/api/forecast/${loc}`)
      .then(r => r.json())
      .then(data => ({ loc, data }))
      .catch(() => ({ loc, data: null }))
  );
  const results = await Promise.all(fetches);

  for (const { loc, data } of results) {
    const el = document.getElementById(`fc-${loc}`);
    if (!data || !data.properties?.periods) {
      el.textContent = 'Forecast unavailable';
      continue;
    }
    const periods = data.properties.periods.slice(0, 6);
    el.innerHTML = periods.map(p => `
      <div class="fc-period">
        <div class="fc-name">${p.name}</div>
        <div class="fc-temp">${p.temperature}&deg;${p.temperatureUnit}</div>
        <div class="fc-detail">${p.shortForecast} &mdash; Wind ${p.windSpeed} ${p.windDirection}</div>
      </div>
    `).join('');
  }
}

// ---------------------------------------------------------------------------
// Rating form (POST with rate limiting)
// ---------------------------------------------------------------------------
function setupRatingForm() {
  let selectedRating = 0;
  const stars = document.querySelectorAll('.star');
  const hiddenInput = document.getElementById('rating-val');

  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = Number(star.dataset.val);
      hiddenInput.value = selectedRating;
      stars.forEach(s => {
        s.classList.remove('hover-preview');
        s.classList.toggle('active', Number(s.dataset.val) <= selectedRating);
      });
    });
    star.addEventListener('mouseenter', () => {
      const hoverVal = Number(star.dataset.val);
      stars.forEach(s => {
        s.classList.toggle('hover-preview', Number(s.dataset.val) <= hoverVal && !s.classList.contains('active'));
      });
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover-preview'));
    });
  });

  document.getElementById('rating-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('rating-msg');
    if (!selectedRating) { msgEl.textContent = 'Select a star rating first.'; msgEl.className = 'msg error'; return; }

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          comment: document.getElementById('rating-comment').value,
        }),
      });
      const data = await res.json();

      if (res.status === 429) {
        msgEl.textContent = data.error;
        msgEl.className = 'msg error';
        return;
      }
      if (!res.ok) {
        msgEl.textContent = data.error || 'Submission failed';
        msgEl.className = 'msg error';
        return;
      }

      msgEl.textContent = 'Rating submitted!';
      msgEl.className = 'msg success';
      document.getElementById('rating-comment').value = '';
      loadRatings();
    } catch (err) {
      msgEl.textContent = 'Network error';
      msgEl.className = 'msg error';
    }
  });
}

async function loadRatings() {
  try {
    const res = await fetch('/api/ratings');
    const list = await res.json();
    const el = document.getElementById('ratings-list');
    if (!list.length) { el.textContent = 'No ratings yet.'; return; }
    el.innerHTML = list.slice().reverse().map(r => `
      <div class="rating-entry">
        <span class="re-stars">${'&#9733;'.repeat(r.rating)}${'&#9734;'.repeat(5 - r.rating)}</span>
        <span class="re-comment">${escHtml(r.comment) || '<em>No comment</em>'}</span>
        <span class="re-time">${new Date(r.timestamp).toLocaleTimeString()}</span>
      </div>
    `).join('');
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// CORS Demo
// ---------------------------------------------------------------------------
function setupCorsDemo() {
  const resultBox = document.getElementById('cors-result');

  document.getElementById('cors-direct').addEventListener('click', async () => {
    resultBox.className = 'result-box';
    resultBox.textContent = 'Fetching directly from https://www.mammothmountain.com/ ...';
    try {
      const res = await fetch('https://www.mammothmountain.com/');
      const data = await res.text();
      resultBox.textContent = 'Unexpected success (check console):\n' + data.slice(0, 300);
      resultBox.className = 'result-box success-text';
    } catch (err) {
      resultBox.textContent =
        `CORS ERROR!\n\n${err}\n\n` +
        'The browser blocked this request because the external server\n' +
        'did not include an Access-Control-Allow-Origin header.\n\n' +
        'Solution: proxy the request through our own server\n' +
        '(click "Fetch via Server Proxy").';
      resultBox.className = 'result-box error-text';
    }
  });

  document.getElementById('cors-proxy').addEventListener('click', async () => {
    resultBox.className = 'result-box';
    resultBox.textContent = 'Fetching via /api/mammoth/conditions (server proxy)...';
    try {
      const res = await fetch('/api/mammoth/conditions');
      const data = await res.json();
      const summary = {
        resort: data.ResortName,
        baseTempF: data.CurrentConditions?.Base?.TemperatureF,
        summitTempF: data.CurrentConditions?.Summit?.TemperatureF,
        openLifts: data.SnowReport?.TotalOpenLifts,
        openTrails: data.SnowReport?.TotalOpenTrails,
      };
      resultBox.textContent =
        'SUCCESS via server proxy!\n\n' + JSON.stringify(summary, null, 2) +
        '\n\nThe server fetched the data on our behalf — no CORS issue.';
      resultBox.className = 'result-box success-text';
    } catch (err) {
      resultBox.textContent = `Error: ${err}`;
      resultBox.className = 'result-box error-text';
    }
  });
}

// ---------------------------------------------------------------------------
// Bearer Token Demo
// ---------------------------------------------------------------------------
function setupBearerDemo() {
  const resultBox = document.getElementById('bearer-result');

  document.getElementById('bearer-no-auth').addEventListener('click', async () => {
    resultBox.className = 'result-box';
    resultBox.textContent = 'Fetching /api/secret-report with NO Authorization header...';
    try {
      const res = await fetch('/api/secret-report');
      const data = await res.json();
      resultBox.textContent = `HTTP ${res.status}\n\n${JSON.stringify(data, null, 2)}`;
      resultBox.className = res.ok ? 'result-box success-text' : 'result-box error-text';
    } catch (err) {
      resultBox.textContent = `Error: ${err}`;
      resultBox.className = 'result-box error-text';
    }
  });

  document.getElementById('bearer-fetch').addEventListener('click', async () => {
    const token = document.getElementById('bearer-input').value.trim();
    resultBox.className = 'result-box';
    resultBox.textContent = `Fetching /api/secret-report with Authorization: Bearer ${token || '(empty)'}...`;
    try {
      const res = await fetch('/api/secret-report', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      resultBox.textContent = `HTTP ${res.status}\n\n${JSON.stringify(data, null, 2)}`;
      resultBox.className = res.ok ? 'result-box success-text' : 'result-box error-text';
    } catch (err) {
      resultBox.textContent = `Error: ${err}`;
      resultBox.className = 'result-box error-text';
    }
  });
}

// ---------------------------------------------------------------------------
// API Key Demo
// ---------------------------------------------------------------------------
function setupApiKeyDemo() {
  const resultBox = document.getElementById('apikey-result');

  document.getElementById('apikey-no-key').addEventListener('click', async () => {
    resultBox.className = 'result-box';
    resultBox.textContent = 'Fetching /api/snow-quality with NO API key...';
    try {
      const res = await fetch('/api/snow-quality');
      const data = await res.json();
      resultBox.textContent = `HTTP ${res.status}\n\n${JSON.stringify(data, null, 2)}`;
      resultBox.className = res.ok ? 'result-box success-text' : 'result-box error-text';
    } catch (err) {
      resultBox.textContent = `Error: ${err}`;
      resultBox.className = 'result-box error-text';
    }
  });

  document.getElementById('apikey-fetch').addEventListener('click', async () => {
    const key = document.getElementById('apikey-input').value.trim();
    resultBox.className = 'result-box';
    resultBox.textContent = `Fetching /api/snow-quality?apiKey=${key || '(empty)'}...`;
    try {
      const res = await fetch(`/api/snow-quality?apiKey=${encodeURIComponent(key)}`);
      const data = await res.json();
      resultBox.textContent = `HTTP ${res.status}\n\n${JSON.stringify(data, null, 2)}`;
      resultBox.className = res.ok ? 'result-box success-text' : 'result-box error-text';
    } catch (err) {
      resultBox.textContent = `Error: ${err}`;
      resultBox.className = 'result-box error-text';
    }
  });
}

// ---------------------------------------------------------------------------
// Class Demo (missing endpoint)
// ---------------------------------------------------------------------------
function setupClassDemo() {
  const resultBox = document.getElementById('class-demo-result');

  document.getElementById('class-demo-btn').addEventListener('click', async () => {
    resultBox.className = 'result-box';
    resultBox.textContent = 'Fetching /api/class-demo ...';
    try {
      const res = await fetch('/api/class-demo');
      const text = await res.text();
      let display;
      try { display = JSON.stringify(JSON.parse(text), null, 2); } catch { display = text; }
      resultBox.textContent = `HTTP ${res.status}\n\n${display}`;
      resultBox.className = res.ok ? 'result-box success-text' : 'result-box error-text';
    } catch (err) {
      resultBox.textContent = `Error: ${err}`;
      resultBox.className = 'result-box error-text';
    }
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = String(val);
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
