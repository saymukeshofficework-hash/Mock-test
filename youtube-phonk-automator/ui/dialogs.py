"""Modal dialogs shared across screens: friendly errors, short-video /
crash-recovery prompts, edit-plan preview, and the final YouTube review."""
from __future__ import annotations

import tkinter as tk
import traceback
from tkinter import messagebox, ttk


def show_error(parent: tk.Misc, message: str, exc: Exception | None = None) -> None:
    """Friendly one-line message by default; technical details stay hidden
    behind an explicit button, never shown as the primary error."""
    dialog = tk.Toplevel(parent)
    dialog.title("Error")
    dialog.resizable(False, False)
    dialog.transient(parent.winfo_toplevel())

    ttk.Label(dialog, text=message, wraplength=380, justify="left").pack(padx=16, pady=(16, 8))

    details_text = None
    if exc is not None:
        details_frame = ttk.Frame(dialog)

        def toggle_details() -> None:
            nonlocal details_text
            if details_text is None:
                details_text = tk.Text(details_frame, height=10, width=60, wrap="word")
                details_text.insert("1.0", "".join(traceback.format_exception(type(exc), exc, exc.__traceback__)))
                details_text.configure(state="disabled")
                details_text.pack(fill="both", expand=True, padx=4, pady=4)
            else:
                details_text.destroy()
                details_text = None

        ttk.Button(dialog, text="Show Technical Details", command=toggle_details).pack(pady=(0, 8))
        details_frame.pack(fill="both", expand=True)

    ttk.Button(dialog, text="OK", command=dialog.destroy).pack(pady=(0, 16))
    dialog.grab_set()
    dialog.wait_window()


def ask_short_video_action(parent: tk.Misc) -> str:
    """Returns 'loop' or 'cancel'. Never called automatically - the caller
    must show this before looping a video that is shorter than the target."""
    result = {"choice": "cancel"}
    dialog = tk.Toplevel(parent)
    dialog.title("Video Too Short")
    dialog.resizable(False, False)
    dialog.transient(parent.winfo_toplevel())

    ttk.Label(
        dialog,
        text="The selected video is shorter than the requested duration.",
        wraplength=360, justify="left",
    ).pack(padx=16, pady=16)

    button_row = ttk.Frame(dialog)
    button_row.pack(pady=(0, 16))

    def choose(value: str) -> None:
        result["choice"] = value
        dialog.destroy()

    ttk.Button(button_row, text="Cancel", command=lambda: choose("cancel")).pack(side="left", padx=8)
    ttk.Button(button_row, text="Loop Video", command=lambda: choose("loop")).pack(side="left", padx=8)

    dialog.grab_set()
    dialog.wait_window()
    return result["choice"]


def ask_crash_recovery_action(parent: tk.Misc, unfinished_count: int) -> str:
    """Returns 'resume', 'restart', or 'cancel'."""
    result = {"choice": "cancel"}
    dialog = tk.Toplevel(parent)
    dialog.title("Unfinished Job Detected")
    dialog.resizable(False, False)
    dialog.transient(parent.winfo_toplevel())

    ttk.Label(
        dialog,
        text=f"An unfinished job was detected ({unfinished_count}). What would you like to do?",
        wraplength=360, justify="left",
    ).pack(padx=16, pady=16)

    button_row = ttk.Frame(dialog)
    button_row.pack(pady=(0, 16))

    def choose(value: str) -> None:
        result["choice"] = value
        dialog.destroy()

    ttk.Button(button_row, text="Resume", command=lambda: choose("resume")).pack(side="left", padx=6)
    ttk.Button(button_row, text="Restart", command=lambda: choose("restart")).pack(side="left", padx=6)
    ttk.Button(button_row, text="Cancel", command=lambda: choose("cancel")).pack(side="left", padx=6)

    dialog.grab_set()
    dialog.wait_window()
    return result["choice"]


