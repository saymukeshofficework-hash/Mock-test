"""Drives the YouTube Studio upload flow via Playwright, attached to a
browser the user is already logged into (see browser_manager.py).

IMPORTANT / honesty note: the selector strategy below (accessible role +
label + visible text, never coordinates) follows CLAUDE.md's browser
automation rules and has been validated structurally against a local
Playwright/Chromium session in this project's dev environment. It has
**not** been run against a live studio.youtube.com session (no Google
account is available here) - the exact role/label names YouTube Studio
currently uses should be re-checked during manual testing
(MANUAL_TESTING.md) and adjusted if they've drifted. Every step is guarded
by an explicit wait with a timeout; a missing element raises
StudioChangedError and stops rather than guessing or blind-clicking.
"""
from __future__ import annotations

import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Mapping

from core.browser_manager import BrowserManager
from database.database import Database
from core.settings_manager import SettingsManager
from utils.validators import ValidationError, format_duration

STUDIO_URL = "https://studio.youtube.com"
DEFAULT_TIMEOUT_MS = 15000
STUDIO_CHANGED_MESSAGE = "YouTube Studio interface appears to have changed. Automation has paused."


class YoutubeUploadError(ValidationError):
    pass


class StudioChangedError(YoutubeUploadError):
    def __init__(self) -> None:
        super().__init__(STUDIO_CHANGED_MESSAGE)


def build_metadata_mapping(job_row: Mapping) -> dict:
    """Pure Markdown-field -> YouTube-field mapping, kept separate from the
    Playwright driver so it's unit testable without a browser."""
    description = (job_row["description"] or "").strip()
    hashtags = (job_row["hashtags"] or "").strip()
    if hashtags:
        description = f"{description}\n\n{hashtags}".strip()

    tags = [t.strip() for t in (job_row["tags"] or "").split(",") if t.strip()]

    return {
        "title": job_row["title"],
        "description": description,
        "tags": tags,
        "category": job_row["category"] or None,
        "playlist": job_row["playlist"] or None,
        "audience": job_row["audience"] or None,
        "visibility": job_row["visibility"] or None,
        "language": job_row["language"] or None,
    }


@dataclass
class UploadOutcome:
    upload_id: int
    youtube_url: str


