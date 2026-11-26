// Keeps only English and Hindi strings from Android libraries (smaller resources.arsc, smaller APK).
const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = function withLocaleFilter(config) {
  return withAppBuildGradle(config, (cfg) => {
    const g = cfg.modResults.contents;
    if (!g.includes('resConfigs "en", "hi"')) {
      cfg.modResults.contents = g.replace(/defaultConfig\s*\{/, (m) => `${m}\n        resConfigs "en", "hi"`);
    }
    return cfg;
  });
};
