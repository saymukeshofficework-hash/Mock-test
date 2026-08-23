"""Jobs screen: one row per Markdown record, each with independent video
selection - the user is never auto-assigned a video for a job."""
from __future__ import annotations

import tkinter as tk
from pathlib import Path
from tkinter import filedialog, ttk

from core.video_manager import get_video_info
from ui.dialogs import show_error
from utils.validators import ValidationError, format_duration

COLUMNS = ("id", "title", "video", "music", "length", "status")


class JobsFrame(ttk.Frame):
    def __init__(self, parent: tk.Misc, ctx):
        super().__init__(parent, padding=12)
        self.ctx = ctx
        ctx.register_jobs_frame(self)

        toolbar = ttk.Frame(self)
        toolbar.pack(fill="x", pady=(0, 8))
        ttk.Button(toolbar, text="Refresh", command=self.refresh).pack(side="left")
        ttk.Button(toolbar, text="Change Video for Selected Job...", command=self._change_video).pack(side="left", padx=6)
        ttk.Button(toolbar, text="Set as Current Job", command=self._set_current).pack(side="left", padx=6)

        self.tree = ttk.Treeview(self, columns=COLUMNS, show="headings", height=14)
        for col, width in zip(COLUMNS, (40, 220, 220, 160, 80, 90)):
            self.tree.heading(col, text=col.upper())
            self.tree.column(col, width=width, anchor="w")
        self.tree.pack(fill="both", expand=True)

        self.refresh()

    def refresh(self) -> None:
        for row in self.tree.get_children():
            self.tree.delete(row)
        for job in self.ctx.db.list_jobs():
            self.tree.insert("", "end", iid=str(job["id"]), values=(
                job["id"], job["title"],
                Path(job["video_path"]).name if job["video_path"] else "(not selected)",
                job["music_path"] or job["music_mode"] or "(none)",
                format_duration(job["length_seconds"] or 0),
                job["status"],
            ))

    def _selected_job_id(self) -> int | None:
        selection = self.tree.selection()
        return int(selection[0]) if selection else None

    def _change_video(self) -> None:
        job_id = self._selected_job_id()
        if job_id is None:
            show_error(self, "Select a job first.")
            return
        path = filedialog.askopenfilename(
            title="Select Video",
            filetypes=[("Video files", "*.mp4 *.mov *.mkv *.avi *.webm *.m4v"), ("All files", "*.*")],
        )
        if not path:
            return
        settings = self.ctx.settings.get()
        try:
            get_video_info(settings.ffprobe_path, Path(path))
        except ValidationError as exc:
            show_error(self, str(exc))
            return
        self.ctx.job_manager.set_job_video(job_id, Path(path))
        self.refresh()

    def _set_current(self) -> None:
        job_id = self._selected_job_id()
        if job_id is None:
            show_error(self, "Select a job first.")
            return
        self.ctx.set_current_job(job_id)
