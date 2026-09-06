"""Printer Flip Notifier.

Runs quietly in the system tray and speaks a reminder ("Please flip the
pages.") whenever Windows shows the manual-duplex prompt for a printer like
the Canon PIXMA G3000, which has no automatic second-side hardware.

Run directly with `python app.py`, or package into a standalone .exe with
PyInstaller (see README.md).
"""
import sys
import threading
import time

from config import load_config, save_config, config_path
from detectors import SpoolerWatcher, WindowTitleWatcher
from speaker import Speaker

_IS_WINDOWS = sys.platform == "win32"


class NotifierApp:
    def __init__(self):
        self.cfg = load_config()
        self.lock = threading.Lock()
        self.running = True
        self.paused = False
        self.speaker = Speaker()
        self.spooler_watcher = SpoolerWatcher()
        self.window_watcher = WindowTitleWatcher()
        self._worker = threading.Thread(target=self._loop, daemon=True)

    def start(self):
        self._worker.start()

    def stop(self):
        self.running = False

    def test_alert(self):
        self.speaker.say(self.cfg["message"])

    def update_config(self, **changes):
        with self.lock:
            self.cfg.update(changes)
            save_config(self.cfg)

    def toggle_pause(self):
        self.paused = not self.paused
        return self.paused

    def _loop(self):
        while self.running:
            with self.lock:
                cfg = dict(self.cfg)
            if not self.paused:
                self._check_once(cfg)
            time.sleep(max(1, cfg.get("poll_interval_seconds", 2)))

    def _check_once(self, cfg):
        try:
            if cfg.get("use_spooler_check") and self.spooler_watcher.available():
                if self.spooler_watcher.poll(
                    cfg.get("printer_name"), cfg.get("repeat_interval_seconds", 15)
                ):
                    self.speaker.say(cfg["message"])
        except Exception as exc:  # pragma: no cover - environment dependent
            print(f"[app] spooler check failed: {exc}")

        try:
            if cfg.get("use_window_title_check") and self.window_watcher.available():
                if self.window_watcher.poll(
                    cfg.get("keywords", []), cfg.get("repeat_interval_seconds", 15)
                ):
                    self.speaker.say(cfg["message"])
        except Exception as exc:  # pragma: no cover - environment dependent
            print(f"[app] window-title check failed: {exc}")


def set_start_with_windows(enabled, app_path=None):
    """Add/remove a per-user Run key so the app launches at login."""
    if not _IS_WINDOWS:
        print("[app] start-with-Windows is only supported on Windows.")
        return
    import winreg

    app_path = app_path or sys.argv[0]
    key = winreg.OpenKey(
        winreg.HKEY_CURRENT_USER,
        r"Software\Microsoft\Windows\CurrentVersion\Run",
        0,
        winreg.KEY_SET_VALUE,
    )
    try:
        if enabled:
            winreg.SetValueEx(key, "PrinterFlipNotifier", 0, winreg.REG_SZ, app_path)
        else:
            try:
                winreg.DeleteValue(key, "PrinterFlipNotifier")
            except FileNotFoundError:
                pass
    finally:
        winreg.CloseKey(key)


def run_tray(app: NotifierApp):
    import pystray
    from PIL import Image, ImageDraw

    def make_icon(color):
        img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        draw.rectangle((8, 4, 56, 60), outline=color, width=4)
        draw.line((8, 32, 56, 32), fill=color, width=4)
        return img

    icon_normal = make_icon((30, 144, 255, 255))
    icon_paused = make_icon((160, 160, 160, 255))

    def on_test(_icon, _item):
        app.test_alert()

    def on_toggle_pause(icon, _item):
        paused = app.toggle_pause()
        icon.icon = icon_paused if paused else icon_normal
        icon.title = "Printer Flip Notifier (paused)" if paused else "Printer Flip Notifier"

    def on_toggle_startup(_icon, item):
        enabled = not item.checked
        set_start_with_windows(enabled)
        app.update_config(start_with_windows=enabled)

    def is_paused(_item):
        return app.paused

    def is_startup_enabled(_item):
        return app.cfg.get("start_with_windows", False)

    def on_open_settings(_icon, _item):
        threading.Thread(target=open_settings_window, args=(app,), daemon=True).start()

    def on_quit(icon, _item):
        app.stop()
        icon.stop()

    menu = pystray.Menu(
        pystray.MenuItem("Test alert", on_test),
        pystray.MenuItem("Paused", on_toggle_pause, checked=is_paused),
        pystray.MenuItem("Start with Windows", on_toggle_startup, checked=is_startup_enabled),
        pystray.MenuItem("Settings...", on_open_settings),
        pystray.MenuItem("Quit", on_quit),
    )

    icon = pystray.Icon("printer_flip_notifier", icon_normal, "Printer Flip Notifier", menu)
    icon.run()


