#!/usr/bin/env bash
# setup_test_env.sh - Install dependencies and prepare the local environment
# for CS 144 Project 2 testing.
#
# Run from the tests/ directory inside your project:
#
#   cd tests && ./setup_test_env.sh
#
# Or point it at your project explicitly:
#
#   PROJECT_DIR=/path/to/project ./setup_test_env.sh
#
# When a required tool is missing the script will ask before installing it.
# Supports macOS (Homebrew) and Ubuntu/Debian (apt).

OS="$(uname -s)"
ERRORS=0

# -- Helpers -------------------------------------------------------------------
pass()  { echo "  [OK]   $*"; }
fail()  { echo "  [FAIL] $*"; ERRORS=$((ERRORS + 1)); }
info()  { echo "         $*"; }
step()  { echo ""; echo "=== $* ==="; }

ask() {
  # Returns 0 (yes) or 1 (no). Defaults to No on non-interactive stdin.
  if [[ ! -t 0 ]]; then
    echo "  --> $* [y/N] N (non-interactive, skipping)"
    return 1
  fi
  local _ans
  read -r -p "  --> $* [y/N] " _ans
  [[ "${_ans:-}" =~ ^[Yy]$ ]]
}

# -- Source nvm (try common locations) ----------------------------------------
_source_nvm() {
  local d
  for d in "$HOME/.nvm" "/opt/nvm" "${NVM_DIR:-__none__}" "/usr/local/opt/nvm"; do
    if [[ -s "$d/nvm.sh" ]]; then
      export NVM_DIR="$d"
      source "$NVM_DIR/nvm.sh"
      return 0
    fi
  done
  return 1
}
_source_nvm || true

# -- Auto-detect PROJECT_DIR ---------------------------------------------------
# Default to the parent of the directory containing this script, since the
# script lives in tests/ and the project root is one level up.
if [[ -z "${PROJECT_DIR:-}" ]]; then
  _script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PROJECT_DIR="$(dirname "$_script_dir")"
fi

echo ""
echo "CS 144 Project 2 -- Environment Setup"
echo "Project directory: $PROJECT_DIR"

# -- Check helpers -------------------------------------------------------------
_node_ok() {
  command -v node &>/dev/null || return 1
  local maj
  maj="$(node --version | sed 's/v//' | cut -d. -f1)"
  [[ "$maj" -ge 18 ]]
}

_redis_ok() {
  command -v redis-cli &>/dev/null && \
    redis-cli ping 2>/dev/null | grep -q PONG
}

_mongo_ok() {
  command -v mongosh &>/dev/null && \
    mongosh --eval "db.runCommand({ping:1})" --quiet 2>/dev/null \
      | grep -qE '"ok"[[:space:]]*:[[:space:]]*1|ok: 1'
}

# -- Install helpers -----------------------------------------------------------
_install_node() {
  echo "  Installing Node.js LTS via nvm..."
  if ! _source_nvm 2>/dev/null; then
    echo "  Downloading nvm installer..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    source "$NVM_DIR/nvm.sh"
  fi
  nvm install --lts
  nvm use --lts
  hash -r 2>/dev/null || true
}

_install_redis() {
  echo "  Installing Redis..."
  case "$OS" in
    Darwin)
      brew install redis
      brew services start redis
      ;;
    Linux)
      sudo apt-get update -y
      sudo apt-get install -y redis-server
      sudo systemctl start redis-server 2>/dev/null || \
        sudo service redis-server start 2>/dev/null || true
      ;;
    *)
      echo "  Auto-install not supported on $OS."
      return 1
      ;;
  esac
}

_install_mongo() {
  echo "  Installing MongoDB 8.0..."
  case "$OS" in
    Darwin)
      brew tap mongodb/brew 2>/dev/null || true
      brew install mongodb-community mongodb-database-tools
      brew services start mongodb-community
      ;;
    Linux)
      local CODENAME="noble"
      if [[ -f /etc/os-release ]]; then
        local _uc _vc
        _uc="$(. /etc/os-release && echo "${UBUNTU_CODENAME:-}")"
        _vc="$(. /etc/os-release && echo "${VERSION_CODENAME:-}")"
        CODENAME="${_uc:-${_vc:-noble}}"
      fi
      echo "  Detected Ubuntu codename: $CODENAME"
      sudo apt-get install -y gnupg curl
      curl -fsSL https://pgp.mongodb.com/server-8.0.asc \
        | sudo gpg --yes --dearmor \
            -o /usr/share/keyrings/mongodb-server-8.0.gpg
      echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg] https://repo.mongodb.org/apt/ubuntu ${CODENAME}/mongodb-org/8.0 multiverse" \
        | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list > /dev/null
      sudo apt-get update -y
      sudo apt-get install -y mongodb-org
      sudo systemctl start mongod 2>/dev/null || \
        sudo service mongod start 2>/dev/null || true
      ;;
    *)
      echo "  Auto-install not supported on $OS."
      return 1
      ;;
  esac
}

# =============================================================================

