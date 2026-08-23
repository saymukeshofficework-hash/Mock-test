"""Attaches Playwright to an ALREADY RUNNING Chrome/Edge via CDP.

This module never launches a browser with a fresh, automated login flow and
never touches Google credentials - the user signs into YouTube themselves,
in a real browser window, before clicking "Connect Browser". We only attach
to that existing session over the Chrome DevTools Protocol.

Playwright is imported lazily (inside functions) so the rest of the app -
including this module's own import - works even when the optional
``playwright`` package isn't installed; only browser features fail, with a
friendly message.
"""
from __future__ import annotations

from utils.validators import ValidationError

DEFAULT_CDP_PORT = 9222


class BrowserConnectionError(ValidationError):
    pass


def build_launch_command(executable_path: str, profile_dir: str, port: int = DEFAULT_CDP_PORT) -> list[str]:
    """Argv the user can run themselves to start Chrome/Edge with remote
    debugging enabled, using a dedicated automation profile (never their
    everyday profile - see CLAUDE.md)."""
    if not executable_path:
        raise BrowserConnectionError("Please choose a browser executable in Settings.")
    return [
        executable_path,
        f"--remote-debugging-port={port}",
        f"--user-data-dir={profile_dir}" if profile_dir else "--user-data-dir=./browser_profile",
    ]


class BrowserManager:
    def __init__(
        self,
        browser_type: str,
        executable_path: str | None = None,
        profile_dir: str | None = None,
        cdp_url: str | None = None,
    ):
        self.browser_type = browser_type
        self.executable_path = executable_path
        self.profile_dir = profile_dir
        self.cdp_url = cdp_url or f"http://localhost:{DEFAULT_CDP_PORT}"
        self._playwright = None
        self._browser = None
        self._context = None

    def connect(self) -> None:
        """Attach to the browser already listening on ``cdp_url``. Raises
        BrowserConnectionError (friendly message) if nothing is listening -
        never silently proceeds without a real connection."""
        try:
            from playwright.sync_api import sync_playwright
        except ImportError as exc:
            raise BrowserConnectionError(
                "Playwright is not installed. Run: pip install playwright && playwright install chromium"
            ) from exc

        self._playwright = sync_playwright().start()
        try:
            self._browser = self._playwright.chromium.connect_over_cdp(self.cdp_url)
        except Exception as exc:
            self._playwright.stop()
            self._playwright = None
            raise BrowserConnectionError(
                f"Could not connect to {self.browser_type}. Make sure it is running with "
                f"remote debugging enabled ({self.cdp_url}) and try again."
            ) from exc

        self._context = self._browser.contexts[0] if self._browser.contexts else self._browser.new_context()

    def new_page(self):
        if self._context is None:
            raise BrowserConnectionError("Browser is not connected. Click 'Connect Browser' first.")
        return self._context.new_page()

    def is_connected(self) -> bool:
        return self._browser is not None and self._browser.is_connected()

    def close(self) -> None:
        if self._playwright is not None:
            self._playwright.stop()
        self._playwright = None
        self._browser = None
        self._context = None
