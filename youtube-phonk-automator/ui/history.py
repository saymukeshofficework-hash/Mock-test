"""History screen: every job ever created, with its final YouTube URL (if
uploaded) and quick actions. Deleting a history row never touches source files."""
from __future__ import annotations

import subprocess
import sys
import tkinter as tk
from pathlib import Path
from tkinter import ttk

from ui.dialogs import show_error

COLUMNS = ("date", "title", "video", "music", "length", "status", "youtube_url")


class HistoryFrame(ttk.Frame):
    def __init__(self, parent: tk.Misc, ctx):
        super().__init__(parent, padding=12)
        self.ctx = ctx

        toolbar = ttk.Frame(self)
        toolbar.pack(fill="x", pady=(0, 8))
        ttk.Button(toolbar, text="Refresh", command=self.refresh).pack(side="left")
        ttk.Button(toolbar, text="Open Video", command=self._open_video).pack(side="left", padx=6)
        ttk.Button(toolbar, text="Open Output Folder", command=self._open_output_folder).pack(side="left", padx=6)
        ttk.Button(toolbar, text="Retry", command=self._retry).pack(side="left", padx=6)

        self.tree = ttk.Treeview(self, columns=COLUMNS, show="headings", height=16)
        for col, width in zip(COLUMNS, (140, 200, 160, 140, 70, 90, 180)):
            self.tree.heading(col, text=col.replace("_", " ").upper())
            self.tree.column(col, width=width, anchor="w")
        self.tree.pack(fill="both", expand=True)

        self._rows_by_job_id: dict[int, dict] = {}
        self.refresh()

    def refresh(self) -> None:
        for row in self.tree.get_children():
            self.tree.delete(row)
        self._rows_by_job_id.clear()
        for row in self.ctx.db.list_history():
            self._rows_by_job_id[row["job_id"]] = dict(row)
            self.tree.insert("", "end", iid=str(row["job_id"]), values=(
                row["created_at"], row["title"],
                Path(row["video_path"]).name if row["video_path"] else "-",
                Path(row["music_path"]).name if row["music_path"] else "-",
                row["length_seconds"] or "-", row["status"], row["youtube_url"] or "-",
            ))

    def _selected_row(self) -> dict | None:
        selection = self.tree.selection()
        if not selection:
            return None
        return self._rows_by_job_id.get(int(selection[0]))

    def _open_video(self) -> None:
        row = self._selected_row()
        if not row or not row.get("output_path"):
            show_error(self, "No output video for this entry.")
            return
        self._open_with_os(Path(row["output_path"]))

    def _open_output_folder(self) -> None:
        row = self._selected_row()
        if not row or not row.get("output_path"):
            show_error(self, "No output folder for this entry.")
            return
        self._open_with_os(Path(row["output_path"]).parent)

    def _open_with_os(self, path: Path) -> None:
        try:
            if sys.platform == "win32":
                import os
                os.startfile(str(path))  # noqa: S606 - user-chosen local file, not user input from network
            elif sys.platform == "darwin":
                subprocess.run(["open", str(path)], check=False)
            else:
                subprocess.run(["xdg-open", str(path)], check=False)
        except OSError as exc:
            show_error(self, "Could not open the file.", exc)

    def _retry(self) -> None:
        row = self._selected_row()
        if not row:
            show_error(self, "Select a history entry first.")
            return
        self.ctx.job_manager.restart_job(row["job_id"])
        self.refresh()