def show_edit_plan_preview(parent: tk.Misc, summary: dict) -> bool:
    """Returns True if the user clicked CREATE VIDEO, False for CANCEL."""
    result = {"proceed": False}
    dialog = tk.Toplevel(parent)
    dialog.title("Edit Plan Preview")
    dialog.resizable(False, False)
    dialog.transient(parent.winfo_toplevel())

    rows = [
        ("SOURCE", summary.get("source_filename", "")),
        ("SOURCE LENGTH", summary.get("source_length", "")),
        ("TARGET", summary.get("target_length", "")),
        ("CUTS", summary.get("cuts", "OFF")),
        ("INTERVAL", summary.get("interval", "-")),
        ("TRANSITION", summary.get("transition", "-")),
        ("MUSIC", summary.get("music", "-")),
        ("MUSIC VOLUME", summary.get("music_volume", "-")),
    ]
    body = ttk.Frame(dialog)
    body.pack(padx=16, pady=16)
    for row_index, (label, value) in enumerate(rows):
        ttk.Label(body, text=f"{label}:", font=("TkDefaultFont", 9, "bold")).grid(
            row=row_index, column=0, sticky="w", pady=2
        )
        ttk.Label(body, text=str(value)).grid(row=row_index, column=1, sticky="w", padx=(8, 0), pady=2)

    button_row = ttk.Frame(dialog)
    button_row.pack(pady=(0, 16))

    def choose(value: bool) -> None:
        result["proceed"] = value
        dialog.destroy()

    ttk.Button(button_row, text="Cancel", command=lambda: choose(False)).pack(side="left", padx=8)
    ttk.Button(button_row, text="Create Video", command=lambda: choose(True)).pack(side="left", padx=8)

    dialog.grab_set()
    dialog.wait_window()
    return result["proceed"]


def show_final_youtube_review(parent: tk.Misc, review: dict) -> bool:
    """Returns True if the user clicked PUBLISH, False for CANCEL."""
    result = {"publish": False}
    dialog = tk.Toplevel(parent)
    dialog.title("Final YouTube Review")
    dialog.resizable(False, False)
    dialog.transient(parent.winfo_toplevel())

    rows = [
        ("Title", review.get("title", "")),
        ("Description", review.get("description", "")[:200]),
        ("Tags", review.get("tags", "")),
        ("Playlist", review.get("playlist", "-")),
        ("Audience", review.get("audience", "-")),
        ("Visibility", review.get("visibility", "-")),
        ("Video", review.get("video", "")),
        ("Duration", review.get("duration", "")),
        ("Music", review.get("music", "-")),
    ]
    body = ttk.Frame(dialog)
    body.pack(padx=16, pady=16)
    for row_index, (label, value) in enumerate(rows):
        ttk.Label(body, text=f"{label}:", font=("TkDefaultFont", 9, "bold")).grid(
            row=row_index, column=0, sticky="nw", pady=2
        )
        ttk.Label(body, text=str(value), wraplength=320, justify="left").grid(
            row=row_index, column=1, sticky="w", padx=(8, 0), pady=2
        )

    button_row = ttk.Frame(dialog)
    button_row.pack(pady=(0, 16))

    def choose(value: bool) -> None:
        result["publish"] = value
        dialog.destroy()

    ttk.Button(button_row, text="Cancel", command=lambda: choose(False)).pack(side="left", padx=8)
    ttk.Button(button_row, text="Publish", command=lambda: choose(True)).pack(side="left", padx=8)

    dialog.grab_set()
    dialog.wait_window()
    return result["publish"]


