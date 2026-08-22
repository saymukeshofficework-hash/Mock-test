/* XP, levels, streak milestones and achievements — layered on Progress. */
const LEVELS = [
  { name: "English Starter", min: 0 },
  { name: "Word Explorer", min: 150 },
  { name: "Sentence Builder", min: 400 },
  { name: "Confident Speaker", min: 800 },
  { name: "Fluent Communicator", min: 1500 },
  { name: "English Master", min: 3000 }
];

const XP_RULES = {
  correctAnswer: 10,
  dailyWorkout: 50,
  speakingChallenge: 30,
  streak7: 100,
  lessonComplete: 20
};

const ACHIEVEMENTS = [
  { id: "first_lesson", title: "First Lesson", desc: "Completed your first lesson.", icon: "🎉" },
  { id: "streak_7", title: "7-Day Streak", desc: "Practised 7 days in a row.", icon: "🔥" },
  { id: "words_100", title: "100 Words", desc: "Learned 100 vocabulary words.", icon: "📚" },
  { id: "first_speaking", title: "First Speaking Challenge", desc: "Completed your first Speaking Lab challenge.", icon: "🎤" },
  { id: "grammar_master", title: "Grammar Master", desc: "Scored 90%+ in a Grammar Arena quiz.", icon: "🧠" },
  { id: "conversation_starter", title: "Conversation Starter", desc: "Completed 5 Speaking Lab scenarios.", icon: "🗣️" },
  { id: "english_master", title: "English Master", desc: "Reached the English Master level.", icon: "🏆" },
  { id: "speaker_7day", title: "7-Day Speaker", desc: "Completed the 7-Day Speaking Challenge.", icon: "🏅" }
];

const Gamification = {
  getLevel(xp) {
    let current = LEVELS[0];
    for (const lvl of LEVELS) {
      if (xp >= lvl.min) current = lvl;
    }
    return current;
  },

  getLevelIndex(xp) {
    return LEVELS.indexOf(this.getLevel(xp));
  },

  getLevelProgress(xp) {
    const idx = this.getLevelIndex(xp);
    const current = LEVELS[idx];
    const next = LEVELS[idx + 1];
    if (!next) return { percent: 100, current, next: null, remaining: 0 };
    const span = next.min - current.min;
    const into = xp - current.min;
    return { percent: Math.round((into / span) * 100), current, next, remaining: next.min - xp };
  },

  addXP(amount, reason) {
    const state = Progress.update((s) => {
      s.xp += amount;
    });
    this.checkAchievements();
    return state;
  },

  unlock(id) {
    const state = Progress.get();
    if (state.achievements.includes(id)) return false;
    Progress.update((s) => s.achievements.push(id));
    return true;
  },

  checkAchievements() {
    const state = Progress.get();
    const newly = [];
    const tryUnlock = (id, condition) => {
      if (condition && !state.achievements.includes(id)) {
        if (this.unlock(id)) newly.push(id);
      }
    };
    tryUnlock("first_lesson", state.completedLessons.length >= 1);
    tryUnlock("streak_7", state.streak >= 7 || state.bestStreak >= 7);
    const wordsLearned = Object.values(state.vocabProgress).filter((v) => v.correct > 0).length;
    tryUnlock("words_100", wordsLearned >= 100);
    tryUnlock("first_speaking", state.speakingPracticed.length >= 1);
    tryUnlock("conversation_starter", state.speakingPracticed.length >= 5);
    const grammarScores = state.quizScores.grammar || [];
    tryUnlock("grammar_master", grammarScores.some((r) => r.total > 0 && r.score / r.total >= 0.9));
    tryUnlock("english_master", this.getLevel(state.xp).name === "English Master");
    tryUnlock("speaker_7day", state.challengeCompletedDays.length >= 7);
    return newly.map((id) => ACHIEVEMENTS.find((a) => a.id === id));
  },

  getAchievements() {
    const state = Progress.get();
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: state.achievements.includes(a.id) }));
  }
};
