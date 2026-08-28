#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { getSectionsForTest } = require('./lib/build-sections.js');

const TOTAL_TESTS = 20;
const DURATION_MINUTES = 150;
const OUT_DIR = path.join(__dirname, '..', 'supabase', 'seed_split');

function sqlLiteral(value) {
  return `$jsonq$${value}$jsonq$`;
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

for (let testId = 1; testId <= TOTAL_TESTS; testId++) {
  const sections = getSectionsForTest(testId);
  const questionCount = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const idPadded = String(testId).padStart(2, '0');
  const title = `TET Full Test ${idPadded}`;
  const questionsJson = JSON.stringify(sections);

  const sql = [
    `insert into test_content (test_id, title, question_count, duration_minutes, questions)`,
    `values ('test${idPadded}', ${sqlLiteral(title)}, ${questionCount}, ${DURATION_MINUTES}, ${sqlLiteral(questionsJson)}::jsonb)`,
    `on conflict (test_id) do update set`,
    `  title = excluded.title,`,
    `  question_count = excluded.question_count,`,
    `  duration_minutes = excluded.duration_minutes,`,
    `  questions = excluded.questions;`,
  ].join('\n');

  const outFile = path.join(OUT_DIR, `test${idPadded}.sql`);
  fs.writeFileSync(outFile, sql);
  console.log(`Wrote ${outFile} (${(sql.length / 1024).toFixed(1)} KB, ${questionCount} questions)`);
}
