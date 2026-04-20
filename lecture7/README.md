# CS 144 Lecture 7 Demos

Three demos covering Node/Express apps, the HTML5 Session History API, and Vite Hot Module Replacement.

## Running with pm2

Install pm2 globally if you haven't already:

```bash
npm install -g pm2
```

Install dependencies and start the app:

```bash
npm install
# -- separates pm2 args from npm args, so "start" is passed to npm
pm2 start npm --name name_the_app -- start
```

Useful pm2 commands:

| Command | Description |
|---------|-------------|
| `pm2 list` | Show all managed processes |
| `pm2 logs` | Tail all logs |
| `pm2 stop app` | Stop by name |
| `pm2 restart app` | Restart |
| `pm2 reload app` | Reload (zero-downtime) |
| `pm2 save` | Save current state for reboot |

## 1. Office Hours App (`office-hours/`)

A web app for managing office hours bookings built with Express and SQLite. Professors define weekly availability and students book time slots through a calendar UI.

See [`office-hours/README.md`](office-hours/README.md) for API docs and project structure.

## 2. Office Hours — Session History Edition (`office-hours-history/`)

The same office hours app, extended with the **HTML5 Session History API** (`pushState`, `replaceState`, `popstate`) so that the browser back/forward buttons, page refresh, and shareable URLs all work correctly within the single-page app.

See [`office-hours-history/README.md`](office-hours-history/README.md) for full details.

## 3. Vite HMR Demo

Live-coded in class to demonstrate Hot Module Replacement — the dev server pushes updated modules to the browser without a full page reload.
