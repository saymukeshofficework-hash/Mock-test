"""Original remix style presets.

These are production parameter sets (BPM range, drum pattern, bass
contour, default effects) — not audio samples, and not modeled on any
specific artist's recordings. They describe *how* the remix engine
should synthesize and arrange its own drums/bass/FX around the uploaded
song, giving each style a distinctive, legally-safe character inspired
by broad Indian commercial-DJ / Bollywood-club genre conventions.
"""

STEPS = 16

# bass_pattern: {step_index: semitone_offset_from_detected_key_root}
PRESETS = {
    "bollywood_club": {
        "label": "Bollywood Club",
        "description": "Four-on-the-floor kick, punchy bass, Indian percussion accents, vocal chops and club-style drops.",
        "bpm_default": 126, "bpm_range": (118, 132),
        "swing": 0,
        "pattern": {
            "kick":  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            "clap":  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            "chh":   [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
            "perc":  [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
            "tabla": [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
        },
        "bass_pattern": {0: 0, 8: 7, 12: 5},
        "bass_brightness": 0.55,
        "pad": False,
        "default_effects": ["filter_sweep", "riser", "impact"],
        "vocal_default": "enhanced",
    },
    "indian_dance": {
        "label": "Indian Dance",
        "description": "Dhol-style rhythms and tabla-inspired percussion over electronic drums with a festival-style bass groove.",
        "bpm_default": 105, "bpm_range": (96, 112),
        "swing": 10,
        "pattern": {
            "dhol":  [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0],
            "tabla": [0,1,0,0, 1,0,0,1, 0,1,0,0, 1,0,0,1],
            "kick":  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
            "chh":   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
        },
        "bass_pattern": {0: 0, 6: 5, 8: 7, 14: 5},
        "bass_brightness": 0.45,
        "pad": False,
        "default_effects": ["riser", "impact", "beat_repeat"],
        "vocal_default": "original",
    },
    "romantic_house": {
        "label": "Romantic House",
        "description": "Deep bass, soft percussion, atmospheric pads and a vocal-focused arrangement with gradual build-ups.",
        "bpm_default": 100, "bpm_range": (94, 108),
        "swing": 0,
        "pattern": {
            "kick": [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            "ohh":  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
            "perc": [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
        },
        "bass_pattern": {0: 0, 8: 0},
        "bass_brightness": 0.2,
        "pad": True,
        "default_effects": ["reverb_wash", "filter_sweep"],
        "vocal_default": "reverb",
    },
    "festival_edm": {
        "label": "Festival EDM",
        "description": "Powerful kick, synth bass, risers, snare rolls, big drops and impact hits.",
        "bpm_default": 128, "bpm_range": (124, 136),
        "swing": 0,
        "pattern": {
            "kick": [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            "clap": [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            "chh":  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
        },
        "bass_pattern": {0: 0, 4: 0, 8: 7, 12: 5},
        "bass_brightness": 0.8,
        "pad": False,
        "default_effects": ["riser", "snare_roll", "impact", "beat_repeat"],
        "vocal_default": "enhanced",
    },
    "retro_disco": {
        "label": "Retro Disco",
        "description": "Four-on-the-floor drums, funk-inspired bass, synths, claps and disco-style transitions.",
        "bpm_default": 118, "bpm_range": (112, 124),
        "swing": 6,
        "pattern": {
            "kick": [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
            "clap": [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            "ohh":  [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
        },
        "bass_pattern": {0: 0, 3: 7, 6: 5, 8: 0, 11: 7, 14: 5},
        "bass_brightness": 0.5,
        "pad": False,
        "default_effects": ["flanger", "filter_sweep"],
        "vocal_default": "original",
    },
    "chill_remix": {
        "label": "Chill Remix",
        "description": "Reduced tempo, ambient pads, soft percussion and spacious vocals with smooth transitions.",
        "bpm_default": 78, "bpm_range": (70, 86),
        "swing": 12,
        "pattern": {
            "kick": [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
            "perc": [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
            "chh":  [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
        },
        "bass_pattern": {0: 0, 8: 5},
        "bass_brightness": 0.15,
        "pad": True,
        "default_effects": ["reverb_wash", "tape_stop"],
        "vocal_default": "reverb",
    },
}

ENERGY_LEVELS = {
    "LOW":     {"density": 0.6,  "gain": 0.72, "fx": 0.5},
    "MEDIUM":  {"density": 0.85, "gain": 0.9,  "fx": 0.8},
    "HIGH":    {"density": 1.0,  "gain": 1.05, "fx": 1.1},
    "EXTREME": {"density": 1.15, "gain": 1.2,  "fx": 1.35},
}

VOCAL_TREATMENTS = ["original", "enhanced", "echo", "reverb", "chop", "delay"]
BASS_INTENSITIES = {"light": 0.6, "normal": 0.85, "heavy": 1.1, "club": 1.35}
DRUM_INTENSITIES = {"minimal": 0.55, "standard": 0.85, "dance": 1.1, "festival": 1.35}

TEMPO_MODES = {
    "original": 1.0, "minus10": 0.90, "minus5": 0.95,
    "plus5": 1.05, "plus10": 1.10,
}


def get_preset(style_id: str) -> dict:
    if style_id not in PRESETS:
        raise KeyError(f"Unknown remix style '{style_id}'. Options: {', '.join(PRESETS)}")
    return PRESETS[style_id]


def list_presets() -> list[dict]:
    return [{"id": key, **{k: v for k, v in val.items() if k in ("label", "description", "bpm_default", "bpm_range")}}
            for key, val in PRESETS.items()]
