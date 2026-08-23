"""Logs screen: tails logs/app.log. Reads the file fresh on each refresh -
never keeps the whole log resident, just whatever is on disk right now."""
from __future__ import annotations

import tkinter as tk
from pathlib import Path
from tkinter import ttk

MAX_DISPLAY_LINES = 500


class LogsFrame(ttk.Frame):
    def __init__(self, parent: tk.Misc, ctx):
        super().__init__(parent, padding=12)
        self.ctx = ctx

        toolbar = ttk.Frame(self)
        toolbar.pack(fill="x", pady=(0, 8))
        ttk.Button(toolbar, text="Refresh", command=self.refresh).pack(side="left")

        self.text = tk.Text(self, wrap="none", state="disabled")
        self.text.pack(fill="both", expand=True)
        self.refresh()

    def refresh(self) -> None:
        log_path = self.ctx.logs_dir / "app.log"
        if not log_path.exists():
            content = "(no log file yet)"
        else:
            lines = log_path.read_text(encoding="utf-8", errors="replace").splitlines()
            content = "\n".join(lines[-MAX_DISPLAY_LINES:])
        self.text.configure(state="normal")
        self.text.delete("1.0", "end")
        self.text.insert("1.0", content)
        self.text.configure(state="disabled")
        self.text.see("end")
