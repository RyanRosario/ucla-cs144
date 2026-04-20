const express = require("express");
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, "office_hours.db");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let db;

function saveDb() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS office_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      slot_duration INTEGER NOT NULL DEFAULT 15,
      location TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      student_name TEXT NOT NULL,
      student_email TEXT DEFAULT '',
      topic TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(date, start_time)
    )
  `);

  saveDb();
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function runSql(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

// --- Office Hours CRUD ---

app.get("/api/office-hours", (req, res) => {
  const rows = queryAll("SELECT * FROM office_hours ORDER BY day_of_week, start_time");
  res.json(rows);
});

app.post("/api/office-hours", (req, res) => {
  const { day_of_week, start_time, end_time, slot_duration, location } = req.body;
  if (day_of_week == null || !start_time || !end_time) {
    return res.status(400).json({ error: "day_of_week, start_time, and end_time are required" });
  }
  runSql(
    "INSERT INTO office_hours (day_of_week, start_time, end_time, slot_duration, location) VALUES (?, ?, ?, ?, ?)",
    [day_of_week, start_time, end_time, slot_duration || 15, location || ""]
  );
  const row = queryAll("SELECT last_insert_rowid() as id")[0];
  res.json({ id: row.id });
});

app.delete("/api/office-hours/:id", (req, res) => {
  runSql("DELETE FROM office_hours WHERE id = ?", [Number(req.params.id)]);
  res.json({ ok: true });
});

// --- Slots (computed from office_hours for a given week) ---

app.get("/api/slots", (req, res) => {
  const { week } = req.query;
  if (!week) return res.status(400).json({ error: "week query param required (YYYY-MM-DD of Monday)" });

  const monday = new Date(week + "T00:00:00");
  if (isNaN(monday.getTime())) return res.status(400).json({ error: "Invalid date" });

  const officeHours = queryAll("SELECT * FROM office_hours");
  const slots = [];

  for (const oh of officeHours) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + oh.day_of_week);
    const dateStr = dayDate.toISOString().slice(0, 10);

    let [h, m] = oh.start_time.split(":").map(Number);
    const [endH, endM] = oh.end_time.split(":").map(Number);
    const endMinutes = endH * 60 + endM;

    while (h * 60 + m + oh.slot_duration <= endMinutes) {
      const slotStart = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      m += oh.slot_duration;
      if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
      const slotEnd = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      slots.push({
        date: dateStr,
        start_time: slotStart,
        end_time: slotEnd,
        location: oh.location,
        day_of_week: oh.day_of_week,
      });
    }
  }

  const mondayStr = monday.toISOString().slice(0, 10);
  const sundayStr = new Date(monday.getTime() + 6 * 86400000).toISOString().slice(0, 10);
  const bookings = queryAll(
    "SELECT * FROM bookings WHERE date BETWEEN ? AND ?",
    [mondayStr, sundayStr]
  );

  const bookingMap = {};
  for (const b of bookings) {
    bookingMap[`${b.date}_${b.start_time}`] = b;
  }

  const result = slots.map((s) => {
    const key = `${s.date}_${s.start_time}`;
    const booking = bookingMap[key];
    return { ...s, booking: booking || null };
  });

  res.json(result);
});

// --- Bookings CRUD ---

app.post("/api/bookings", (req, res) => {
  const { date, start_time, end_time, student_name, student_email, topic } = req.body;
  if (!date || !start_time || !end_time || !student_name) {
    return res.status(400).json({ error: "date, start_time, end_time, and student_name are required" });
  }
  try {
    runSql(
      "INSERT INTO bookings (date, start_time, end_time, student_name, student_email, topic) VALUES (?, ?, ?, ?, ?, ?)",
      [date, start_time, end_time, student_name, student_email || "", topic || ""]
    );
    const row = queryAll("SELECT last_insert_rowid() as id")[0];
    res.json({ id: row.id });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "This slot is already booked" });
    }
    throw err;
  }
});

app.delete("/api/bookings/:id", (req, res) => {
  runSql("DELETE FROM bookings WHERE id = ?", [Number(req.params.id)]);
  res.json({ ok: true });
});

// --- Start ---

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Office Hours app running at http://localhost:${PORT}`);
  });
});
