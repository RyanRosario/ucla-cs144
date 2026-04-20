# Office Hours (Session History Edition)

A web app for managing office hours bookings. Professors define their weekly availability and students book time slots.

This version extends the original app with **HTML5 Session History API** support so that the browser back button, forward button, and page refresh all work correctly within the single-page app.

**Running at:** http://localhost:3001

## How This Version Differs from the Original

The original app kept all navigation state in JavaScript variables. The URL never changed as users clicked through weeks or opened the settings panel. This caused three problems:

1. **Back/forward buttons did nothing.** Pressing back would leave the app entirely instead of returning to the previously viewed week.
2. **Refreshing the page always reset to the current week.** Any navigation to a past or future week was lost on reload.
3. **URLs were not shareable.** There was no way to send someone a link to a specific week's schedule.

### What changed

All changes are in `public/index.html` (no server changes were needed). The app now uses `history.pushState()` and the `popstate` event to synchronize the URL with the app's navigation state:

- **`?week=YYYY-MM-DD` query parameter** — Tracks which week is displayed. When viewing the current week the parameter is omitted, keeping the URL clean.
- **`?settings=1` query parameter** — Tracks whether the settings panel is open.
- **`history.pushState()`** is called by `changeWeek()`, `goToToday()`, and `toggleSettings()` so each navigation action creates a new browser history entry.
- **`popstate` event listener** — When the user presses back or forward, the handler reads the stored state object and restores the correct week and settings panel visibility without a page reload.
- **`history.replaceState()`** is called on initial page load to seed the first history entry (so the browser has state to return to).
- **State restoration on load** — On page load, `getStateFromUrl()` parses the current URL's query parameters and restores the app to the correct week and panel state. This makes refresh work and makes URLs like `/?week=2026-03-30` directly linkable.

### Key functions added

| Function | Purpose |
|----------|---------|
| `getStateFromUrl()` | Parses `?week=` and `?settings=` from the current URL |
| `buildUrl(monday, settingsOpen)` | Constructs a URL string from app state |
| `currentState()` | Reads the live DOM/JS state into a serializable object |
| `pushState()` | Calls `history.pushState()` with current state and URL |
| `replaceState()` | Calls `history.replaceState()` (used on initial load) |
| `applyState(state)` | Restores the app to a given state object (used by `popstate`) |

## Usage

1. Click **Settings** in the header to define your weekly office hours (pick day, start/end time, and slot duration)
2. The calendar shows the current week with available slots in green
3. Click an available slot to book a student (name, email, topic)
4. Click a booked slot (blue) to see details or cancel
5. Use the browser back/forward buttons to navigate between previously viewed weeks
6. Refresh the page at any time — the current view is preserved
7. Share a URL like `/?week=2026-04-13&settings=1` to link directly to a specific week with settings open

## Quick Start

```sh
cd office_hours_history
npm install
npm start
```

The server starts on port 3001 by default. Set the `PORT` environment variable to override.

## Project Structure

| File | Description |
|------|-------------|
| `server.js` | Express + sql.js backend with REST API |
| `public/index.html` | Single-page app with week calendar, booking modal, and Session History integration |
| `package.json` | Dependencies (Express, sql.js, better-sqlite3) |
| `office_hours.db` | SQLite database (created automatically on first run) |

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/office-hours` | List all office hour blocks |
| POST | `/api/office-hours` | Create an office hour block |
| DELETE | `/api/office-hours/:id` | Delete an office hour block |
| GET | `/api/slots?week=YYYY-MM-DD` | Get slots for the week starting on the given Monday |
| POST | `/api/bookings` | Book a slot |
| DELETE | `/api/bookings/:id` | Cancel a booking |

## For Class Demo

```bash
ssh -L 3001:localhost:3001 user@server

npm install
npm start
# Visit localhost:3001
```

### What to Demo

All the History API code lives in `public/index.html`. The server (`server.js`) was not changed at all.

Within the HTML file,show:

1. **Lines 370–435** — The new Session History block: `getStateFromUrl()`, `buildUrl()`, `pushState()`, `replaceState()`, `applyState()`, and the `popstate` listener. This is the core of the lesson.
2. **Lines 471–474** — `changeWeek()` calling `pushState()` (one-line addition, easy to see the pattern).
3. **Lines 477–480** — `goToToday()` doing the same.
4. **Lines 506–511** — `toggleSettings()` doing the same.
5. **Lines 711–719** — The init block that restores state from the URL on page load (makes refresh work).

### The pattern

The original app stored state only in JS variables. We added `pushState`/`replaceState` to mirror that state into the URL. We added a `popstate` listener to restore state when the user navigates back/forward. We parse the URL on load so refresh and shared links work.