# -- 1. Node.js ----------------------------------------------------------------
step "1. Node.js"
if _node_ok; then
  pass "node $(node --version), npm $(npm --version)"
else
  if command -v node &>/dev/null; then
    fail "node $(node --version) is too old -- need 18+"
  else
    fail "node not found"
  fi
  if ask "Install Node.js LTS via nvm now?"; then
    _install_node
    if _node_ok; then
      pass "node $(node --version) installed successfully"
    else
      fail "Installation did not produce a working node 18+. Install manually: https://nodejs.org/"
    fi
  else
    info "Install Node.js 18+ from https://nodejs.org/ or via nvm:"
    info "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash"
    info "  source ~/.bashrc && nvm install --lts"
    ERRORS=$((ERRORS + 1))
  fi
fi

# -- 2. npm install ------------------------------------------------------------
step "2. npm install in $PROJECT_DIR"
if [[ ! -f "$PROJECT_DIR/api.js" ]]; then
  fail "api.js not found in $PROJECT_DIR"
  info "Run this script from your project's tests/ directory, or set PROJECT_DIR:"
  info "  PROJECT_DIR=/path/to/your/project ./setup_test_env.sh"
else
  # Always run npm install with --include=dev so that devDependencies
  # (notably @playwright/test) are present even if the student previously
  # ran `npm install --production`, has NODE_ENV=production set, or has
  # `production=true` / `omit=dev` configured in their ~/.npmrc.
  #
  # We override every avenue npm uses to decide "skip devDependencies":
  #   - NODE_ENV=development        (overrides exported env)
  #   - NPM_CONFIG_PRODUCTION=false (overrides ~/.npmrc production=true)
  #   - NPM_CONFIG_OMIT=""          (overrides ~/.npmrc omit=dev)
  #   - --include=dev               (explicit CLI override)
  echo "  Running npm install (with devDependencies) ..."
  if env NODE_ENV=development \
         NPM_CONFIG_PRODUCTION=false \
         NPM_CONFIG_OMIT="" \
         npm install --include=dev --prefix "$PROJECT_DIR"; then
    pass "npm install complete"
  else
    fail "npm install failed"
  fi

  # Sanity-check that @playwright/test made it in. If it didn't (e.g. the
  # student's npm config still excluded it somehow), install it directly.
  if [[ ! -d "$PROJECT_DIR/node_modules/@playwright/test" ]]; then
    echo "  @playwright/test still missing -- installing it explicitly ..."
    if env NODE_ENV=development \
           NPM_CONFIG_PRODUCTION=false \
           NPM_CONFIG_OMIT="" \
           npm install --include=dev --no-save \
             --prefix "$PROJECT_DIR" "@playwright/test@^1.59.1"; then
      :
    fi
  fi
  if [[ -d "$PROJECT_DIR/node_modules/@playwright/test" ]]; then
    pass "@playwright/test is installed in node_modules"
  else
    fail "@playwright/test is missing from $PROJECT_DIR/node_modules"
    info "Check ~/.npmrc for 'production=true' or 'omit=dev' and remove it,"
    info "or install manually: cd $PROJECT_DIR && npm install --include=dev @playwright/test"
  fi
fi

# -- 3. Redis ------------------------------------------------------------------
step "3. Redis"
REDIS_OK=false
if _redis_ok; then
  REDIS_OK=true
  pass "Redis is running"
elif command -v redis-cli &>/dev/null; then
  echo "  Redis installed but not running. Attempting to start..."
  case "$OS" in
    Linux)
      sudo systemctl start redis-server 2>/dev/null || \
        sudo service redis-server start 2>/dev/null || true ;;
    Darwin)
      brew services start redis 2>/dev/null || true ;;
  esac
  if _redis_ok; then
    REDIS_OK=true
    pass "Redis started"
  else
    fail "Redis installed but could not start"
  fi
else
  fail "Redis is not installed"
  if ask "Install Redis now?"; then
    if _install_redis && _redis_ok; then
      REDIS_OK=true
      pass "Redis installed and running"
    else
      fail "Redis installation failed"
    fi
  else
    info "macOS:          brew install redis && brew services start redis"
    info "Ubuntu/Debian:  sudo apt install redis-server"
    ERRORS=$((ERRORS + 1))
  fi
fi

# -- 4. MongoDB ----------------------------------------------------------------
step "4. MongoDB"
MONGO_OK=false
if _mongo_ok; then
  MONGO_OK=true
  pass "MongoDB is running"
elif command -v mongod &>/dev/null || command -v mongosh &>/dev/null; then
  echo "  MongoDB installed but not running. Attempting to start..."
  case "$OS" in
    Linux)
      sudo systemctl start mongod 2>/dev/null || \
        sudo service mongod start 2>/dev/null || true ;;
    Darwin)
      brew services start mongodb-community 2>/dev/null || true ;;
  esac
  if _mongo_ok; then
    MONGO_OK=true
    pass "MongoDB started"
  else
    fail "MongoDB installed but could not start"
  fi
