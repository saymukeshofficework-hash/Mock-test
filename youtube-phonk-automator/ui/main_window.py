"""App shell: creates Database/SettingsManager/JobManager, wires the tabs
together, and runs the first-run wizard / crash-recovery prompt on launch."""
from __future__ import annotations

import subprocess
import sys
import tkinter as tk
from pathlib import Path
from tkinter import ttk

from core.job_manager import JobManager
from core.settings_manager import SettingsManager
from database.database import Database
from ui.dashboard import DashboardFrame
from ui.dialogs import FirstRunWizard, ask_crash_recovery_action, show_error
from ui.history import HistoryFrame
from ui.jobs import JobsFrame
from ui.logs import LogsFrame
from ui.settings import SettingsFrame
from utils.logger import get_logger
from utils.system_info import get_resource_snapshot

RESOURCE_POLL_MS = 5000


class AppContext:
    """Shared state/services passed to every tab. Deliberately not a
    god-object of UI logic - it only holds services and small pieces of
    cross-tab coordination (which job is "current", browser connection)."""

    def __init__(self, root: tk.Tk, base_dir: Path):
        self.root = root
        self.base_dir = base_dir
        self.logs_dir = base_dir / "logs"
        self.logger = get_logger("ui")

        self.db = Database(base_dir / "youtube_automator.db")
        self.settings = SettingsManager(self.db)
        self.job_manager = JobManager(self.db, self.settings)

        self._dashboard = None
        self._jobs_frame = None
        self._browser_manager = None

    def register_dashboard(self, dashboard) -> None:
        self._dashboard = dashboard

    def register_jobs_frame(self, jobs_frame) -> None:
        self._jobs_frame = jobs_frame

    def on_jobs_created(self, job_ids: list[int]) -> None:
        if self._jobs_frame:
            self._jobs_frame.refresh()

    def set_current_job(self, job_id: int) -> None:
        if self._dashboard:
            self._dashboard.load_job(job_id)

    def open_with_default_player(self, path: Path) -> None:
        try:
            if sys.platform == "win32":
                import os
                os.startfile(str(path))  # noqa: S606
            elif sys.platform == "darwin":
                subprocess.run(["open", str(path)], check=False)
            else:
                subprocess.run(["xdg-open", str(path)], check=False)
        except OSError as exc:
            self.logger.error("Could not open preview: %s", exc)

    def connect_browser(self, browser_name: str) -> tuple[bool, str]:
        settings = self.settings.get()
        try:
            from core.browser_manager import BrowserManager
        except ImportError as exc:
            return False, f"Browser automation is unavailable: {exc}"

        try:
            self._browser_manager = BrowserManager(
                browser_type=browser_name,
                executable_path=settings.browser_executable or None,
                profile_dir=settings.browser_profile or None,
            )
            self._browser_manager.connect()
            return True, "Connected"
        except Exception as exc:  # noqa: BLE001 - surfaced to the user, not swallowed
            self.logger.error("Browser connection failed: %s", exc)
            return False, str(exc)

    def start_upload_flow(self, job_id: int) -> None:
        if self._browser_manager is None:
            show_error(self.root, "Please connect a browser first.")
            return
        try:
            from core.youtube_uploader import YoutubeUploader
        except ImportError as exc:
            show_error(self.root, f"Browser automation is unavailable: {exc}")
            return

        job = self.db.get_job(job_id)
        uploader = YoutubeUploader(self._browser_manager, self.db, self.settings)
        try:
            uploader.run_upload_flow(job, parent_widget=self.root)
        except Exception as exc:  # noqa: BLE001
            self.logger.error("Upload failed: %s", exc)
            show_error(self.root, "Upload failed.", exc)


class MainWindow(tk.Tk):
    def __init__(self, base_dir: Path):
        super().__init__()
        self.title("YouTube Phonk Automator")
        self.geometry("900x760")

        self.ctx = AppContext(self, base_dir)

        notebook = ttk.Notebook(self)
        notebook.pack(fill="both", expand=True)

        dashboard = DashboardFrame(notebook, self.ctx)
        jobs = JobsFrame(notebook, self.ctx)
        history = HistoryFrame(notebook, self.ctx)
        settings = SettingsFrame(notebook, self.ctx)
        logs = LogsFrame(notebook, self.ctx)

        notebook.add(dashboard, text="Dashboard")
        notebook.add(jobs, text="Jobs")
        notebook.add(history, text="History")
        notebook.add(settings, text="Settings")
        notebook.add(logs, text="Logs")

        self.resource_label = ttk.Label(self, text="")
        self.resource_label.pack(anchor="e", padx=8, pady=(0, 4))

        self.after(200, self._maybe_show_first_run_wizard)
        self.after(400, self._maybe_show_crash_recovery)
        self.after(RESOURCE_POLL_MS, self._poll_resources)

    def _maybe_show_first_run_wizard(self) -> None:
        if not self.ctx.settings.get().first_run_complete:
            FirstRunWizard(self, self.ctx.settings)

    def _maybe_show_crash_recovery(self) -> None:
        unfinished = self.ctx.job_manager.find_unfinished_jobs()
        if not unfinished:
            return
        choice = ask_crash_recovery_action(self, len(unfinished))
        for job in unfinished:
            if choice == "resume":
                self.ctx.job_manager.resume_job(job["id"])
            elif choice == "restart":
                self.ctx.job_manager.restart_job(job["id"])
            else:
                self.ctx.job_manager.cancel_job(job["id"])

    def _poll_resources(self) -> None:
        snapshot = get_resource_snapshot()
        if snapshot.ram_available_mb is not None:
            text = f"RAM available: {snapshot.ram_available_mb:.0f} MB"
            if snapshot.low_memory:
                text += "  ⚠ Low memory"
            self.resource_label.configure(text=text)
        self.after(RESOURCE_POLL_MS, self._poll_resources)

    def on_close(self) -> None:
        self.ctx.db.close()
        self.destroy()
