/* Daily English Gym: 30 confidence micro-challenges (original content) plus
   a computed 30-day plan that pulls from vocabulary/grammar/speaking/real
   English data — loaded before this file. Keeps content DRY. */
window.CONFIDENCE_CHALLENGES = [
  { id: "c1", text: "Say one full sentence about your day out loud in English." },
  { id: "c2", text: "Introduce yourself in English, even if it's just to a mirror." },
  { id: "c3", text: "Order something (tea, food, a ticket) in English today." },
  { id: "c4", text: "Send one message to a friend written fully in English." },
  { id: "c5", text: "Describe what you're wearing today in English, out loud." },
  { id: "c6", text: "Ask someone a question in English today, even a simple one." },
  { id: "c7", text: "Compliment someone in English today." },
  { id: "c8", text: "Describe your breakfast or lunch in three English sentences." },
  { id: "c9", text: "Explain one rule of a game you like, in English." },
  { id: "c10", text: "Say three things you're grateful for today, in English." },
  { id: "c11", text: "Describe the weather today in two different ways." },
  { id: "c12", text: "Give a one-line opinion about something you watched or read." },
  { id: "c13", text: "Introduce a family member to an imaginary guest, in English." },
  { id: "c14", text: "Describe your route from home to school/work in English." },
  { id: "c15", text: "Say 'thank you' in English to three people today." },
  { id: "c16", text: "Explain what you plan to do this weekend, in English." },
  { id: "c17", text: "Describe your best friend in three English sentences." },
  { id: "c18", text: "Practise saying 'no' politely in English." },
  { id: "c19", text: "Read one paragraph of anything out loud in English." },
  { id: "c20", text: "Explain a mistake you made today and what you learned, in English." },
  { id: "c21", text: "Describe your favourite festival in English." },
  { id: "c22", text: "Ask for help with something in English today." },
  { id: "c23", text: "Give simple directions to somewhere, in English." },
  { id: "c24", text: "Talk about your goals for this month, in English." },
  { id: "c25", text: "Describe a photo on your phone in English." },
  { id: "c26", text: "Practise introducing yourself for a job interview." },
  { id: "c27", text: "Explain your favourite subject and why, in English." },
  { id: "c28", text: "Describe a problem and a possible solution, in English." },
  { id: "c29", text: "Give feedback on something politely, in English." },
  { id: "c30", text: "Speak for 60 seconds without stopping on any topic you like." }
];

function buildDailyChallenges() {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const words = [
      window.VOCABULARY[i % VOCABULARY.length],
      window.VOCABULARY[(i + 10) % VOCABULARY.length],
      window.VOCABULARY[(i + 20) % VOCABULARY.length]
    ];
    const nonErrorGrammar = window.GRAMMAR_QUESTIONS.filter((q) => q.type !== "error");
    const grammar = nonErrorGrammar[i % nonErrorGrammar.length];
    const speaking = window.SPEAKING_PROMPTS[i % SPEAKING_PROMPTS.length];
    const real = window.REAL_ENGLISH[i % REAL_ENGLISH.length];
    const confidence = window.CONFIDENCE_CHALLENGES[i % CONFIDENCE_CHALLENGES.length];
    days.push({ day: i + 1, wordIds: words.map((w) => w.id), grammarId: grammar.id, speakingId: speaking.id, realEnglishId: real.id, confidenceId: confidence.id });
  }
  return days;
}
/* Load order required before this file: vocabulary.js, grammar.js, speaking.js, phrases.js */
window.DAILY_CHALLENGES = buildDailyChallenges();
