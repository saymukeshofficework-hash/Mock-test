"""Config load/save for Printer Flip Notifier.

Kept dependency-free (stdlib only) so it can be unit-tested without
pywin32/pyttsx3/pystray being installed.
"""
import json
import os
import sys

DEFAULT_CONFIG = {
    "message": "Please flip the pages.",
    "printer_name": None,          # None = use the system's default printer
    "poll_interval_seconds": 2,    # how often to check for the prompt
    "repeat_interval_seconds": 15, # re-announce every N seconds while still waiting
    "use_spooler_check": True,     # official print-job "needs attention" flag
    "use_window_title_check": True,# fallback: scan window titles for keywords
    "keywords": [
        "flip", "other side", "second side", "reload the paper",
        "reinsert", "load the printed", "duplex", "continue printing",
        "insert the paper", "insert paper",
    ],
    "start_with_windows": False,
}


def config_path():
    base = os.path.dirname(os.path.abspath(sys.argv[0]))
    return os.path.join(base, "config.json")


def load_config(path=None):
    path = path or config_path()
    cfg = dict(DEFAULT_CONFIG)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                saved = json.load(f)
            if isinstance(saved, dict):
                cfg.update(saved)
        except (OSError, ValueError):
            pass
    return cfg


def save_config(cfg, path=None):
    path = path or config_path()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2, ensure_ascii=False)


def matches_keyword(text, keywords):
    if not text:
        return False
    lowered = text.lower()
    return any(kw.lower() in lowered for kw in keywords if kw)
