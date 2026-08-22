/* Student profile + progress state. Single source of truth in localStorage
   under the "progress" key; every module reads/writes through Progress.*  */
const Progress = {
  _default() {
    return {
      xp: 0,
      streak: 0,
      bestStreak: 0,
      lastActiveDate: null,
      completedLessons: [],
      achievements: [],
      vocabProgress: {},
      speakingPracticed: [],
      challengeDay: 0,
      challengeCompletedDays: [],
      dailyGym: { date: null, wordPower: false, grammar: false, speaking: false, realEnglish: false, confidence: false },
      quizScores: { grammar: [], vocabulary: [] },
      testSnapshot: null,
      phraseLastSeen: null
    };
  },

  get() {
    const stored = Storage.get("progress");
    if (!stored) return this._default();
    return Object.assign(this._default(), stored);
  },

  save(state) {
    Storage.set("progress", state);
  },

  update(mutator) {
    const state = this.get();
    mutator(state);
    this.save(state);
    return state;
  },

  getProfile() {
    return Storage.get("profile", null);
  },

  saveProfile(profile) {
    Storage.set("profile", profile);
  },

  todayKey() {
    return new Date().toISOString().slice(0, 10);
  },

  touchStreak() {
    return this.update((state) => {
      const today = this.todayKey();
      if (state.lastActiveDate === today) return;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (state.lastActiveDate === yesterday) {
        state.streak += 1;
      } else {
        state.streak = 1;
      }
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.lastActiveDate = today;
      if (state.dailyGym.date !== today) {
        state.dailyGym = { date: today, wordPower: false, grammar: false, speaking: false, realEnglish: false, confidence: false };
      }
    });
  },

  markLessonComplete(lessonId) {
    return this.update((state) => {
      if (!state.completedLessons.includes(lessonId)) {
        state.completedLessons.push(lessonId);
      }
    });
  },

  recordVocabAttempt(wordId, correct) {
    return this.update((state) => {
      const entry = state.vocabProgress[wordId] || { seen: 0, correct: 0, lastReview: null };
      entry.seen += 1;
      if (correct) entry.correct += 1;
      entry.lastReview = this.todayKey();
      state.vocabProgress[wordId] = entry;
    });
  },

  recordQuizScore(type, score, total) {
    return this.update((state) => {
      if (!state.quizScores[type]) state.quizScores[type] = [];
      state.quizScores[type].push({ score, total, date: this.todayKey() });
    });
  },

  markSpeakingPracticed(promptId) {
    return this.update((state) => {
      if (!state.speakingPracticed.includes(promptId)) {
        state.speakingPracticed.push(promptId);
      }
    });
  },

  markGymTask(task) {
    return this.update((state) => {
      const today = this.todayKey();
      if (state.dailyGym.date !== today) {
        state.dailyGym = { date: today, wordPower: false, grammar: false, speaking: false, realEnglish: false, confidence: false };
      }
      state.dailyGym[task] = true;
    });
  },

  isGymTaskDone(task) {
    const state = this.get();
    return state.dailyGym.date === this.todayKey() && !!state.dailyGym[task];
  },

  isGymComplete() {
    const state = this.get();
    if (state.dailyGym.date !== this.todayKey()) return false;
    return ["wordPower", "grammar", "speaking", "realEnglish", "confidence"].every((t) => state.dailyGym[t]);
  },

  saveTestSnapshot(snapshot) {
    return this.update((state) => {
      state.testSnapshot = snapshot;
    });
  },

  markChallengeDay(day) {
    return this.update((state) => {
      if (!state.challengeCompletedDays.includes(day)) {
        state.challengeCompletedDays.push(day);
      }
      state.challengeDay = Math.max(state.challengeDay, day);
    });
  }
};
