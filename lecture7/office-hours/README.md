# Office Hours Demo App

A web app for managing office hours bookings. Professors define their weekly availability and students book time slots.

**Running at:** http://localhost:3001

## Usage

1. Click **Settings** in the header to define your weekly office hours (pick day, start/end time, and slot duration)
2. The calendar shows the current week with available slots in green
3. Click an available slot to book a student (name, email, topic)
4. Click a booked slot (blue) to see details or cancel

## Quick Start

```sh
npm install
npm start
```

The server starts on port 3001 by default. Set the `PORT` environment variable to override.

## Project Structure

| File | Description |
|------|-------------|
| `server.js` | Express + sql.js backend with REST API |
| `public/index.html` | Single-page app with week calendar view |
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


## Class Demo

## 1. Node: Office Hours App

```bash
# Create an SSH tunnel from port 3001 local to remote 3001
ssh -L 3001:localhost:3001 user@server

# Switch into the project directory
npm install
npm start
# Visit localhost:3001
```