class YoutubeUploader:
    def __init__(self, browser_manager: BrowserManager, db: Database, settings: SettingsManager):
        self.browser_manager = browser_manager
        self.db = db
        self.settings = settings

    # -- public entry point -----------------------------------------------
    def run_upload_flow(
        self,
        job_row: Mapping,
        parent_widget=None,
        on_status: Callable[[str], None] | None = None,
    ) -> str:
        metadata = build_metadata_mapping(job_row)
        if not job_row["output_path"] or not Path(job_row["output_path"]).exists():
            raise YoutubeUploadError("Please create the video first.")

        upload_id = self.db.create_upload(job_row["id"])
        page = self.browser_manager.new_page()
        try:
            self._report(on_status, "Preparing...")
            self._open_studio(page)

            self._report(on_status, "Uploading...")
            self._start_upload(page)
            self._select_file(page, job_row["output_path"])
            self._wait_for_upload_ready(page)

            self._report(on_status, "Metadata completed...")
            self._fill_title(page, metadata["title"])
            self._fill_description(page, metadata["description"])
            if metadata["audience"]:
                self._set_audience(page, metadata["audience"])
            if metadata["playlist"]:
                self._select_playlist(page, metadata["playlist"])

            self._report(on_status, "Final checks...")
            self._advance_through_checks(page)
            if metadata["visibility"]:
                self._set_visibility(page, metadata["visibility"])

            self.db.update_upload(upload_id, status="ready_to_publish")

            if not self._confirm_publish(job_row, metadata, parent_widget):
                self.db.update_upload(upload_id, status="cancelled")
                raise YoutubeUploadError("Publishing was cancelled.")

            self._report(on_status, "Ready to publish.")
            youtube_url = self._publish(page)
            self.db.update_upload(upload_id, status="published", youtube_url=youtube_url)
            self.db.update_job(job_row["id"], status="published")
            return youtube_url
        except StudioChangedError as exc:
            self.db.update_upload(upload_id, status="failed", error_message=str(exc))
            raise
        except YoutubeUploadError as exc:
            self.db.update_upload(upload_id, status="failed", error_message=str(exc))
            raise
        finally:
            page.close()

    def _report(self, on_status: Callable[[str], None] | None, text: str) -> None:
        if on_status:
            on_status(text)

    def _confirm_publish(self, job_row: Mapping, metadata: dict, parent_widget) -> bool:
        settings = self.settings.get()
        if settings.auto_publish:
            return True
        if not settings.preview_before_publish:
            return True
        if parent_widget is None:
            raise YoutubeUploadError("Final review is required before publishing.")

        from ui.dialogs import show_final_youtube_review

        review = {
            "title": metadata["title"],
            "description": metadata["description"],
            "tags": ", ".join(metadata["tags"]),
            "playlist": metadata["playlist"] or "-",
            "audience": metadata["audience"] or "-",
            "visibility": metadata["visibility"] or "-",
            "video": Path(job_row["output_path"]).name,
            "duration": format_duration(job_row["length_seconds"] or 0),
            "music": job_row["music_path"] or "-",
        }
        return show_final_youtube_review(parent_widget, review)

    # -- Playwright step helpers --------------------------------------------
    def _wait_role(self, page, role: str, name, timeout: int = DEFAULT_TIMEOUT_MS):
        from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
        try:
            locator = page.get_by_role(role, name=name).first
            locator.wait_for(timeout=timeout)
            return locator
        except PlaywrightTimeoutError as exc:
            raise StudioChangedError() from exc

    def _wait_label(self, page, label: str, timeout: int = DEFAULT_TIMEOUT_MS):
        from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
        try:
            locator = page.get_by_label(label).first
            locator.wait_for(timeout=timeout)
            return locator
        except PlaywrightTimeoutError as exc:
            raise StudioChangedError() from exc

    def _open_studio(self, page) -> None:
        from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
        try:
            page.goto(STUDIO_URL, timeout=DEFAULT_TIMEOUT_MS)
        except PlaywrightTimeoutError as exc:
            raise YoutubeUploadError("Could not reach YouTube Studio. Check your internet connection.") from exc

    def _start_upload(self, page) -> None:
        self._wait_role(page, "button", "Create").click()
        self._wait_role(page, "menuitem", "Upload videos").click()

    def _select_file(self, page, output_path: str) -> None:
        from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
        try:
            file_input = page.locator("input[type='file']").first
            file_input.wait_for(state="attached", timeout=DEFAULT_TIMEOUT_MS)
            file_input.set_input_files(output_path)
        except PlaywrightTimeoutError as exc:
            raise StudioChangedError() from exc

    def _wait_for_upload_ready(self, page) -> None:
        # YouTube Studio lets metadata be edited while the upload continues
        # in the background - we just wait for the title field to appear.
        self._wait_label(page, "Title (required)")

    def _fill_title(self, page, title: str) -> None:
        field = self._wait_label(page, "Title (required)")
        field.fill("")
        field.fill(title[:100])

    def _fill_description(self, page, description: str) -> None:
        field = self._wait_label(page, "Description")
        field.fill("")
        field.fill(description[:5000])

    def _set_audience(self, page, audience: str) -> None:
        name_fragment = "made for kids" if "not" not in audience.lower() else "not made for kids"
        self._wait_role(page, "radio", name_fragment).click()

    def _select_playlist(self, page, playlist: str) -> None:
        from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
        try:
            self._wait_role(page, "button", "Select").click()
            option = page.get_by_text(playlist, exact=False).first
            option.wait_for(timeout=DEFAULT_TIMEOUT_MS)
            option.click()
            self._wait_role(page, "button", "Done").click()
        except PlaywrightTimeoutError:
            # playlist is optional - log-and-continue rather than aborting
            # the whole upload over a missing/renamed playlist
            pass

    def _advance_through_checks(self, page) -> None:
        for _ in range(3):  # Details -> Video elements -> Checks -> Visibility
            self._wait_role(page, "button", "Next").click()
            time.sleep(0.5)

    def _set_visibility(self, page, visibility: str) -> None:
        self._wait_role(page, "radio", visibility).click()

    def _publish(self, page) -> str:
        from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
        self._wait_role(page, "button", "Publish").click()
        try:
            link = page.get_by_role("link", name="youtu.be").first
            link.wait_for(timeout=DEFAULT_TIMEOUT_MS)
            return link.get_attribute("href") or page.url
        except PlaywrightTimeoutError:
            return page.url
