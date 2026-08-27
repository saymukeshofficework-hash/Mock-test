# Test Generator Agent — Rulebook

This is the detailed behavioral spec for the test-generator-agent skill. `SKILL.md` covers *when* to do each step; this file covers *how* and *why*, in enough depth that the questions produced feel like a professionally prepared competitive-exam mock test rather than generic AI filler.

## Template Rule

The supplied HTML template is the MASTER TEMPLATE for UI/UX. Do not redesign it unless the user explicitly asks for design changes, and do not replace the working UI with a new one. Preserve everything that isn't question data: CSS, colors, typography, responsive layout, question navigation, question palette, section tabs, timer, language toggle, answer selection, clear response, mark for review, previous/next/save, submit, result screen, answer review, scoring, the student-name screen, and mobile responsiveness.

Before changing anything, read the whole file — CSS, HTML structure, and JavaScript — and locate: where question data lives, how sections work, how the answer index is used, the language system, the timer, the scoring, and result generation. Don't blindly search-and-replace text; know what you're changing and why.

If the user hands you an *existing test* (not a blank template) and asks to change the topic: preserve design and functionality, replace only the question dataset, update metadata, validate everything, and write a new file.

## Question Data Structure

```js
{
  s: "S1",                         // section key — must match a key in SECTIONS
  a: 2,                            // zero-based correct-answer index (0=A, 1=B, 2=C, 3=D)
  q:   { hi: "...", en: "..." },   // question text, both languages
  o:   { hi: [...4 items], en: [...4 items] }, // options, same order both languages
  sol: { hi: "...", en: "..." },   // explanation, both languages
}
```

`SECTIONS` is an ordered array of `{ key, label: { hi, en } }`. Every question's `s` must reference an existing section key — never invent a key that isn't in `SECTIONS`.

Common indexing mistake to avoid: Option C is index `2`, not `3`. Double-check every `a` value against the option it's meant to point at.

## Question Quality

Every question must have exactly one correct answer, four plausible options (unless the user specifies otherwise), accurate terminology, and clear, unambiguous wording. Reject/rewrite any question where: two options could reasonably be defended as correct, the wording depends on an unstated assumption, the fact is outdated, the question contains a factual error, the correct answer is telegraphed by option length or phrasing, an option duplicates another, or the solution text contradicts the stated answer.

Vary the question pattern — mix conceptual, application, numerical (where appropriate), statement-based, comparison, "which of these is an exception," reasoning, and pure factual questions. Don't let every question follow the same template.

## Difficulty

Default split when not specified: 20% easy / 50% moderate / 30% hard. For competitive exams (PGT/TGT/NET/SSC/etc.) favor conceptual and application questions over rote memorization.

## Avoid Duplicates

Check for exact duplicates, near-duplicates (same fact, reworded — don't include unless intentionally requested), duplicate options within a question, and topic duplication (don't over-concentrate on one narrow subtopic when the requested topic is broader — distribute coverage).

## Answer Verification

For every question: determine the correct answer, verify it against a reliable source or established reference, confirm the index is correct, confirm the Hindi and English versions agree on the same answer, and confirm the explanation actually supports the stated answer (not a different option).

## Bilingual Rules

If bilingual mode is requested (the default), every question, option set, and solution needs both `hi` and `en`. Write natural educational Hindi — not a word-for-word machine translation — while keeping standard technical terms in English where that's normal educational usage (pH, IUPAC, oxidation number, electronegativity, etc.).

Hindi and English must ask exactly the same question, with the same four options in the same order and the same correct answer. If word order or which-option-is-correct drifts between languages, that's a bug — fix it before shipping.

## Sections

Divide questions into meaningful sections that reflect real subtopic structure, not arbitrary chunks. Example shape:

```js
const SECTIONS = [
  { key: "S1", label: { hi: "भाग 1: ...", en: "Part 1: ..." } },
  { key: "S2", label: { hi: "भाग 2: ...", en: "Part 2: ..." } },
];
```

If the template already has a working section system, keep its mechanics and just change labels/keys/distribution to fit the new topic.

## Question Distribution

Distribute roughly evenly across sections unless the topic has natural subtopics of unequal importance, in which case weight by importance rather than forcing equal counts. E.g. 50 questions across 5 subtopics might be 10/10/10/10/10, or weighted 15/10/10/10/5 if one subtopic is clearly more central to the syllabus.

## Metadata

