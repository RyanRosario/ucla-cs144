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

    print(f"\nResults written to: {results_path}")
    return exit_code


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    os_label, arch_label = _detect_platform()
    binary = _find_binary(os_label, arch_label)
    sys.exit(_run(binary))


if __name__ == "__main__":
    main()
