"""Builds a folder-based Windows distribution with PyInstaller.

Run: python build.py
Output: dist/YouTubePhonkAutomator/YouTubePhonkAutomator.exe
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def main() -> None:
    add_data = f"{BASE_DIR / 'data'}{os.pathsep}data"
    args = [
        sys.executable, "-m", "PyInstaller",
        "--name", "YouTubePhonkAutomator",
        "--windowed",
        "--noconfirm",
        "--add-data", add_data,
        str(BASE_DIR / "app.py"),
    ]
    print("Running:", " ".join(args))
    subprocess.run(args, check=True, cwd=BASE_DIR)
    print("\nBuild complete: dist/YouTubePhonkAutomator/YouTubePhonkAutomator.exe")


if __name__ == "__main__":
    main()
