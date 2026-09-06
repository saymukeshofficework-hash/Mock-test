"""Watchers that decide when to announce "flip the pages".

Two independent signals, either of which can be switched off in config:

1. Spooler check (Windows only, most reliable): a print job's status
   includes JOB_STATUS_USER_INTERVENTION whenever Windows is waiting on the
   user for that job — which is exactly the state a manual-duplex printer
   like the G3000 sits in between side 1 and side 2.

2. Window-title check (fallback): some printer utilities show their own
   "reload the paper" dialog instead of going through the spooler flag.
   This scans visible window titles for configurable keywords.

Both watchers track per-item (job id / window handle) alert timestamps so
the same prompt is re-announced every repeat_interval_seconds instead of
being spoken once and then ignored, and so a resolved prompt stops nagging.
"""
import sys
import time

from config import matches_keyword

_IS_WINDOWS = sys.platform == "win32"

if _IS_WINDOWS:
    try:
        import win32print
    except ImportError:  # pragma: no cover - environment dependent
        win32print = None
    try:
        import win32gui
    except ImportError:  # pragma: no cover - environment dependent
        win32gui = None
else:  # pragma: no cover - non-Windows dev/test environment
    win32print = None
    win32gui = None


class SpoolerWatcher:
    """Polls the print queue for jobs stuck waiting on user intervention."""

    def __init__(self):
        self._last_alert = {}  # job_id -> epoch seconds

    def available(self):
        return win32print is not None

    def poll(self, printer_name, repeat_interval, now=None):
        """Return True if an alert should fire right now."""
        if win32print is None:
            return False
        now = now if now is not None else time.time()
        name = printer_name or win32print.GetDefaultPrinter()
        handle = win32print.OpenPrinter(name)
        try:
            jobs = win32print.EnumJobs(handle, 0, -1, 2)
        finally:
            win32print.ClosePrinter(handle)

        active_ids = set()
        should_alert = False
        for job in jobs:
            if job["Status"] & win32print.JOB_STATUS_USER_INTERVENTION:
                job_id = job["JobId"]
                active_ids.add(job_id)
                last = self._last_alert.get(job_id)
                if last is None or now - last >= repeat_interval:
                    should_alert = True
                    self._last_alert[job_id] = now

        for job_id in list(self._last_alert):
            if job_id not in active_ids:
                del self._last_alert[job_id]

        return should_alert


class WindowTitleWatcher:
    """Polls visible window titles for duplex-prompt keywords."""

    def __init__(self):
        self._last_alert = {}  # window handle -> epoch seconds

    def available(self):
        return win32gui is not None

    def poll(self, keywords, repeat_interval, now=None):
        if win32gui is None:
            return False
        now = now if now is not None else time.time()

        matched_handles = set()

        def callback(hwnd, _):
            if not win32gui.IsWindowVisible(hwnd):
                return
            title = win32gui.GetWindowText(hwnd)
            if matches_keyword(title, keywords):
                matched_handles.add(hwnd)

        win32gui.EnumWindows(callback, None)

        should_alert = False
        for hwnd in matched_handles:
            last = self._last_alert.get(hwnd)
            if last is None or now - last >= repeat_interval:
                should_alert = True
                self._last_alert[hwnd] = now

        for hwnd in list(self._last_alert):
            if hwnd not in matched_handles:
                del self._last_alert[hwnd]

        return should_alert
