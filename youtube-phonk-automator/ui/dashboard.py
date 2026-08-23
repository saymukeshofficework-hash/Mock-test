"""Main workflow screen: MD -> video -> music -> length -> edit options ->
create/preview/upload. Operates on whichever job is "current" (defaults to
the first job parsed from the last-selected Markdown file; the Jobs tab can
switch it via AppContext.set_current_job)."""
from __future__ import annotations

import threading
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, ttk

from core.ffmpeg_processor import ALLOWED_CUT_INTERVALS, ALLOWED_TRANSITION_DURATIONS, TRANSITION_TYPES
from core.job_manager import ShortVideoError
from core.music_manager import SELECTION_MODES, scan_music_folder
from core.video_manager import get_video_info, list_videos_in_folder
from ui.dialogs import ask_short_video_action, show_edit_plan_preview, show_error
from utils.validators import ValidationError, format_duration, parse_duration


class DashboardFrame(ttk.Frame):
    def __init__(self, parent: tk.Misc, ctx):
        super().__init__(parent)
        self.ctx = ctx
        self.current_job_id: int | None = None
        self._video_info = None
        self._rendering = False

        self._build_scroll_container()
        self._build_widgets()
        ctx.register_dashboard(self)

    # -- scroll container -------------------------------------------------
    def _build_scroll_container(self) -> None:
        """The form has many sections and easily runs taller than a small
        laptop screen (e.g. 1366x768 with taskbar/scaling) - wrap it in a
        scrollable canvas so every control, including the action buttons at
        the bottom, is always reachable regardless of screen size."""
        canvas = tk.Canvas(self, borderwidth=0, highlightthickness=0)
        scrollbar = ttk.Scrollbar(self, orient="vertical", command=canvas.yview)
        canvas.configure(yscrollcommand=scrollbar.set)
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        self.body = ttk.Frame(canvas, padding=12)
        body_window = canvas.create_window((0, 0), window=self.body, anchor="nw")

        def _on_body_configure(_event=None) -> None:
            canvas.configure(scrollregion=canvas.bbox("all"))

        def _on_canvas_configure(event) -> None:
            canvas.itemconfigure(body_window, width=event.width)

        self.body.bind("<Configure>", _on_body_configure)
        canvas.bind("<Configure>", _on_canvas_configure)

        def _on_mousewheel(event) -> None:
            canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

        def _bind_mousewheel(_event=None) -> None:
            canvas.bind_all("<MouseWheel>", _on_mousewheel)

        def _unbind_mousewheel(_event=None) -> None:
            canvas.unbind_all("<MouseWheel>")

        canvas.bind("<Enter>", _bind_mousewheel)
        canvas.bind("<Leave>", _unbind_mousewheel)

    # -- layout ---------------------------------------------------------
    def _build_widgets(self) -> None:
        self.body.columnconfigure(1, weight=1)
        row = 0

        row = self._section_markdown(row)
        row = self._section_video(row)
        row = self._section_music(row)
        row = self._section_length(row)
        row = self._section_audio(row)
        row = self._section_editing(row)
        row = self._section_output(row)
        row = self._section_youtube(row)
        row = self._section_actions(row)
        self._section_status(row)

    def _section_markdown(self, row: int) -> int:
        frame = ttk.LabelFrame(self.body, text="Markdown Data", padding=8)
        frame.grid(row=row, column=0, columnspan=2, sticky="ew", pady=4)
        frame.columnconfigure(1, weight=1)
        ttk.Button(frame, text="Browse .MD", command=self._browse_markdown).grid(row=0, column=0)
        self.md_label = ttk.Label(frame, text="Selected file: (none)")
        self.md_label.grid(row=0, column=1, sticky="w", padx=8)
        return row + 1

    def _section_video(self, row: int) -> int:
        frame = ttk.LabelFrame(self.body, text="Video", padding=8)
        frame.grid(row=row, column=0, columnspan=2, sticky="ew", pady=4)
        button_row = ttk.Frame(frame)
        button_row.pack(anchor="w")
        ttk.Button(button_row, text="Browse Video", command=self._browse_video).pack(side="left")
        ttk.Button(button_row, text="Browse Folder", command=self._browse_video_folder).pack(side="left", padx=6)
        self.video_info_label = ttk.Label(frame, text="Selected: (none)", justify="left")
        self.video_info_label.pack(anchor="w", pady=(6, 0))
        return row + 1

    def _section_music(self, row: int) -> int:
        frame = ttk.LabelFrame(self.body, text="Music", padding=8)
        frame.grid(row=row, column=0, columnspan=2, sticky="ew", pady=4)

        folder_row = ttk.Frame(frame)
        folder_row.pack(fill="x")
        ttk.Button(folder_row, text="Browse Folder", command=self._browse_music_folder).pack(side="left")
        self.music_folder_label = ttk.Label(folder_row, text="(none)")
        self.music_folder_label.pack(side="left", padx=8)

        select_row = ttk.Frame(frame)
        select_row.pack(fill="x", pady=(6, 0))
        ttk.Label(select_row, text="Mode:").pack(side="left")
        self.music_mode_var = tk.StringVar(value="manual")
        ttk.Combobox(
            select_row, textvariable=self.music_mode_var, values=SELECTION_MODES,
            state="readonly", width=14,
        ).pack(side="left", padx=6)
        ttk.Button(select_row, text="Select Music", command=self._browse_music_file).pack(side="left", padx=6)
        self.music_file_label = ttk.Label(select_row, text="(none)")
        self.music_file_label.pack(side="left", padx=6)
        return row + 1

    def _section_length(self, row: int) -> int:
        frame = ttk.LabelFrame(self.body, text="Video Length", padding=8)
        frame.grid(row=row, column=0, columnspan=2, sticky="ew", pady=4)
        ttk.Label(frame, text="Final Length (MM:SS or HH:MM:SS):").pack(side="left")
        self.length_var = tk.StringVar(value="03:30")
        ttk.Entry(frame, textvariable=self.length_var, width=10).pack(side="left", padx=8)
        return row + 1

    def _section_audio(self, row: int) -> int:
        frame = ttk.LabelFrame(self.body, text="Audio", padding=8)
        frame.grid(row=row, column=0, columnspan=2, sticky="ew", pady=4)

        self.remove_audio_var = tk.BooleanVar(value=True)
        self.add_music_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(frame, text="Remove original audio", variable=self.remove_audio_var).grid(row=0, column=0, sticky="w")
        ttk.Checkbutton(frame, text="Add music", variable=self.add_music_var).grid(row=0, column=1, sticky="w", padx=12)

        self.volume_var = tk.StringVar(value="0.65")
        self.fade_in_var = tk.StringVar(value="2")
        self.fade_out_var = tk.StringVar(value="3")
        ttk.Label(frame, text="Music Volume:").grid(row=1, column=0, sticky="w", pady=(6, 0))
        ttk.Entry(frame, textvariable=self.volume_var, width=8).grid(row=1, column=1, sticky="w", pady=(6, 0))
        ttk.Label(frame, text="Fade In (s):").grid(row=2, column=0, sticky="w")
        ttk.Entry(frame, textvariable=self.fade_in_var, width=8).grid(row=2, column=1, sticky="w")
        ttk.Label(frame, text="Fade Out (s):").grid(row=3, column=0, sticky="w")
        ttk.Entry(frame, textvariable=self.fade_out_var, width=8).grid(row=3, column=1, sticky="w")
        return row + 1

    def _section_editing(self, row: int) -> int:
        frame = ttk.LabelFrame(self.body, text="Editing", padding=8)
        frame.grid(row=row, column=0, columnspan=2, sticky="ew", pady=4)

        self.add_cuts_var = tk.BooleanVar(value=False)
        self.add_transitions_var = tk.BooleanVar(value=False)
        self.randomize_cuts_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(frame, text="Add cuts", variable=self.add_cuts_var).grid(row=0, column=0, sticky="w")
        ttk.Checkbutton(frame, text="Add transitions", variable=self.add_transitions_var).grid(row=0, column=1, sticky="w", padx=12)
        ttk.Checkbutton(frame, text="Randomize cut points", variable=self.randomize_cuts_var).grid(row=0, column=2, sticky="w")

        ttk.Label(frame, text="Cut interval (s):").grid(row=1, column=0, sticky="w", pady=(6, 0))
        self.cut_interval_var = tk.StringVar(value="20")
        ttk.Combobox(
            frame, textvariable=self.cut_interval_var,
            values=[str(v) for v in ALLOWED_CUT_INTERVALS], state="readonly", width=8,
        ).grid(row=1, column=1, sticky="w", pady=(6, 0))

        ttk.Label(frame, text="Transition:").grid(row=2, column=0, sticky="w")
        self.transition_type_var = tk.StringVar(value="crossfade")
        ttk.Combobox(
            frame, textvariable=self.transition_type_var, values=TRANSITION_TYPES,
            state="readonly", width=14,
        ).grid(row=2, column=1, sticky="w")

        ttk.Label(frame, text="Transition duration (s):").grid(row=3, column=0, sticky="w")
        self.transition_duration_var = tk.StringVar(value="0.5")
        ttk.Combobox(
            frame, textvariable=self.transition_duration_var,
            values=[str(v) for v in ALLOWED_TRANSITION_DURATIONS], state="readonly", width=8,
        ).grid(row=3, column=1, sticky="w")
        return row + 1

    def _section_output(self, row: int) -> int:
        frame = ttk.LabelFrame(self.body, text="Output", padding=8)
        frame.grid(row=row, column=0, columnspan=2, sticky="ew", pady=4)
        ttk.Button(frame, text="Browse Folder", command=self._browse_output_folder).pack(side="left")
        self.output_folder_label = ttk.Label(frame, text=self.ctx.settings.get().output_folder or "(none)")
        self.output_folder_label.pack(side="left", padx=8)
        return row + 1

    def _section_youtube(self, row: int) -> int:
        frame = ttk.LabelFrame(self.body, text="YouTube", padding=8)
        frame.grid(row=row, column=0, columnspan=2, sticky="ew", pady=4)
        self.browser_var = tk.StringVar(value=self.ctx.settings.get().browser)
        ttk.Radiobutton(frame, text="Chrome", value="Chrome", variable=self.browser_var).pack(side="left")
        ttk.Radiobutton(frame, text="Edge", value="Edge", variable=self.browser_var).pack(side="left", padx=8)
        ttk.Button(frame, text="Connect Browser", command=self._connect_browser).pack(side="left", padx=12)
        self.browser_status_label = ttk.Label(frame, text="Not Connected", foreground="#a33")
        self.browser_status_label.pack(side="left", padx=8)
        return row + 1

    def _section_actions(self, row: int) -> int:
        frame = ttk.Frame(self.body)
        frame.grid(row=row, column=0, columnspan=2, pady=8)
        ttk.Button(frame, text="CREATE VIDEO", command=self._on_create_video).pack(side="left", padx=4)
        ttk.Button(frame, text="PREVIEW VIDEO", command=self._on_preview_video).pack(side="left", padx=4)
        ttk.Button(frame, text="UPLOAD TO YOUTUBE", command=self._on_upload).pack(side="left", padx=4)
        return row + 1

    def _section_status(self, row: int) -> None:
        frame = ttk.Frame(self.body)
        frame.grid(row=row, column=0, columnspan=2, sticky="ew", pady=(8, 0))
        frame.columnconfigure(0, weight=1)
        self.status_var = tk.StringVar(value="Ready.")
        ttk.Label(frame, textvariable=self.status_var).grid(row=0, column=0, sticky="w")
        self.progress = ttk.Progressbar(frame, mode="determinate", maximum=100)
        self.progress.grid(row=1, column=0, sticky="ew", pady=(4, 0))

    # -- job loading ------------------------------------------------------
    def load_job(self, job_id: int) -> None:
        job = self.ctx.db.get_job(job_id)
        if job is None:
            return
        self.current_job_id = job_id
        self.md_label.configure(text=f"Selected file: {job['md_source_path'] or '(none)'}")
        self.length_var.set(format_duration(job["length_seconds"] or 210))
        self.remove_audio_var.set(bool(job["remove_audio"]))
        self.add_music_var.set(bool(job["add_music"]))
        self.volume_var.set(str(job["music_volume"]))
        self.fade_in_var.set(str(job["fade_in"]))
        self.fade_out_var.set(str(job["fade_out"]))
        self.add_cuts_var.set(bool(job["add_cuts"]))
        self.add_transitions_var.set(bool(job["add_transitions"]))
        self.randomize_cuts_var.set(bool(job["randomize_cuts"]))
        self.cut_interval_var.set(str(int(job["cut_interval"])))
        self.transition_type_var.set(job["transition_type"])
        self.transition_duration_var.set(str(job["transition_duration"]))
        self.music_mode_var.set(job["music_mode"] or "manual")
        self.music_file_label.configure(text=job["music_path"] or "(none)")

        if job["video_path"]:
            self._probe_video(Path(job["video_path"]))
        else:
            self.video_info_label.configure(text="Selected: (none)")
        self.status_var.set(f"Loaded job: {job['title']}")

    # -- markdown ---------------------------------------------------------
    def _browse_markdown(self) -> None:
        path = filedialog.askopenfilename(title="Select Markdown file", filetypes=[("Markdown", "*.md")])
        if not path:
            return
        try:
            job_ids = self.ctx.job_manager.create_jobs_from_markdown(Path(path))
        except ValidationError as exc:
            show_error(self, str(exc))
            return
        self.md_label.configure(text=f"Selected file: {path}")
        self.ctx.on_jobs_created(job_ids)
        if job_ids:
            self.load_job(job_ids[0])

    # -- video --------------------------------------------------------------
    def _probe_video(self, path: Path) -> None:
        settings = self.ctx.settings.get()
        try:
            info = get_video_info(settings.ffprobe_path, path)
        except ValidationError as exc:
            show_error(self, str(exc))
            return
        self._video_info = info
        resolution = f"{info.width} x {info.height}" if info.width else "unknown"
        self.video_info_label.configure(
            text=(
                f"Selected: {info.filename}\n"
                f"Duration: {format_duration(info.duration_seconds)}\n"
                f"Resolution: {resolution}\n"
                f"FPS: {info.fps or 'unknown'}\n"
                f"Codec: {info.codec or 'unknown'}\n"
                f"Audio: {'Yes' if info.has_audio else 'No'}"
            )
        )
        if self.current_job_id:
            self.ctx.job_manager.set_job_video(self.current_job_id, path)

    def _browse_video(self) -> None:
        path = filedialog.askopenfilename(
            title="Select Video",
            filetypes=[("Video files", "*.mp4 *.mov *.mkv *.avi *.webm *.m4v"), ("All files", "*.*")],
        )
        if path:
            self._probe_video(Path(path))

    def _browse_video_folder(self) -> None:
        folder = filedialog.askdirectory(title="Select Video Folder")
        if not folder:
            return
        try:
            videos = list_videos_in_folder(Path(folder))
        except ValidationError as exc:
            show_error(self, str(exc))
            return
        if not videos:
            show_error(self, "No supported video files found in that folder.")
            return
        self._probe_video(videos[0])

    # -- music ------------------------------------------------------------
    def _browse_music_folder(self) -> None:
        folder = filedialog.askdirectory(title="Select Music Folder")
        if not folder:
            return
        self.music_folder_label.configure(text=folder)
        self.ctx.settings.update(default_music_folder=folder)

    def _browse_music_file(self) -> None:
        folder = self.ctx.settings.get().default_music_folder
        path = filedialog.askopenfilename(
            title="Select Music",
            initialdir=folder or None,
            filetypes=[("Audio files", "*.mp3 *.wav *.m4a *.aac *.flac"), ("All files", "*.*")],
        )
        if not path:
            return
        self.music_file_label.configure(text=path)
        self.music_mode_var.set("manual")
        if self.current_job_id:
            self.ctx.job_manager.set_job_music(self.current_job_id, "manual", Path(path))

    # -- output / browser ---------------------------------------------------
    def _browse_output_folder(self) -> None:
        folder = filedialog.askdirectory(title="Select Output Folder")
        if not folder:
            return
        self.output_folder_label.configure(text=folder)
        self.ctx.settings.update(output_folder=folder)

    def _connect_browser(self) -> None:
        self.status_var.set("Connecting to browser...")

        def work():
            success, message = self.ctx.connect_browser(self.browser_var.get())
            self.after(0, lambda: self._on_browser_connected(success, message))

        threading.Thread(target=work, daemon=True).start()

    def _on_browser_connected(self, success: bool, message: str) -> None:
        self.browser_status_label.configure(
            text="Connected" if success else "Not Connected",
            foreground="#2a2" if success else "#a33",
        )
        self.status_var.set(message)

    # -- collect current form state into the job row -----------------------
    def _save_form_to_job(self) -> None:
        if not self.current_job_id:
            return
        target_seconds = parse_duration(self.length_var.get())
        self.ctx.db.update_job(
            self.current_job_id,
            length_seconds=target_seconds,
            remove_audio=int(self.remove_audio_var.get()),
            add_music=int(self.add_music_var.get()),
            music_volume=float(self.volume_var.get()),
            fade_in=float(self.fade_in_var.get()),
            fade_out=float(self.fade_out_var.get()),
            add_cuts=int(self.add_cuts_var.get()),
            cut_interval=float(self.cut_interval_var.get()),
            randomize_cuts=int(self.randomize_cuts_var.get()),
            add_transitions=int(self.add_transitions_var.get()),
            transition_type=self.transition_type_var.get(),
            transition_duration=float(self.transition_duration_var.get()),
            music_mode=self.music_mode_var.get(),
            quality_preset=self.ctx.settings.get().quality_preset,
        )

    # -- create video ---------------------------------------------------
    def _on_create_video(self) -> None:
        if self._rendering:
            return
        if not self.current_job_id:
            show_error(self, "Please select a Markdown file.")
            return
        if not self._video_info:
            show_error(self, "Please select a video.")
            return
        try:
            self._save_form_to_job()
        except (ValidationError, ValueError) as exc:
            show_error(self, str(exc))
            return

        job = self.ctx.db.get_job(self.current_job_id)
        summary = {
            "source_filename": self._video_info.filename,
            "source_length": format_duration(self._video_info.duration_seconds),
            "target_length": format_duration(job["length_seconds"]),
            "cuts": "ON" if job["add_cuts"] else "OFF",
            "interval": f"{job['cut_interval']} seconds" if job["add_cuts"] else "-",
            "transition": job["transition_type"] if job["add_transitions"] else "Hard Cut",
            "music": job["music_path"] or job["music_mode"] if job["add_music"] else "None",
            "music_volume": job["music_volume"] if job["add_music"] else "-",
        }
        if not show_edit_plan_preview(self, summary):
            return

        self._start_render(loop_confirmed=False)

    def _start_render(self, loop_confirmed: bool) -> None:
        self._rendering = True
        self.status_var.set("Preparing...")
        self.progress["value"] = 0
        settings = self.ctx.settings.get()
        job_id = self.current_job_id

        def on_progress(fraction: float) -> None:
            self.after(0, lambda: self.progress.configure(value=fraction * 100))

        def work():
            try:
                result = self.ctx.job_manager.process_job(
                    job_id, settings.ffmpeg_path, settings.ffprobe_path,
                    loop_confirmed=loop_confirmed, on_progress=on_progress,
                )
                self.after(0, lambda: self._on_render_done(result))
            except ShortVideoError:
                self.after(0, self._on_short_video)
            except ValidationError as exc:
                self.after(0, lambda: self._on_render_error(exc))

        threading.Thread(target=work, daemon=True).start()

    def _on_short_video(self) -> None:
        self._rendering = False
        choice = ask_short_video_action(self)
        if choice == "loop":
            self._start_render(loop_confirmed=True)
        else:
            self.status_var.set("Cancelled.")

    def _on_render_error(self, exc: Exception) -> None:
        self._rendering = False
        self.status_var.set("Rendering failed.")
        show_error(self, "Rendering failed.", exc)

    def _on_render_done(self, result) -> None:
        self._rendering = False
        if result.success:
            self.status_var.set(f"Ready. Output: {result.output_path}")
            self.progress["value"] = 100
            if result.fallback_warning:
                show_error(self, result.fallback_warning)
        else:
            self.status_var.set("Rendering failed.")
            show_error(self, "Rendering failed.")

    # -- preview / upload -------------------------------------------------
    def _on_preview_video(self) -> None:
        if not self.current_job_id:
            return
        job = self.ctx.db.get_job(self.current_job_id)
        if not job["output_path"]:
            show_error(self, "Please create the video first.")
            return
        self.ctx.open_with_default_player(Path(job["output_path"]))

    def _on_upload(self) -> None:
        if not self.current_job_id:
            show_error(self, "Please select a Markdown file.")
            return
        job = self.ctx.db.get_job(self.current_job_id)
        if not job["output_path"]:
            show_error(self, "Please create the video first.")
            return
        self.ctx.start_upload_flow(self.current_job_id)
