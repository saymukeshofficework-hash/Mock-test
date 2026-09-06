"""Background text-to-speech worker.

pyttsx3's engine is not safe to call from multiple threads at once, so all
speech requests go through one queue and one dedicated worker thread. If
pyttsx3 (or a working voice backend) isn't available, messages are printed
to the console instead of crashing the app.
"""
import queue
import threading


class Speaker:
    def __init__(self):
        self._queue = queue.Queue()
        self._engine = None
        self._engine_ok = False
        try:
            import pyttsx3
            self._engine = pyttsx3.init()
            self._engine_ok = True
        except Exception as exc:  # pragma: no cover - environment dependent
            print(f"[speaker] TTS engine unavailable, falling back to console: {exc}")

        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def say(self, text):
        self._queue.put(text)

    def _run(self):
        while True:
            text = self._queue.get()
            if self._engine_ok:
                try:
                    self._engine.say(text)
                    self._engine.runAndWait()
                    continue
                except Exception as exc:  # pragma: no cover - environment dependent
                    print(f"[speaker] TTS failed, falling back to console: {exc}")
                    self._engine_ok = False
            print(f"[speaker] {text}")
