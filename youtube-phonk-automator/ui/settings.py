"""Settings screen - a plain form over AppSettings."""
from __future__ import annotations

import tkinter as tk
from tkinter import filedialog, messagebox, ttk

from core.ffmpeg_processor import QUALITY_PRESETS, TRANSITION_TYPES


class SettingsFrame(ttk.Frame):
    def __init__(self, parent: tk.Misc, ctx):
        super().__init__(parent, padding=12)
        self.ctx = ctx
        settings = ctx.settings.get()

        self.vars: dict[str, tk.Variable] = {
            "ffmpeg_path": tk.StringVar(value=settings.ffmpeg_path),
            "ffprobe_path": tk.StringVar(value=settings.ffprobe_path),
            "output_folder": tk.StringVar(value=settings.output_folder),
            "default_music_folder": tk.StringVar(value=settings.default_music_folder),
            "default_duration_seconds": tk.StringVar(value=str(settings.default_duration_seconds)),
            "default_music_volume": tk.StringVar(value=str(settings.default_music_volume)),
            "default_fade_in": tk.StringVar(value=str(settings.default_fade_in)),
            "default_fade_out": tk.StringVar(value=str(settings.default_fade_out)),
            "default_transition": tk.StringVar(value=settings.default_transition),
            "default_transition_duration": tk.StringVar(value=str(settings.default_transition_duration)),
            "default_category": tk.StringVar(value=settings.default_category),
            "default_playlist": tk.StringVar(value=settings.default_playlist),
            "default_audience": tk.StringVar(value=settings.default_audience),
            "default_visibility": tk.StringVar(value=settings.default_visibility),
            "browser": tk.StringVar(value=settings.browser),
            "browser_executable": tk.StringVar(value=settings.browser_executable),
            "browser_profile": tk.StringVar(value=settings.browser_profile),
            "preview_before_publish": tk.BooleanVar(value=settings.preview_before_publish),
            "auto_publish": tk.BooleanVar(value=settings.auto_publish),
            "quality_preset": tk.StringVar(value=settings.quality_preset),
        }

        body = ttk.Frame(self)
        body.pack(fill="both", expand=True)

        self._path_row(body, 0, "FFmpeg path", "ffmpeg_path", file=True)
        self._path_row(body, 1, "FFprobe path", "ffprobe_path", file=True)
        self._path_row(body, 2, "Output folder", "output_folder", file=False)
        self._path_row(body, 3, "Default music folder", "default_music_folder", file=False)
        self._entry_row(body, 4, "Default duration (s)", "default_duration_seconds")
        self._entry_row(body, 5, "Default music volume", "default_music_volume")
        self._entry_row(body, 6, "Default fade in (s)", "default_fade_in")
        self._entry_row(body, 7, "Default fade out (s)", "default_fade_out")
        self._combo_row(body, 8, "Default transition", "default_transition", TRANSITION_TYPES)
        self._entry_row(body, 9, "Default transition duration (s)", "default_transition_duration")
        self._entry_row(body, 10, "Default category", "default_category")
        self._entry_row(body, 11, "Default playlist", "default_playlist")
        self._entry_row(body, 12, "Default audience", "default_audience")
        self._combo_row(body, 13, "Default visibility", "default_visibility", ("Public", "Unlisted", "Private"))
        self._combo_row(body, 14, "Browser", "browser", ("Chrome", "Edge"))
        self._path_row(body, 15, "Browser executable", "browser_executable", file=True)
        self._path_row(body, 16, "Browser profile folder", "browser_profile", file=False)
        self._combo_row(body, 17, "Quality preset", "quality_preset", QUALITY_PRESETS)

        ttk.Checkbutton(body, text="Preview before publish", variable=self.vars["preview_before_publish"]).grid(
            row=18, column=0, columnspan=2, sticky="w", pady=4
        )
        ttk.Checkbutton(
            body, text="Auto Publish (off by default - publishes with no final review)",
            variable=self.vars["auto_publish"], command=self._on_auto_publish_toggle,
        ).grid(row=19, column=0, columnspan=2, sticky="w", pady=4)

        ttk.Button(self, text="Save Settings", command=self._save).pack(anchor="w", pady=12)

    def _path_row(self, parent: ttk.Frame, row: int, label: str, key: str, file: bool) -> None:
        ttk.Label(parent, text=label, width=28).grid(row=row, column=0, sticky="w", pady=2)
        ttk.Entry(parent, textvariable=self.vars[key], width=45).grid(row=row, column=1, sticky="w", padx=6)
        command = (lambda: self._browse_file(key)) if file else (lambda: self._browse_folder(key))
        ttk.Button(parent, text="Browse...", command=command).grid(row=row, column=2, sticky="w")

    def _entry_row(self, parent: ttk.Frame, row: int, label: str, key: str) -> None:
        ttk.Label(parent, text=label, width=28).grid(row=row, column=0, sticky="w", pady=2)
        ttk.Entry(parent, textvariable=self.vars[key], width=20).grid(row=row, column=1, sticky="w", padx=6)

    def _combo_row(self, parent: ttk.Frame, row: int, label: str, key: str, values) -> None:
        ttk.Label(parent, text=label, width=28).grid(row=row, column=0, sticky="w", pady=2)
        ttk.Combobox(parent, textvariable=self.vars[key], values=list(values), state="readonly", width=18).grid(
            row=row, column=1, sticky="w", padx=6
        )

    def _browse_file(self, key: str) -> None:
        path = filedialog.askopenfilename(title="Select file")
        if path:
            self.vars[key].set(path)

    def _browse_folder(self, key: str) -> None:
        folder = filedialog.askdirectory(title="Select folder")
        if folder:
            self.vars[key].set(folder)

    def _on_auto_publish_toggle(self) -> None:
        if self.vars["auto_publish"].get():
            from ui.dialogs import confirm_auto_publish_warning
            if not confirm_auto_publish_warning(self):
                self.vars["auto_publish"].set(False)

    def _save(self) -> None:
        try:
            self.ctx.settings.update(
                ffmpeg_path=self.vars["ffmpeg_path"].get(),
                ffprobe_path=self.vars["ffprobe_path"].get(),
                output_folder=self.vars["output_folder"].get(),
                default_music_folder=self.vars["default_music_folder"].get(),
                default_duration_seconds=float(self.vars["default_duration_seconds"].get()),
                default_music_volume=float(self.vars["default_music_volume"].get()),
                default_fade_in=float(self.vars["default_fade_in"].get()),
                default_fade_out=float(self.vars["default_fade_out"].get()),
                default_transition=self.vars["default_transition"].get(),
                default_transition_duration=float(self.vars["default_transition_duration"].get()),
                default_category=self.vars["default_category"].get(),
                default_playlist=self.vars["default_playlist"].get(),
                default_audience=self.vars["default_audience"].get(),
                default_visibility=self.vars["default_visibility"].get(),
                browser=self.vars["browser"].get(),
                browser_executable=self.vars["browser_executable"].get(),
                browser_profile=self.vars["browser_profile"].get(),
                preview_before_publish=bool(self.vars["preview_before_publish"].get()),
                auto_publish=bool(self.vars["auto_publish"].get()),
                quality_preset=self.vars["quality_preset"].get(),
            )
        except ValueError:
            messagebox.showerror("Invalid Settings", "Please check the numeric fields.")
            return
        messagebox.showinfo("Settings", "Settings saved.")
