"""Builds a remix arrangement timeline from the *actual* detected song
structure — never a single fixed timeline reused for every upload.

Input: the sections returned by analysis.detect_structure() (which are
themselves computed from the real audio's timbre/energy contour), plus
the chosen style + energy level.

Output: an ordered list of arrangement blocks, each with the drum/bass/
vocal intensity to apply and which transition FX fire at its boundaries.
Later stages (mixer.py) turn this into actual audio.
"""
from __future__ import annotations

from .presets import ENERGY_LEVELS, get_preset

BUILDUP_MIN_SEC = 2.0
BUILDUP_MAX_SEC = 8.0


def _section_type(label: str) -> str:
    return {
        "intro": "intro", "outro": "outro", "drop": "drop", "chorus": "chorus",
        "verse": "verse", "breakdown": "breakdown", "bridge": "breakdown",
    }.get(label, "verse")


def build_arrangement(duration: float, style_id: str, energy_level: str, sections: list[dict]) -> list[dict]:
    preset = get_preset(style_id)
    energy = ENERGY_LEVELS.get(energy_level, ENERGY_LEVELS["MEDIUM"])
    default_fx = preset["default_effects"]

    blocks = []
    for i, sec in enumerate(sections):
        block = {
            "start": sec["start"], "end": sec["end"],
            "type": _section_type(sec["label"]),
            "drum_intensity": 0.0,
            "bass_intensity": 0.0,
            "vocal_gain": 1.0,
            "filter": None,
            "fx_at_start": [],
            "fx_at_end": [],
        }
        blocks.append(block)

    for i, block in enumerate(blocks):
        btype = block["type"]
        next_type = blocks[i + 1]["type"] if i + 1 < len(blocks) else None

        if btype == "intro":
            block["drum_intensity"] = 0.35 * energy["density"]
            block["bass_intensity"] = 0.2 * energy["gain"]
            block["vocal_gain"] = 1.0
            block["filter"] = {"kind": "lowpass", "start": 300, "end": 12000}
        elif btype == "outro":
            block["drum_intensity"] = 0.5 * energy["density"]
            block["bass_intensity"] = 0.4 * energy["gain"]
            block["vocal_gain"] = 0.9
            if "tape_stop" in default_fx:
                block["fx_at_end"].append("tape_stop")
            else:
                block["filter"] = {"kind": "lowpass", "start": 12000, "end": 400}
        elif btype == "breakdown":
            block["drum_intensity"] = 0.25 * energy["density"]
            block["bass_intensity"] = 0.15 * energy["gain"]
            block["vocal_gain"] = 1.15
            if "reverb_wash" in default_fx:
                block["fx_at_start"].append("reverb_wash")
        elif btype in ("drop", "chorus"):
            block["drum_intensity"] = 1.0 * energy["density"]
            block["bass_intensity"] = 1.0 * energy["gain"]
            block["vocal_gain"] = 1.0
            block["fx_at_start"].append("impact")
        else:  # verse
            block["drum_intensity"] = 0.65 * energy["density"]
            block["bass_intensity"] = 0.55 * energy["gain"]
            block["vocal_gain"] = 1.05

        # Carve a build-up out of the tail of any block leading into a drop/chorus
        if next_type in ("drop", "chorus") and btype not in ("drop", "chorus"):
            span = block["end"] - block["start"]
            buildup_len = max(BUILDUP_MIN_SEC, min(BUILDUP_MAX_SEC, span * 0.35))
            buildup_start = block["end"] - buildup_len
            if buildup_start > block["start"] + 1.0:
                blocks.insert(i + 1, {
                    "start": buildup_start, "end": block["end"],
                    "type": "buildup",
                    "drum_intensity": min(1.2, block["drum_intensity"] * 1.6) * energy["density"],
                    "bass_intensity": block["bass_intensity"] * 0.8,
                    "vocal_gain": block["vocal_gain"],
                    "filter": {"kind": "highpass", "start": 20, "end": 900},
                    "fx_at_start": [],
                    "fx_at_end": ["riser"] if "riser" in default_fx else [],
                })
                block["end"] = buildup_start
                if "snare_roll" in default_fx:
                    blocks[i + 1]["fx_at_end"].append("snare_roll")

    blocks = [b for b in blocks if b["end"] - b["start"] > 0.05]
    if blocks:
        blocks[-1]["end"] = duration
        blocks[0]["start"] = 0.0
    return blocks
