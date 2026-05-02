#!/usr/bin/env python3
"""
run.py — CS 144 Project 2 local test launcher.

Detects your platform, picks the correct pre-built binary, runs it, and
writes a copy of the full output to results.txt in this directory.

Usage (from your project directory):
    python3 /path/to/tests/run.py              # Phase 1 only (no database)
    DEBUG_DB=true python3 /path/to/tests/run.py  # Phase 1 + Phase 2 (local MongoDB)

Or set PROJECT_DIR explicitly if you are not running from your project folder:
    PROJECT_DIR=/path/to/your/project python3 /path/to/tests/run.py
"""

import os
import platform
import stat
import subprocess
import sys

# ── Platform detection ────────────────────────────────────────────────────────

def _detect_platform():
    system = platform.system()       # 'Linux', 'Darwin', 'Windows'
    machine = platform.machine()     # 'x86_64', 'AMD64', 'arm64', 'aarch64', ...

    if system == "Linux":
        os_label = "linux"
    elif system == "Darwin":
        os_label = "macos"
    elif system in ("Windows",) or machine.lower().startswith("win"):
        os_label = "windows"
    else:
        sys.exit(f"Unsupported OS: {system!r}")

    if machine in ("x86_64", "AMD64"):
        arch_label = "x86_64"
    elif machine in ("arm64", "aarch64", "ARM64"):
        arch_label = "arm64"
    else:
        sys.exit(f"Unsupported architecture: {machine!r}")

    return os_label, arch_label


def _find_binary(os_label, arch_label):
    platform_label = f"{os_label}-{arch_label}"
    script_dir = os.path.dirname(os.path.abspath(__file__))
    bin_name = "run_tests.exe" if os_label == "windows" else "run_tests"
    binary = os.path.join(script_dir, "binaries", platform_label, bin_name)

    if not os.path.isfile(binary):
        print(f"Binary not found: {binary}")
        print(f"  Platform detected: {platform_label}")
        print(f"  Expected at: binaries/{platform_label}/{bin_name}")
        print()
        print("Download the binary for your platform from the course GitHub releases page")
        print("and place it at the path shown above, then re-run this script.")
        sys.exit(1)

    # Ensure executable bit is set on Unix
    if os_label != "windows":
        current = os.stat(binary).st_mode
        os.chmod(binary, current | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    return binary


# ── Run and tee output ────────────────────────────────────────────────────────

def _run(binary):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    results_path = os.path.join(script_dir, "results.txt")

    print(f"Running: {binary}")
    print(f"Output will also be written to: {results_path}")
    print()

    env = os.environ.copy()

    # Auto-set PROJECT_DIR to the project root (parent of tests/) if not
    # already in the environment.  Without this the binary resolves
    # PROJECT_DIR relative to its own PyInstaller temp directory.
    if "PROJECT_DIR" not in env:
        project_root = os.path.dirname(script_dir)
        env["PROJECT_DIR"] = project_root
        print(f"PROJECT_DIR not set — using: {project_root}")
        print()

    # Load variables from PROJECT_DIR/.env into the environment.
    # Shell-environment variables take precedence over .env values.
    _dotenv = os.path.join(env["PROJECT_DIR"], ".env")
    if os.path.isfile(_dotenv):
        with open(_dotenv) as _f:
            for _line in _f:
                _line = _line.strip()
                if not _line or _line.startswith("#") or "=" not in _line:
                    continue
                _key, _, _val = _line.partition("=")
                _key = _key.strip()
                _val = _val.strip().strip('"').strip("'")
                if _key and _key not in os.environ:
                    env[_key] = _val

    # Inject nvm-managed node/npm/npx onto PATH if they aren't already there.
    # nvm doesn't activate in non-interactive shells, so the binary wouldn't
    # find node even if the user installed it via nvm.
    if platform.system() != "Windows":
        import shutil
        if shutil.which("node") is None:
            home = os.path.expanduser("~")
            nvm_candidates = [
                os.path.join(os.environ.get("NVM_DIR", ""), "alias", "default"),
                os.path.join(home, ".nvm", "alias", "default"),
                "/opt/nvm/alias/default",
            ]
            for alias_file in nvm_candidates:
                if os.path.isfile(alias_file):
                    try:
                        version = open(alias_file).read().strip()
                        # version may be "lts/*" or "v24.x.x"
                        nvm_root = os.path.dirname(os.path.dirname(alias_file))
                        versions_dir = os.path.join(nvm_root, "versions", "node")
                        if os.path.isdir(versions_dir):
                            # Resolve lts/* / default aliases to a real version dir
                            candidates = sorted(os.listdir(versions_dir), reverse=True)
                            for v in candidates:
                                bin_dir = os.path.join(versions_dir, v, "bin")
                                if os.path.isdir(bin_dir):
                                    env["PATH"] = bin_dir + os.pathsep + env.get("PATH", "")
                                    break
                            break
                    except Exception:
                        continue

    collected = []
    try:
        proc = subprocess.Popen(
            [binary],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            env=env,
        )
        assert proc.stdout is not None
        for raw_line in proc.stdout:
            try:
                line = raw_line.decode("utf-8", errors="replace")
            except Exception:
                line = repr(raw_line) + "\n"
            sys.stdout.write(line)
            sys.stdout.flush()
            collected.append(line)
        proc.wait()
        exit_code = proc.returncode
    except KeyboardInterrupt:
        print("\n[Interrupted]")
        exit_code = 130

    with open(results_path, "w", encoding="utf-8") as f:
        f.writelines(collected)

    if not collected:
        print(
            "\n[ERROR] The test runner produced no output and exited"
            f" with code {exit_code}.\n"
            "Common causes:\n"
            "  - A stale process is occupying port 1919. Run:\n"
            "      pkill -f 'api.js' && lsof -ti :1919 | xargs kill -9\n"
            "  - node / npx is not on PATH (nvm not activated).\n"
            "  - PROJECT_DIR does not point to your project root.\n",
            file=sys.stderr,
        )
    else:
        print(f"\nResults written to: {results_path}")

    pw_exit = _run_playwright(env)
    if pw_exit != 0:
        exit_code = pw_exit

    return exit_code


def _run_playwright(env):
    """Run npx playwright test from PROJECT_DIR if playwright.config.ts exists."""
    project_dir = env.get("PROJECT_DIR", "")
    config = os.path.join(project_dir, "playwright.config.ts")
    if not os.path.isfile(config):
        return 0  # No playwright config — skip silently

    import shutil
    npx = shutil.which("npx", path=env.get("PATH", os.environ.get("PATH", "")))
    if npx is None:
        print("\n[WARNING] npx not found on PATH — skipping Playwright tests.", file=sys.stderr)
        return 0

    print("\n" + "━" * 60)
    print("  Playwright: Dashboard UI Tests")
    print("━" * 60 + "\n")

    try:
        result = subprocess.run(
            [npx, "playwright", "test", "--reporter=list"],
            cwd=project_dir,
            env=env,
        )
        return result.returncode
    except KeyboardInterrupt:
        print("\n[Interrupted]")
        return 130


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    os_label, arch_label = _detect_platform()
    binary = _find_binary(os_label, arch_label)
    sys.exit(_run(binary))


if __name__ == "__main__":
    main()
