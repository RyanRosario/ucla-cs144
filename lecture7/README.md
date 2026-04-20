# CS 144 Lecture 7 Demos

Three demos covering Node/Express apps, the HTML5 Session History API, and Vite Hot Module Replacement.

## 1. Office Hours App (`office_hours/`)

A web app for managing office hours bookings built with Express and SQLite. Professors define weekly availability and students book time slots through a calendar UI.

See [`office_hours/README.md`](office_hours/README.md) for API docs and project structure.

## 2. Office Hours — Session History Edition (`office_hours_history/`)

The same office hours app, extended with the **HTML5 Session History API** (`pushState`, `replaceState`, `popstate`) so that the browser back/forward buttons, page refresh, and shareable URLs all work correctly within the single-page app.

See [`office_hours_history/README.md`](office_hours_history/README.md) for full details.

## 3. Vite HMR Demo

Live-coded in class to demonstrate Hot Module Replacement — the dev server pushes updated modules to the browser without a full page reload.
