"""Entry point for YouTube Phonk Automator."""
from __future__ import annotations

from pathlib import Path

from ui.main_window import MainWindow
from utils.logger import setup_logging

BASE_DIR = Path(__file__).resolve().parent


def main() -> None:
    for name in ("output", "temp", "logs"):
        (BASE_DIR / name).mkdir(exist_ok=True)

    logger = setup_logging(BASE_DIR / "logs")
    logger.info("Starting YouTube Phonk Automator")

    window = MainWindow(BASE_DIR)
    window.protocol("WM_DELETE_WINDOW", window.on_close)
    try:
        window.mainloop()
    finally:
        logger.info("Shutting down")


if __name__ == "__main__":
    main()
