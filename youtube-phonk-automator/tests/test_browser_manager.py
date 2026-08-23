import os
import shutil
import subprocess
import time
import unittest

from core.browser_manager import BrowserConnectionError, BrowserManager, build_launch_command

try:
    import playwright  # noqa: F401
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

# Only set in dev environments that have a local Chromium for real CDP
# testing (see MANUAL_TESTING.md); CI/most machines won't have this and the
# integration test below is skipped rather than failing.
CHROMIUM_PATH = os.environ.get("PHONK_TEST_CHROMIUM_PATH", "")


class TestBuildLaunchCommand(unittest.TestCase):
    def test_builds_expected_argv(self):
        command = build_launch_command("C:/Chrome/chrome.exe", "C:/profiles/automation", port=9222)
        self.assertEqual(command[0], "C:/Chrome/chrome.exe")
        self.assertIn("--remote-debugging-port=9222", command)
        self.assertIn("--user-data-dir=C:/profiles/automation", command)

    def test_missing_executable_raises(self):
        with self.assertRaises(BrowserConnectionError):
            build_launch_command("", "C:/profiles/automation")

    def test_default_profile_dir_used_when_missing(self):
        command = build_launch_command("chrome", "")
        self.assertTrue(any(part.startswith("--user-data-dir=") for part in command))


class TestBrowserManagerWithoutPlaywright(unittest.TestCase):
    def test_connect_without_playwright_raises_friendly_error(self):
        if PLAYWRIGHT_AVAILABLE:
            self.skipTest("playwright is installed in this environment")
        manager = BrowserManager("Chrome")
        with self.assertRaises(BrowserConnectionError):
            manager.connect()

    def test_connect_to_nothing_listening_raises_friendly_error(self):
        if not PLAYWRIGHT_AVAILABLE:
            self.skipTest("playwright is not installed")
        manager = BrowserManager("Chrome", cdp_url="http://localhost:1")
        with self.assertRaises(BrowserConnectionError):
            manager.connect()


@unittest.skipUnless(
    PLAYWRIGHT_AVAILABLE and CHROMIUM_PATH and shutil.which(CHROMIUM_PATH) or os.path.exists(CHROMIUM_PATH),
    "requires playwright + PHONK_TEST_CHROMIUM_PATH pointing at a real Chromium binary",
)
class TestBrowserManagerRealCdpAttach(unittest.TestCase):
    """Genuine integration test: launches a real (headless) Chromium with
    remote debugging enabled - simulating the user's already-open browser -
    then verifies BrowserManager.connect() actually attaches to it over CDP
    and can drive a page, exercising the exact code path used in
    production. Skipped unless PHONK_TEST_CHROMIUM_PATH is set."""

    PORT = 9333

    def setUp(self):
        self.profile_dir = "/tmp/phonk_test_profile"
        self.process = subprocess.Popen([
            CHROMIUM_PATH, "--headless=new", f"--remote-debugging-port={self.PORT}",
            "--no-sandbox", f"--user-data-dir={self.profile_dir}",
        ])
        time.sleep(1.5)

    def tearDown(self):
        self.process.terminate()
        self.process.wait(timeout=5)

    def test_connect_and_use_role_based_locator(self):
        manager = BrowserManager("Chrome", cdp_url=f"http://localhost:{self.PORT}")
        manager.connect()
        try:
            self.assertTrue(manager.is_connected())
            page = manager.new_page()
            page.set_content('<html><body><button aria-label="Publish">Publish</button></body></html>')
            locator = page.get_by_role("button", name="Publish")
            self.assertEqual(locator.count(), 1)
        finally:
            manager.close()


if __name__ == "__main__":
    unittest.main()