Update every place in the HTML that mentions the test's identity: page `<title>`, on-screen test title, subtitle, question count, section labels, time limit, exam name, subject. Nothing from the old template's topic should remain (e.g. don't ship "PGT Chemistry Mock Test" text inside a Biology test).

## Timer

Convert the requested time limit to seconds (`60 minutes` → `60 * 60`) and update both the internal timer variable and any hardcoded display text (don't leave a stale `120:00` when the real limit is 60 minutes).

## Question Count

The final `Q` array must contain *exactly* the requested number of questions — never off by one or more. If a safe, verified count can't be reached, say so rather than padding with weak questions (see Anti-Hallucination Rule below). Any template text implying a different count ("Q 1 of 100" when there are actually 50) must be corrected — this is normally automatic if the app computes it from `Q.length`, but check.

## Solutions

Every question needs a real explanation, not just "Correct answer: B" (unless the question is genuinely self-evident). The explanation must support the actual correct option — a solution that argues for a different answer than `a` points to is a bug.

## Formulas & Notation

Preserve chemical/math notation exactly: subscripts, superscripts, charges, arrows, equations (H₂O, CO₂, K₂Cr₂O₇, ΔG = ΔH − TΔS, PV = nRT, etc.). Use HTML-safe entities where needed; don't let Unicode escaping corrupt symbols.

## Source Tracking

Keep track internally of where each question's facts came from (official exam sources, NCERT/official textbooks, university/board resources, other reputable references) and whether you independently verified it. The final HTML doesn't need to display this unless asked, but never fabricate a source, and never claim verification you didn't actually do.

## Automatic Validation

Before delivering, mechanically check:

- `Q.length` equals the requested count; `SECTIONS.length` is sane for the distribution used.
- Every question: `s` resolves to a real section key; `0 <= a <= 3`; `q.hi` and `q.en` both non-empty; `o.hi.length === 4` and `o.en.length === 4`; `sol.hi` and `sol.en` both non-empty.
- No duplicate questions, no empty fields, no `undefined` values, no duplicate options within a question.
- The file is syntactically valid — no missing commas/brackets, no broken quotes, no invalid Unicode escapes, no broken object literals.

## Cross-Language Validation

For bilingual tests, additionally check that `q.hi`/`q.en` represent the same question, that `o.hi[i]`/`o.en[i]` are matched pairs at every index, and that `a` identifies the same correct answer under both languages.

## End-to-End Test the HTML

Don't stop at generating the file — trace through the actual user flow (in a browser or headless check if available, otherwise careful static reading of the JS): name screen → start → question display → option selection → next/previous → clear response → mark for review → question palette → section navigation → language toggle → timer → submit → result screen → answer review → retake. Fix anything broken before delivery.

## Mobile Check

Confirm questions and options fit small screens without introducing horizontal page scroll, buttons stay usable, section tabs can scroll, the question palette works, and both Hindi and English text render without clipping.

## Output File

Always write a new, descriptively named file (e.g. `chemical-bonding-mock-test-50.html`, `biology-human-physiology-test-100.html`) — never overwrite the master template or any pre-existing test file. Avoid spaces in filenames.

## Default Settings (when the user gives only a topic)

Questions: 50 · Language: Hindi + English · Difficulty: Moderate · Time: 60 minutes · Options: 4 · Solutions: yes · Sections: auto-determined. Always tell the user which defaults you used — in this skill, prefer asking via the Step 0 intake form instead of silently defaulting, since asking is cheap and gets a better result.

## Anti-Hallucination Rule

Never prioritize hitting the requested question count over correctness. The workflow is always: research → generate → verify → remove duplicates/weak items → replace with verified questions → re-validate → deliver. If you can't safely reach the requested count with verified, non-duplicate, high-quality questions, tell the user why instead of generating filler to hit the number.

## Failure Handling

- If research is unavailable, don't invent citations or pretend research happened — say so, and fall back to careful use of internal knowledge with that caveat stated.
- If the template can't be parsed, stop and explain the problem rather than inventing an unrelated replacement template.
- If some generated questions can't be verified, don't silently ship them — replace them with verified ones.
- If the requested count can't be safely produced at quality, explain why rather than padding.

## Final Pre-Delivery Checklist

- [ ] Correct topic / subject / exam name
- [ ] Correct number of questions (`Q.length` matches exactly)
- [ ] Correct time limit
- [ ] Correct sections, all `s` keys resolve
- [ ] Every question has 4 options and exactly one correct answer
- [ ] Every `a` is a correct zero-based index
- [ ] Hindi and English match (question, options, answer)
- [ ] Every question has a solution that supports the actual answer
- [ ] No duplicate questions or options; no empty/undefined fields
- [ ] No broken JavaScript or HTML
- [ ] Timer, language toggle, navigation, palette, mark-for-review, submit, result screen, retake all work
- [ ] Mobile layout works, no horizontal scroll
- [ ] Original template/master file untouched
- [ ] Final HTML file exists at a descriptive path
- [ ] Chat response is a short summary — not a dump of the generated HTML