class FirstRunWizard(tk.Toplevel):
    """9-step first-launch setup: FFmpeg, FFprobe, output folder, music
    folder, browser choice/profile, a browser test, a test render, finish."""

    STEP_TITLES = [
        "Locate FFmpeg", "Locate FFprobe", "Select Output Folder",
        "Select Music Folder", "Choose Browser", "Configure Browser Profile",
        "Test Browser", "Run Test Processing", "Finish",
    ]

    def __init__(self, parent: tk.Misc, settings_manager, on_test_browser=None, on_test_processing=None):
        super().__init__(parent)
        self.settings_manager = settings_manager
        self.on_test_browser = on_test_browser
        self.on_test_processing = on_test_processing
        self.step = 0
        self.completed = False

        self.title("First-Run Setup")
        self.resizable(False, False)
        self.transient(parent.winfo_toplevel())
        self.protocol("WM_DELETE_WINDOW", self._cancel)

        self.vars = {
            "ffmpeg_path": tk.StringVar(value=settings_manager.get().ffmpeg_path),
            "ffprobe_path": tk.StringVar(value=settings_manager.get().ffprobe_path),
            "output_folder": tk.StringVar(value=settings_manager.get().output_folder),
            "default_music_folder": tk.StringVar(value=settings_manager.get().default_music_folder),
            "browser": tk.StringVar(value=settings_manager.get().browser),
            "browser_executable": tk.StringVar(value=settings_manager.get().browser_executable),
            "browser_profile": tk.StringVar(value=settings_manager.get().browser_profile),
        }
        self.status_var = tk.StringVar(value="")

        self.header = ttk.Label(self, text="", font=("TkDefaultFont", 11, "bold"))
        self.header.pack(padx=16, pady=(16, 4), anchor="w")
        self.body = ttk.Frame(self)
        self.body.pack(padx=16, pady=8, fill="both", expand=True)

        nav = ttk.Frame(self)
        nav.pack(pady=(0, 16))
        self.back_btn = ttk.Button(nav, text="Back", command=self._back)
        self.back_btn.pack(side="left", padx=6)
        self.next_btn = ttk.Button(nav, text="Next", command=self._next)
        self.next_btn.pack(side="left", padx=6)

        self._render_step()
        self.grab_set()

    def _browse_file(self, var: tk.StringVar, title: str) -> None:
        from tkinter import filedialog
        path = filedialog.askopenfilename(title=title, parent=self)
        if path:
            var.set(path)

    def _browse_folder(self, var: tk.StringVar, title: str) -> None:
        from tkinter import filedialog
        path = filedialog.askdirectory(title=title, parent=self)
        if path:
            var.set(path)

    def _clear_body(self) -> None:
        for widget in self.body.winfo_children():
            widget.destroy()

    def _render_step(self) -> None:
        self._clear_body()
        self.header.configure(text=f"Step {self.step + 1} of {len(self.STEP_TITLES)}: {self.STEP_TITLES[self.step]}")
        self.back_btn.configure(state="normal" if self.step > 0 else "disabled")
        self.next_btn.configure(text="Finish" if self.step == len(self.STEP_TITLES) - 1 else "Next")

        builders = [
            self._step_ffmpeg, self._step_ffprobe, self._step_output_folder,
            self._step_music_folder, self._step_browser_choice, self._step_browser_profile,
            self._step_test_browser, self._step_test_processing, self._step_finish,
        ]
        builders[self.step]()

    def _path_row(self, label: str, var: tk.StringVar, browse_command) -> None:
        row = ttk.Frame(self.body)
        row.pack(fill="x", pady=4)
        ttk.Label(row, text=label, width=14).pack(side="left")
        ttk.Entry(row, textvariable=var, width=40).pack(side="left", padx=6)
        ttk.Button(row, text="Browse...", command=browse_command).pack(side="left")

    def _step_ffmpeg(self) -> None:
        ttk.Label(self.body, text="FFmpeg is required for video processing.\nSelect ffmpeg.exe.",
                  justify="left").pack(anchor="w", pady=(0, 8))
        self._path_row("ffmpeg.exe", self.vars["ffmpeg_path"],
                        lambda: self._browse_file(self.vars["ffmpeg_path"], "Select ffmpeg.exe"))

    def _step_ffprobe(self) -> None:
        ttk.Label(self.body, text="FFprobe reads video/audio information.\nSelect ffprobe.exe.",
                  justify="left").pack(anchor="w", pady=(0, 8))
        self._path_row("ffprobe.exe", self.vars["ffprobe_path"],
                        lambda: self._browse_file(self.vars["ffprobe_path"], "Select ffprobe.exe"))

    def _step_output_folder(self) -> None:
        ttk.Label(self.body, text="Where should finished videos be saved?", justify="left").pack(anchor="w", pady=(0, 8))
        self._path_row("Output folder", self.vars["output_folder"],
                        lambda: self._browse_folder(self.vars["output_folder"], "Select Output Folder"))

    def _step_music_folder(self) -> None:
        ttk.Label(self.body, text="Where is your phonk music library?", justify="left").pack(anchor="w", pady=(0, 8))
        self._path_row("Music folder", self.vars["default_music_folder"],
                        lambda: self._browse_folder(self.vars["default_music_folder"], "Select Music Folder"))

    def _step_browser_choice(self) -> None:
        ttk.Label(self.body, text="Which browser will you use for YouTube uploads?", justify="left").pack(
            anchor="w", pady=(0, 8)
        )
        for name in ("Chrome", "Edge"):
            ttk.Radiobutton(self.body, text=name, value=name, variable=self.vars["browser"]).pack(anchor="w")

    def _step_browser_profile(self) -> None:
        ttk.Label(
            self.body,
            text="Point at the browser executable and a dedicated automation\nprofile folder (not your everyday profile).",
            justify="left",
        ).pack(anchor="w", pady=(0, 8))
        self._path_row("Executable", self.vars["browser_executable"],
                        lambda: self._browse_file(self.vars["browser_executable"], "Select Browser Executable"))
        self._path_row("Profile folder", self.vars["browser_profile"],
                        lambda: self._browse_folder(self.vars["browser_profile"], "Select Profile Folder"))

    def _step_test_browser(self) -> None:
        ttk.Label(self.body, text="Test connecting to the browser.", justify="left").pack(anchor="w", pady=(0, 8))
        ttk.Label(self.body, textvariable=self.status_var, foreground="#555").pack(anchor="w", pady=(0, 8))

        def run_test() -> None:
            if self.on_test_browser is None:
                self.status_var.set("Browser test is unavailable in this session.")
                return
            success, message = self.on_test_browser()
            self.status_var.set(("Connected: " if success else "Failed: ") + message)

        ttk.Button(self.body, text="Test Browser Connection", command=run_test).pack(anchor="w")

    def _step_test_processing(self) -> None:
        ttk.Label(self.body, text="Run a quick test render to confirm FFmpeg works.", justify="left").pack(
            anchor="w", pady=(0, 8)
        )
        ttk.Label(self.body, textvariable=self.status_var, foreground="#555").pack(anchor="w", pady=(0, 8))

        def run_test() -> None:
            if self.on_test_processing is None:
                self.status_var.set("Test processing is unavailable in this session.")
                return
            success, message = self.on_test_processing()
            self.status_var.set(("Success: " if success else "Failed: ") + message)

        ttk.Button(self.body, text="Run Test Processing", command=run_test).pack(anchor="w")

    def _step_finish(self) -> None:
        ttk.Label(self.body, text="Setup complete. Click Finish to start using\nYouTube Phonk Automator.",
                  justify="left").pack(anchor="w")

    def _save_current_step(self) -> None:
        self.settings_manager.update(
            ffmpeg_path=self.vars["ffmpeg_path"].get(),
            ffprobe_path=self.vars["ffprobe_path"].get(),
            output_folder=self.vars["output_folder"].get(),
            default_music_folder=self.vars["default_music_folder"].get(),
            browser=self.vars["browser"].get(),
            browser_executable=self.vars["browser_executable"].get(),
            browser_profile=self.vars["browser_profile"].get(),
        )

    def _back(self) -> None:
        if self.step > 0:
            self.step -= 1
            self._render_step()

    def _next(self) -> None:
        self.status_var.set("")
        if self.step < len(self.STEP_TITLES) - 1:
            self.step += 1
            self._render_step()
        else:
            self._save_current_step()
            self.settings_manager.update(first_run_complete=True)
            self.completed = True
            self.destroy()

    def _cancel(self) -> None:
        self._save_current_step()
        self.destroy()


def confirm_auto_publish_warning(parent: tk.Misc) -> bool:
    return messagebox.askyesno(
        "Enable Auto Publish?",
        "With Auto Publish ON, videos will be published to YouTube "
        "immediately after upload completes, with no final review step. "
        "Only enable this if you are certain the Markdown metadata and "
        "settings are correct. Continue?",
        parent=parent,
    )
