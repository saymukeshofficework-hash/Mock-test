// Shared logic for turning the question bank (scripts/question-bank.js) into a
// test's `sections` array. Used by scripts/export-supabase-seed.js (the only
// remaining consumer — question data is no longer written to public files;
// it lives in the Supabase test_content table instead).
//
// Each bank (cdp/en/hi/math/evs) holds 60 questions. For test N, a 30-question
// window is sliced out starting at offset ((N-1) * 7) % 60 (wrapping around),
// so every test gets a full, non-repeating 30-question section and the offset
// pattern spreads the 20 tests across the whole bank. Test 1 always starts at
// offset 0, which reproduces the original hand-written test 1 exactly.
'use strict';

const bank = require('../question-bank.js');

const QUESTIONS_PER_SECTION = 30;
const OFFSET_STEP = 7;

const SECTION_DEFS = [
  { name: 'Child Development & Pedagogy', mode: 'bilingual', bank: 'cdp' },
  { name: 'Language-1 (English)', mode: 'en', bank: 'en' },
  { name: 'Language-2 (Hindi)', mode: 'hi', bank: 'hi' },
  { name: 'Mathematics', mode: 'bilingual', bank: 'math' },
  { name: 'Environmental Studies', mode: 'bilingual', bank: 'evs' },
];

function sliceWindow(arr, offset, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(arr[(offset + i) % arr.length]);
  }
  return out;
}

// testId: 1-20 (number)
function getSectionsForTest(testId) {
  return SECTION_DEFS.map((def) => {
    const bankArr = bank[def.bank];
    const offset = ((testId - 1) * OFFSET_STEP) % bankArr.length;
    const questions = sliceWindow(bankArr, offset, QUESTIONS_PER_SECTION).map((q) => {
      const out = { answer: q.answer };
      if (q.en) out.en = { q: q.en.q, options: q.en.options };
      if (q.hi) out.hi = { q: q.hi.q, options: q.hi.options };
      return out;
    });
    return { name: def.name, mode: def.mode, questions };
  });
}

module.exports = { getSectionsForTest, QUESTIONS_PER_SECTION, SECTION_DEFS };
