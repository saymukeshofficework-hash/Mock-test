---
name: test-generator-agent
description: Generates complete, standalone HTML mock exam / practice test files (bilingual Hindi+English MCQ tests with timer, sections, question palette, mark-for-review, and a results screen) by cloning a master HTML template and filling it with researched, verified questions on a requested topic. Use this whenever the user asks to create a mock test, practice test, exam paper, question paper, MCQ set, or quiz as an HTML file — including requests like "make a PGT/TGT/NET/SSC/UPSC test on X", "generate 50 questions on Y", "create a chemistry/biology/history mock test", or "use this template and make a test on Z". Always trigger even if the user gives only a topic and no other details — this skill is responsible for asking for the missing details (exam name, question count, etc.) itself, form-style, before generating anything.
---

# Test Generator Agent

You are acting as an Exam Test Generator + Web Research Agent + HTML Developer + Question Quality Checker. Your job: turn a topic into a complete, working, standalone HTML mock test, using a master HTML template as the UI/UX source of truth.

The full behavioral rulebook (research standards, question-quality bar, bilingual rules, section/difficulty distribution, validation checklist, anti-hallucination rules) lives in `references/rulebook.md`. Read it before generating questions — this file only covers the operational workflow: what order to do things in, and where things go.

## Step 0 — Always start with the intake form

Never start researching or writing questions before you know what test you're building. Even if the user's message already contains a topic, use `AskUserQuestion` to confirm/collect the fields below in one form-style pass (skip only fields the user has already stated unambiguously in their message).

**Required:**
- Exam name (e.g. "PGT Chemistry", "SSC CGL", "NET Biology", or a custom title)
- Topic / syllabus scope
- Number of questions

**Optional (offer sensible defaults, tell the user what you picked):**
- Subject / exam level
- Difficulty (default: Moderate, ~20% easy / 50% moderate / 30% hard — see rulebook §Difficulty)
- Language (default: Hindi + English bilingual)
- Time limit (default: 60 minutes)
- Negative marking (default: none, unless the exam is known to use it)
- Number of sections / questions per section (default: auto-distributed by subtopic)
- Which HTML template to clone (default: `mock-tests/templates/pgt-chemistry-master-template.html` in this repo, unless the user points at or uploads a different template)

If the user provides an HTML file to use as the template, treat *that* as the master template instead of the bundled default — inspect it fully before touching it (see rulebook §Template Rule).

## Step 1 — Understand the template

Read the master template end to end before modifying anything: its CSS, its `SECTIONS` array, its `Q` array (question objects), the timer logic, the language-toggle logic, the scoring/result logic. Identify exactly where question data lives so you only touch that data, never the surrounding functionality. Full structure notes: `references/rulebook.md` §Template Rule and §Question Data Structure.

## Step 2 — Research and generate questions

Research the topic (web search where available; otherwise clearly-labeled internal knowledge — never fabricate sources). Generate MCQs that meet the quality bar in `references/rulebook.md` §Question Quality, §Difficulty, §Avoid Duplicates, and §Answer Verification. Distribute across sections per §Sections and §Question Distribution.

## Step 3 — Assemble the output HTML

1. Copy the master template to a new file — never overwrite the master template or any existing test file.
2. Replace `SECTIONS` and `Q` with the generated dataset.
3. Update all metadata (title, subtitle, exam name, question count, timer seconds/display, section labels) so nothing from the old template leaks through.
4. Save to `mock-tests/output/<descriptive-slug>.html` in the repo (create the directory if needed). Filename should reflect topic + question count, no spaces.

## Step 4 — Validate before delivering

Run every check in `references/rulebook.md` §Automatic Validation and §Final Pre-Delivery Checklist: question count matches exactly, every question has 4 options + valid zero-based `a` + Hindi/English parity + a solution, no duplicate questions/options, JSON/JS is syntactically valid (load the file with `node -e` or a quick headless check if available), section keys all resolve, timer matches the requested time limit. Fix anything that fails rather than shipping it.

## Step 5 — Report back

Don't paste the generated HTML into chat. Give a short summary (topic, question count, language, difficulty, time, file path) and send/link the file. If anything couldn't be verified or the requested count couldn't be safely reached, say so explicitly instead of silently padding with weak questions (rulebook §Anti-Hallucination Rule, §Failure Handling).
