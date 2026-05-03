# CS 144 Project 2 — Local Test Runner

This document explains how to download and run the pre-built test binary on your own machine
before submitting to Gradescope.

---

## Quick setup (macOS / Linux)

Run the included setup script from your project directory to install and verify
all prerequisites automatically:

```bash
cd /path/to/your/project
bash tests/setup_test_env.sh
```

The script checks Node.js, runs `npm install`, starts Redis and MongoDB if they
are not already running, and loads the sample database. It prints `[OK]` or
`[FAIL]` for each step and exits with a non-zero code if anything is missing.

You can skip the manual steps below and go straight to
[Download the binary](#download-the-binary) once the script exits cleanly.
On Windows, follow the manual steps below instead.

---

## Prerequisites (manual)

You must have the following installed and running **before** launching the tester.

### 1. Node.js 18 or later

Check if you already have it:
```
node --version
```

If the command is not found, install Node.js from https://nodejs.org/ or via nvm:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc          # or ~/.zshrc
nvm install --lts
```

### 2. npm dependencies installed

Inside your project directory (the folder that contains `api.js`), run:
```
npm install
```

### 3. Redis

The test runner flushes Redis between tests and uses it for caching tests.
Redis must be running on `localhost:6379`.

| Platform | Install | Start |
|---|---|---|
| macOS (Homebrew) | `brew install redis` | `brew services start redis` |
| Ubuntu / Debian | `sudo apt install redis-server` | `sudo service redis-server start` |
| Windows | Download from https://github.com/microsoftarchive/redis/releases | Run `redis-server` in a separate terminal |

Verify Redis is up:
```
redis-cli ping
```
Expected output: `PONG`

---

## Download the binary

Go to the latest GitHub Release for this repository and download the binary for your platform:

| Platform | File |
|---|---|
| Linux (x86-64) | `run_tests-linux-x86_64` |
| Linux (ARM64, e.g. Raspberry Pi) | `run_tests-linux-arm64` |
| macOS (Apple Silicon) | `run_tests-macos-arm64` |
| Windows (x86-64) | `run_tests-windows-x86_64.exe` |

You do **not** need Python installed — the binary is self-contained.

---

## Run the tester

### macOS / Linux

```bash
# Make the binary executable (only needed once)
chmod +x run_tests-<platform>

# Phase 1 only (fixtures, no database needed)
cd /path/to/your/project
PROJECT_DIR=. /path/to/run_tests-<platform>

# Phase 1 + Phase 2 against your local MongoDB
# (requires MongoDB running with the sample data loaded — see Prerequisites above)
PROJECT_DIR=. DEBUG_DB=true /path/to/run_tests-<platform>
```

### Windows (PowerShell)

```powershell
cd C:\path\to\your\project

# Phase 1 only
$env:PROJECT_DIR = "."
.\run_tests-windows-x86_64.exe

# Phase 1 + Phase 2 against local MongoDB
$env:PROJECT_DIR = "."
$env:DEBUG_DB = "true"
.\run_tests-windows-x86_64.exe
```

---

## What it tests

The tester runs two phases:

**Phase 1** (always runs) — fixture data, `USE_DB=false`. Covers the REST API,
tRPC endpoints, Redis caching, and authentication. No database needed.

**Phase 2** (runs only when `DEBUG_DB=true` and all Phase 1 API tests pass) — connects
to your local MongoDB at `localhost:27017` with the sample data loaded. Tests that
your MongoDB queries return the correct results.

Before running Phase 2, load the sample data:
```bash
mongorestore \
  --drop \
  --uri="mongodb://localhost:27017" \
  --db=mammoth \
  --collection=status \
  sample/mammoth.bson
```

A small number of tests are reserved for Gradescope and are not included in the local binary.
The output will note this at startup:

```
  NOTE: This local test suite does NOT test the HTTP method for the
  status-update endpoint. You must determine the correct method yourself.
  Those tests run only on Gradescope.
```

---

## Troubleshooting

**"Prerequisite check failed"** — the binary prints exactly which requirement is missing
and how to fix it.

**Port 1919 already in use** — the tester tries to kill any process on that port automatically.
If it persists, run:
```bash
# macOS / Linux
lsof -ti :1919 | xargs kill -9
# Windows (PowerShell)
Stop-Process -Id (Get-NetTCPConnection -LocalPort 1919).OwningProcess
```

**All tests fail with "status=None"** — the server failed to start. Make sure `npm install`
has been run and that `npx tsx api.js` works from your project directory.

**Gradescope score differs from local score** — this is expected for the reserved tests.
For all other tests, the logic is identical.