def open_settings_window(app: NotifierApp):
    import tkinter as tk
    from tkinter import ttk

    cfg = app.cfg

    root = tk.Tk()
    root.title("Printer Flip Notifier - Settings")
    root.resizable(False, False)

    def row(label_text, r):
        ttk.Label(root, text=label_text).grid(row=r, column=0, sticky="w", padx=8, pady=6)

    row("Spoken message:", 0)
    message_var = tk.StringVar(value=cfg.get("message", ""))
    ttk.Entry(root, textvariable=message_var, width=40).grid(row=0, column=1, padx=8, pady=6)

    row("Printer name (blank = default):", 1)
    printer_var = tk.StringVar(value=cfg.get("printer_name") or "")
    ttk.Entry(root, textvariable=printer_var, width=40).grid(row=1, column=1, padx=8, pady=6)

    row("Re-announce every (seconds):", 2)
    repeat_var = tk.StringVar(value=str(cfg.get("repeat_interval_seconds", 15)))
    ttk.Entry(root, textvariable=repeat_var, width=10).grid(row=2, column=1, sticky="w", padx=8, pady=6)

    row("Keywords (comma-separated fallback):", 3)
    keywords_var = tk.StringVar(value=", ".join(cfg.get("keywords", [])))
    ttk.Entry(root, textvariable=keywords_var, width=40).grid(row=3, column=1, padx=8, pady=6)

    spooler_var = tk.BooleanVar(value=cfg.get("use_spooler_check", True))
    ttk.Checkbutton(root, text="Use print-queue status (recommended)", variable=spooler_var).grid(
        row=4, column=0, columnspan=2, sticky="w", padx=8, pady=2
    )

    window_var = tk.BooleanVar(value=cfg.get("use_window_title_check", True))
    ttk.Checkbutton(root, text="Also scan window titles for keywords", variable=window_var).grid(
        row=5, column=0, columnspan=2, sticky="w", padx=8, pady=2
    )

    status_var = tk.StringVar(value="")
    ttk.Label(root, textvariable=status_var, foreground="green").grid(
        row=6, column=0, columnspan=2, padx=8, pady=(0, 4)
    )

    def on_save():
        try:
            repeat_seconds = max(1, int(repeat_var.get()))
        except ValueError:
            status_var.set("Repeat interval must be a whole number of seconds.")
            return
        keywords = [k.strip() for k in keywords_var.get().split(",") if k.strip()]
        app.update_config(
            message=message_var.get().strip() or "Please flip the pages.",
            printer_name=printer_var.get().strip() or None,
            repeat_interval_seconds=repeat_seconds,
            keywords=keywords,
            use_spooler_check=spooler_var.get(),
            use_window_title_check=window_var.get(),
        )
        status_var.set(f"Saved to {config_path()}")

    def on_test():
        app.test_alert()

    button_frame = ttk.Frame(root)
    button_frame.grid(row=7, column=0, columnspan=2, pady=8)
    ttk.Button(button_frame, text="Test alert", command=on_test).pack(side="left", padx=4)
    ttk.Button(button_frame, text="Save", command=on_save).pack(side="left", padx=4)
    ttk.Button(button_frame, text="Close", command=root.destroy).pack(side="left", padx=4)

    root.mainloop()


def main():
    app = NotifierApp()
    app.start()

    if not _IS_WINDOWS:
        print(
            "[app] Automatic detection (print-queue status and window titles) is "
            "Windows-only. Running in console mode; use Ctrl+C to quit."
        )
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            app.stop()
        return

    try:
        run_tray(app)
    except ImportError as exc:
        print(f"[app] Tray UI unavailable ({exc}); running in console mode instead.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            app.stop()


if __name__ == "__main__":
    main()
