// Teacher-exam catalog: UPTET, UP TGT, UP PGT, CTET, and other UP teacher exams.
//
// This is METADATA ONLY — it does not add any question content. Every test listed
// here has contentStatus "pending" until a real supabase/seed_split/<id>.sql file is
// generated (scripts/lib/build-sections.js pattern) and inserted into test_content.
// Once a test's row exists in test_content, flip its contentStatus to "available"
// here and it becomes clickable — no other code changes needed, since it goes
// through the exact same exam-test.html -> get_test_questions/score_test_attempt
// RPC path as the original 20 TET tests.
//
// test_id naming: "<examId>[-<paperId>]-<subjectId>-NN" or "<examId>-mock-NN".
// These are plain text primary keys in test_content, same as "test01" already is.

function buildSubjectTests(idPrefix, count) {
  const tests = [];
  for (let n = 1; n <= count; n++) {
    const num = String(n).padStart(2, "0");
    tests.push({ id: `${idPrefix}-${num}`, number: n, contentStatus: "pending" });
  }
  return tests;
}

function buildPaper(examId, paperId, subjects) {
  return {
    id: paperId,
    subjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      tests: buildSubjectTests(`${examId}-${paperId}-${s.id}`, 20),
    })),
  };
}

// Paper 1 (Classes I-V) and Paper 2 (Classes VI-VIII) share the same subject shape
// in both UPTET and CTET's official patterns, so one helper builds both exams.
const PRIMARY_SUBJECTS = [
  { id: "cdp", name: "Child Development & Pedagogy" },
  { id: "lang1", name: "Language 1 (Hindi)" },
  { id: "lang2", name: "Language 2 (English)" },
  { id: "math", name: "Mathematics" },
  { id: "evs", name: "Environmental Studies" },
];
const UPPER_PRIMARY_SUBJECTS = [
  { id: "cdp", name: "Child Development & Pedagogy" },
  { id: "lang1", name: "Language 1 (Hindi)" },
  { id: "lang2", name: "Language 2 (English)" },
  { id: "mathsci", name: "Mathematics & Science" },
  { id: "socstudies", name: "Social Studies" },
];

const UPTGT_SUBJECTS = [
  { id: "hindi", name: "Hindi" },
  { id: "english", name: "English" },
  { id: "sanskrit", name: "Sanskrit" },
  { id: "math", name: "Mathematics" },
  { id: "science", name: "Science" },
  { id: "socialscience", name: "Social Science" },
  { id: "homescience", name: "Home Science" },
  { id: "art", name: "Art" },
  { id: "physicaleducation", name: "Physical Education" },
  { id: "commerce", name: "Commerce" },
];

const UPPGT_SUBJECTS = [
  { id: "hindi", name: "Hindi" },
  { id: "english", name: "English" },
  { id: "sanskrit", name: "Sanskrit" },
  { id: "math", name: "Mathematics" },
  { id: "physics", name: "Physics" },
  { id: "chemistry", name: "Chemistry" },
  { id: "biology", name: "Biology" },
  { id: "history", name: "History" },
  { id: "civics", name: "Civics" },
  { id: "geography", name: "Geography" },
  { id: "economics", name: "Economics" },
  { id: "commerce", name: "Commerce" },
  { id: "computerscience", name: "Computer Science" },
];

const EXAM_CATALOG = {
  uptet: {
    id: "uptet",
    name: "UPTET",
    fullName: "UP Teacher Eligibility Test",
    description: "Uttar Pradesh's state-level teacher eligibility test for Classes I-VIII, held by UPBEB.",
    papers: [
      buildPaper("uptet", "p1", PRIMARY_SUBJECTS),
      buildPaper("uptet", "p2", UPPER_PRIMARY_SUBJECTS),
    ],
  },
  uptgt: {
    id: "uptgt",
    name: "UP TGT",
    fullName: "UP Trained Graduate Teacher",
    description: "Subject-wise recruitment exam for Classes IX-X teachers under UPSESSB.",
    subjects: UPTGT_SUBJECTS.map((s) => ({
      id: s.id,
      name: s.name,
      tests: buildSubjectTests(`uptgt-${s.id}`, 20),
    })),
  },
  uppgt: {
    id: "uppgt",
    name: "UP PGT",
    fullName: "UP Post Graduate Teacher",
    description: "Subject-wise recruitment exam for Classes XI-XII teachers under UPSESSB.",
    subjects: UPPGT_SUBJECTS.map((s) => ({
      id: s.id,
      name: s.name,
      tests: buildSubjectTests(`uppgt-${s.id}`, 20),
    })),
  },
  ctet: {
    id: "ctet",
    name: "CTET",
    fullName: "Central Teacher Eligibility Test",
    description: "CBSE's national-level teacher eligibility test for Classes I-VIII.",
    papers: [
      buildPaper("ctet", "p1", PRIMARY_SUBJECTS),
      buildPaper("ctet", "p2", UPPER_PRIMARY_SUBJECTS),
    ],
    mocks: (function () {
      const tests = [];
      for (let n = 1; n <= 40; n++) {
        const num = String(n).padStart(2, "0");
        tests.push({ id: `ctet-mock-${num}`, number: n, contentStatus: "pending" });
      }
      return tests;
    })(),
  },
};

// Named, legitimate UP teacher exams the catalog is ready to expand into, with no
// subject/test structure built yet — listed rather than fabricated with fake tests.
const OTHER_UP_EXAMS = [
  { name: "UP Super TET / Assistant Teacher (Basic Shiksha Parishad)", note: "Primary-level recruitment exam for UP government schools." },
  { name: "UP LT Grade Teacher", note: "Subject-wise recruitment exam for Classes IX-X under UPSESSB, alongside TGT." },
];

// Flat lookup used by exam-test.html: test_id -> { examId, paperId, subjectId,
// subjectName, examName, number, contentStatus }.
function findCatalogTest(testId) {
  for (const examId in EXAM_CATALOG) {
    const exam = EXAM_CATALOG[examId];
    const paperGroups = exam.papers || [{ id: null, subjects: exam.subjects }];
    for (const paper of paperGroups) {
      for (const subject of paper.subjects) {
        const hit = subject.tests.find((t) => t.id === testId);
        if (hit) {
          return {
            examId,
            examName: exam.name,
            paperId: paper.id,
            subjectId: subject.id,
            subjectName: subject.name,
            number: hit.number,
            contentStatus: hit.contentStatus,
          };
        }
      }
    }
    if (exam.mocks) {
      const hit = exam.mocks.find((t) => t.id === testId);
      if (hit) {
        return {
          examId,
          examName: exam.name,
          paperId: null,
          subjectId: null,
          subjectName: "Full Mock Test",
          number: hit.number,
          contentStatus: hit.contentStatus,
        };
      }
    }
  }
  return null;
}
