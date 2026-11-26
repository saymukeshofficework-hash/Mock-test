/** Turns the few LaTeX snippets in question text into readable plain text (e.g. \frac{1}{2} → 1/2). */
export function mathText(s: string): string {
  if (!s || !/[\\$]/.test(s)) return s;
  let out = s.replace(/(\d)\s*\\([dt]?frac)/g, "$1 \\$2");
  for (let i = 0; i < 3; i++) out = out.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_m, a: string, b: string) => `${a}/${b}`);
  out = out
    .replace(/\^\s*\\circ|\^\s*\{\\circ\}|\\circ/g, "°")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\le(q)?\b/g, "≤")
    .replace(/\\ge(q)?\b/g, "≥")
    .replace(/\\neq\b/g, "≠")
    .replace(/\\pi\b/g, "π")
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, "√($1)")
    .replace(/\^\{([^{}]*)\}/g, "^$1")
    .replace(/\\%/g, "%")
    .replace(/\\[()[\]]/g, "")
    .replace(/\$\$?/g, "")
    .replace(/\\,|\;|\\!/g, " ")
    .replace(/[ \t]{2,}/g, " ");
  return out.trim();
}