else
  fail "MongoDB is not installed"
  if ask "Install MongoDB 8.0 now?"; then
    if _install_mongo && _mongo_ok; then
      MONGO_OK=true
      pass "MongoDB installed and running"
    else
      fail "MongoDB installation failed (or mongod needs a moment -- try re-running this script)"
    fi
  else
    info "macOS:          brew tap mongodb/brew && brew install mongodb-community"
    info "Ubuntu/Debian:  https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/"
    ERRORS=$((ERRORS + 1))
  fi
fi

# -- 5. Sample data (mammoth.bson) ---------------------------------------------
step "5. Sample data (mammoth.bson)"
BSON_FILE=""
if [[ -f "$PROJECT_DIR/sample/mammoth.bson" ]]; then
  BSON_FILE="$PROJECT_DIR/sample/mammoth.bson"
fi

if [[ -z "$BSON_FILE" ]]; then
  fail "mammoth.bson not found at $PROJECT_DIR/sample/mammoth.bson"
  info "Place the sample data file provided with the project at:"
  info "  $PROJECT_DIR/sample/mammoth.bson"
elif ! command -v mongorestore &>/dev/null; then
  fail "'mongorestore' not found -- install mongodb-database-tools"
  info "https://www.mongodb.com/docs/database-tools/installation/"
elif [[ "$MONGO_OK" == false ]]; then
  echo "  Skipping -- MongoDB is not running."
else
  EXISTING=0
  if command -v mongosh &>/dev/null; then
    EXISTING=$(mongosh --quiet --eval \
      'db.getSiblingDB("mammoth").status.countDocuments({})' 2>/dev/null || echo "0")
  fi
  if [[ "$EXISTING" -gt 0 ]]; then
    pass "Sample data already loaded ($EXISTING documents in mammoth.status)"
    info "To reload: mongorestore --drop --uri=mongodb://localhost:27017 --db=mammoth --collection=status $BSON_FILE"
  else
    echo "  Loading $BSON_FILE ..."
    mongorestore \
      --uri="mongodb://localhost:27017" \
      --db=mammoth \
      --collection=status \
      "$BSON_FILE"
    DOC_COUNT=$(mongosh --quiet --eval \
      'db.getSiblingDB("mammoth").status.countDocuments({})' 2>/dev/null || echo "?")
    pass "Loaded sample data ($DOC_COUNT documents in mammoth.status)"
  fi
fi

# -- 6. Python / Playwright (dashboard tests) ----------------------------------
step "6. Python / Playwright (dashboard tests)"
VENV_DIR="$PROJECT_DIR/tests/.venv"

_playwright_ok() {
  [[ -f "$VENV_DIR/bin/python3" ]] && \
    "$VENV_DIR/bin/python3" -c "import playwright" 2>/dev/null
}

_chromium_ok() {
  local cache_dir
  case "$(uname -s)" in
    Darwin) cache_dir="$HOME/Library/Caches/ms-playwright" ;;
    *)      cache_dir="${XDG_CACHE_HOME:-$HOME/.cache}/ms-playwright" ;;
  esac
  ls "$cache_dir"/chromium-* &>/dev/null 2>&1
}

if _playwright_ok && _chromium_ok; then
  pass "playwright venv and Chromium already installed"
else
  if ! command -v python3 &>/dev/null; then
    fail "python3 not found -- install Python 3.8+"
    info "Ubuntu/Debian: sudo apt install python3 python3-venv python3-pip"
  else
    if [[ ! -d "$VENV_DIR" ]]; then
      echo "  Creating Python venv at tests/.venv ..."
      python3 -m venv "$VENV_DIR"
    fi

    if ! _playwright_ok; then
      echo "  Installing playwright into tests/.venv ..."
      if "$VENV_DIR/bin/pip" install --quiet playwright; then
        pass "playwright installed"
      else
        fail "pip install playwright failed"
      fi
    fi

    echo "  Installing Chromium (playwright install --with-deps chromium) ..."
    echo "  Note: this may ask for your sudo password to install system libraries."
    if "$VENV_DIR/bin/playwright" install --with-deps chromium; then
      pass "Chromium installed"
    else
      fail "playwright install chromium failed"
      info "Try manually: cd $PROJECT_DIR && tests/.venv/bin/playwright install --with-deps chromium"
    fi
  fi
fi

# -- Summary -------------------------------------------------------------------
echo ""
echo "========================================"
if [[ "$ERRORS" -eq 0 ]]; then
  echo "Environment is ready."
  echo ""
  echo "  Phase 1 (fixtures -- no database required):"
  echo "    cd $PROJECT_DIR && python3 tests/run.py"
  echo ""
  echo "  Phase 1 + Phase 2 (live local MongoDB):"
  echo "    cd $PROJECT_DIR && DEBUG_DB=true python3 tests/run.py"
else
  echo "Setup completed with $ERRORS issue(s). Fix the items marked [FAIL] above,"
  echo "then re-run this script."
  exit 1
fi
