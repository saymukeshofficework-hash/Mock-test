#!/usr/bin/env node
/*
 * Generates per-item Hindi teacher audio with Piper (hi_IN-pratham-medium) for the
 * fixed Hindi lessons, once, and writes data/audio-manifest.js so the lesson engine
 * can play the files instead of the browser's Web Speech API.
 *
 * Requires Piper installed locally (pip install piper-tts) and the two model files
 * downloaded from https://huggingface.co/rhasspy/piper-voices — see README.md
 * "Generating Hindi teacher audio with Piper" for exact commands. Not run automatically
 * (huggingface.co is not reachable from every environment); run this manually whenever
 * lesson text changes.
 *
 * Usage:
 *   node scripts/generate-hindi-audio.js --test              # sanity check only
 *   node scripts/generate-hindi-audio.js                     # full generation
 *   node scripts/generate-hindi-audio.js --dry-run            # plan only, no Piper calls
 *   node scripts/generate-hindi-audio.js --force              # regenerate existing files too
 *
 * Options:
 *   --model <path>    default: piper-models/hi_IN-pratham-medium.onnx
 *   --config <path>   default: piper-models/hi_IN-pratham-medium.onnx.json
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const AUDIO_ROOT = path.join(ROOT, "audio");
const MANIFEST_PATH = path.join(ROOT, "data", "audio-manifest.js");
const TEST_TEXT = "नमस्ते बच्चों। आज हम पढ़ाई करेंगे। मेरे साथ बोलिए।";
const TEST_FILE = path.join(AUDIO_ROOT, "test", "pratham-test.wav");
const MIN_VALID_BYTES = 1000; // a real one/two-word clip is tens of KB; guards against empty/broken output

function parseArgs(argv) {
  const args = { test: false, dryRun: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--test") args.test = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--force") args.force = true;
    else if (a === "--model") args.model = argv[++i];
    else if (a === "--config") args.config = argv[++i];
  }
  args.model = args.model || path.join(ROOT, "piper-models", "hi_IN-pratham-medium.onnx");
  args.config = args.config || path.join(ROOT, "piper-models", "hi_IN-pratham-medium.onnx.json");
  return args;
}

function loadLessons() {
  global.window = { ALL_LESSONS: [] };
  const dataDir = path.join(ROOT, "data");
  ["counting-hindi.js", "counting-english.js", "english.js", "hindi.js", "matras.js", "words.js", "barakhadi.js"].forEach((f) => {
    require(path.join(dataDir, f));
  });
  const lessons = global.window.ALL_LESSONS;
  delete global.window;
  return lessons;
}

// lessonId -> { dir: audio/hindi/<dir>/, introName: audio/hindi/intro/<introName>.wav }
const LESSON_AUDIO = {
  "counting-hi-1-10": { dir: "counting-1-10", intro: "counting-1-10" },
  "counting-hi-11-20": { dir: "counting-11-20", intro: "counting-11-20" },
  "counting-hi-1-100": { dir: "counting-1-100", intro: "counting-1-100" },
  "hindi-varnamala": { dir: "alphabet", intro: "varnamala" },
  "hindi-swar": { dir: "swar", intro: "swar" },
  "matras-basic": { dir: "matras", intro: "matras" },
  "words-two-letter": { dir: "words-2", intro: "words-2" },
  "words-three-letter": { dir: "words-3", intro: "words-3" }
};

// Processed in this order so the 1-100 superset is generated first and the 1-10 /
// 11-20 subsets can be copied from its cache instead of re-synthesizing the same word.
const LESSON_ORDER = [
  "counting-hi-1-100",
  "counting-hi-1-10",
  "counting-hi-11-20",
  "hindi-varnamala",
  "hindi-swar",
  "matras-basic",
  "words-two-letter",
  "words-three-letter"
];

// data/barakhadi.js generates 33 lessons (barakhadi-01 .. barakhadi-33); register
// them the same way instead of hand-listing every id.
for (let i = 1; i <= 33; i++) {
  const id = "barakhadi-" + String(i).padStart(2, "0");
  LESSON_AUDIO[id] = { dir: id, intro: id };
  LESSON_ORDER.push(id);
}

function isNumericDisplay(display) {
  return /^\d+$/.test(display);
}

function buildJobs(lessons) {
  const byId = {};
  lessons.forEach((l) => { byId[l.id] = l; });

  const jobs = [];
  const manifest = {};

  LESSON_ORDER.forEach((lessonId) => {
    const lesson = byId[lessonId];
    const audioCfg = LESSON_AUDIO[lessonId];
    if (!lesson || !audioCfg) return;

    manifest[lessonId] = { intro: null, items: new Array(lesson.items.length).fill(null) };

    if (lesson.introduction) {
      const introRel = path.posix.join("audio", "hindi", "intro", audioCfg.intro + ".wav");
      jobs.push({ kind: "intro", lessonId, text: lesson.introduction, rel: introRel });
    }

    lesson.items.forEach((item, i) => {
      const filename = isNumericDisplay(item.display)
        ? String(item.display).padStart(3, "0") + ".wav"
        : String(i + 1).padStart(3, "0") + ".wav";
      const rel = path.posix.join("audio", "hindi", audioCfg.dir, filename);
      jobs.push({ kind: "item", lessonId, index: i, text: item.speech, rel });
    });
  });

  return { jobs, manifest };
}

function runPiper(model, config, text, outAbsPath) {
  fs.mkdirSync(path.dirname(outAbsPath), { recursive: true });
  const result = spawnSync(
    "python3",
    ["-m", "piper", "-m", model, "-c", config, "-f", outAbsPath],
    { input: text, encoding: "utf8" }
  );
  if (result.error) return { ok: false, error: result.error.message };
  if (result.status !== 0) return { ok: false, error: (result.stderr || "").trim().slice(-500) };
  if (!fs.existsSync(outAbsPath) || fs.statSync(outAbsPath).size < MIN_VALID_BYTES) {
    return { ok: false, error: "output file missing or too small" };
  }
  return { ok: true };
}

function isValidExisting(absPath) {
  return fs.existsSync(absPath) && fs.statSync(absPath).size >= MIN_VALID_BYTES;
}

function writeManifest(manifest, jobs) {
  // Re-check disk state so the manifest always reflects reality, even on a partial run.
  jobs.forEach((job) => {
    const abs = path.join(ROOT, job.rel);
    const exists = isValidExisting(abs);
    if (job.kind === "intro") {
      manifest[job.lessonId].intro = exists ? job.rel : null;
    } else {
      manifest[job.lessonId].items[job.index] = exists ? job.rel : null;
    }
  });

  const body =
    "/* Generated by scripts/generate-hindi-audio.js — do not edit by hand.\n" +
    "   Maps each Hindi lesson's items/intro to its pre-generated Piper audio file.\n" +
    "   Entries are null where audio has not been generated yet; the lesson engine\n" +
    "   falls back to the browser's Web Speech API in that case. */\n" +
    "window.AUDIO_MANIFEST = " + JSON.stringify(manifest, null, 2) + ";\n";
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, body);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.dryRun) {
    if (!fs.existsSync(args.model) || !fs.existsSync(args.config)) {
      console.error("Piper model not found.");
      console.error("  model:  " + args.model + (fs.existsSync(args.model) ? " (ok)" : " (MISSING)"));
      console.error("  config: " + args.config + (fs.existsSync(args.config) ? " (ok)" : " (MISSING)"));
      console.error("\nDownload hi_IN-pratham-medium.onnx and hi_IN-pratham-medium.onnx.json from");
      console.error("https://huggingface.co/rhasspy/piper-voices/tree/main/hi/hi_IN/pratham/medium");
      console.error("into primary-teacher/piper-models/ (see README.md), then re-run.");
      process.exit(1);
    }
  }

  console.log("Verifying Piper voice with test sentence...");
  if (args.dryRun) {
    console.log("[dry-run] would generate " + TEST_FILE);
  } else {
    if (!args.force && isValidExisting(TEST_FILE)) {
      console.log("Test file already exists, skipping: " + TEST_FILE);
    } else {
      const testResult = runPiper(args.model, args.config, TEST_TEXT, TEST_FILE);
      if (!testResult.ok) {
        console.error("Piper test FAILED: " + testResult.error);
        process.exit(1);
      }
      console.log("Test OK -> " + path.relative(ROOT, TEST_FILE));
    }
  }

  if (args.test) return;

  const lessons = loadLessons();
  const { jobs, manifest } = buildJobs(lessons);

  console.log("\nGenerating Hindi teacher audio...");
  let completed = 0, skipped = 0, failed = 0;
  const textCache = {}; // exact Hindi text -> relative path of an already-produced file

  jobs.forEach((job, i) => {
    const label = "[" + (i + 1) + "/" + jobs.length + "] " + job.text;
    const outAbs = path.join(ROOT, job.rel);

    if (args.dryRun) {
      console.log(label + "  -> " + job.rel);
      return;
    }

    if (!args.force && isValidExisting(outAbs)) {
      console.log(label + "  (skipped, already exists)");
      skipped++;
      textCache[job.text] = job.rel;
      return;
    }

    if (textCache[job.text]) {
      fs.mkdirSync(path.dirname(outAbs), { recursive: true });
      fs.copyFileSync(path.join(ROOT, textCache[job.text]), outAbs);
      console.log(label + "  (copied from " + textCache[job.text] + ")");
      completed++;
      return;
    }

    const result = runPiper(args.model, args.config, job.text, outAbs);
    if (result.ok) {
      console.log(label + "  OK");
      completed++;
      textCache[job.text] = job.rel;
    } else {
      console.error(label + "  FAILED: " + result.error);
      failed++;
    }
  });

  if (!args.dryRun) {
    writeManifest(manifest, jobs);
    console.log("\nWrote " + path.relative(ROOT, MANIFEST_PATH));
  }

  console.log("\nCompleted: " + completed);
  console.log("Skipped: " + skipped);
  console.log("Failed: " + failed);
  if (failed > 0) process.exit(1);
}

main();
