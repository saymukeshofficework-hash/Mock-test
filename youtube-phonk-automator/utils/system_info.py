"""Lightweight, low-frequency resource monitoring.

Uses psutil when available (declared in requirements.txt) and degrades to
"unknown" values otherwise, rather than pulling in a heavier dependency.
Callers are responsible for not polling this faster than a few seconds.
"""
from __future__ import annotations

from dataclasses import dataclass

try:
    import psutil
except ImportError:  # pragma: no cover - exercised only when psutil is missing
    psutil = None

LOW_MEMORY_WARNING_MB = 400


@dataclass
class ResourceSnapshot:
    ram_used_mb: float | None
    ram_available_mb: float | None
    ram_percent: float | None
    cpu_percent: float | None

    @property
    def low_memory(self) -> bool:
        return self.ram_available_mb is not None and self.ram_available_mb < LOW_MEMORY_WARNING_MB


def get_resource_snapshot() -> ResourceSnapshot:
    if psutil is None:
        return ResourceSnapshot(None, None, None, None)

    vm = psutil.virtual_memory()
    return ResourceSnapshot(
        ram_used_mb=vm.used / (1024 * 1024),
        ram_available_mb=vm.available / (1024 * 1024),
        ram_percent=vm.percent,
        cpu_percent=psutil.cpu_percent(interval=None),
    )
