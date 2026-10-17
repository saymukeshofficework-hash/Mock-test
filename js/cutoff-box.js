/* Cut-off gap box shown on the result screen of a series' free test 01.
   Cut-off numbers are static here on purpose (no Supabase query, no egress).
   Used by assets/tet-engine.js (TET + CPCT) and rrb-ntpc/index.html.
   Update the numbers below when a new official cut-off is published. */
(function () {
  const TET = {
    max: 150,
    cutLabel: 'न्यूनतम पात्रता अंक / Qualifying marks',
    // MPESB qualifying marks: 60% UR, 50% reserved (MP domicile).
    cutoff: { UR: 90, EWS: 75, OBC: 75, SC: 75, ST: 75 },
    // Estimated safe score for merit (owner-supplied, not official).
    safe: { UR: 110, EWS: 104, OBC: 105, SC: 95, ST: 90 },
    price: typeof TET_SUBJECT_PRICE !== 'undefined' ? TET_SUBJECT_PRICE : 199,
  };
  const NTPC = {
    max: 100,
    cutLabel: 'पिछला कट-ऑफ (अनुमान) / Previous cut-off (approx.)',
    // Previous CBT-1 cut-offs, RRB Bhopal / Bilaspur zones (owner-supplied).
    cutoff: { UR: 84, EWS: 80, OBC: 81, SC: 77, ST: 69 },
    safe: { UR: 86, EWS: 83, OBC: 84, SC: 79, ST: 73 },
    price: 99, // keep in sync with notes-checkout products rrbg-tests / rrbu-tests
  };
  const CPCT = {
    max: 75,
    cutoff: null, // no reliable cut-off yet: show the unlock offer only
    price: typeof CPCT_SERIES !== 'undefined' ? CPCT_SERIES.price : 199,
  };

  // Which free test → which exam data and Pay Now page.
  function examFor(testId) {
    let m;
    if (testId === 'test01') return { ...TET, buy: '/tet/?level=primary&subject=hindi' };
    if ((m = /^tet([ps])-([a-z]+)-01$/.exec(testId)))
      return { ...TET, buy: '/tet/?level=' + (m[1] === 'p' ? 'primary' : 'secondary') + '&subject=' + m[2] };
    if (testId === 'cpct-exam-01') return { ...CPCT, buy: '/cpct/' };
    if ((m = /^rrbntpc-([gu])-full-01$/.exec(testId)))
      return { ...NTPC, buy: '/examhelp/rrb-ntpc-' + (m[1] === 'g' ? 'graduate' : 'undergraduate') + '-mock-tests/' };
    return null;
  }

  const CSS = '.cutoff-box{margin:20px 0;padding:18px;border-radius:12px;border:2px solid var(--cb);background:var(--cbg);text-align:left;line-height:1.5;color:#1f2937}' +
    '.cutoff-box h3{margin:0 0 10px;font-size:17px;color:var(--cb)}' +
    '.cutoff-cats{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:13px;font-weight:600;margin-bottom:10px}' +
    '.cutoff-cats button{padding:3px 9px;border-radius:6px;border:1px solid #d1d5db;background:#fff;color:#374151;font-weight:600;cursor:pointer}' +
    '.cutoff-cats button[aria-pressed="true"]{background:#111827;border-color:#111827;color:#fff}' +
    '.cutoff-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;background:#fff;padding:10px;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:12px;text-align:center}' +
    '.cutoff-grid small{display:block;font-size:12px;color:#6b7280}.cutoff-grid b{font-size:19px}' +
    '' +
    '.cutoff-buy{display:block;text-align:center;background:#16a34a;color:#fff!important;font-size:16px;font-weight:700;padding:13px 16px;border-radius:8px;text-decoration:none}' +
    '@media(max-width:480px){.cutoff-grid b{font-size:16px}}';

  function render(box, exam, score, cat) {
    const offer = '<a class="cutoff-buy" href="' + exam.buy + '">अभी ₹' + exam.price + ' में अनलॉक करें / Unlock now →</a>';
    if (!exam.cutoff) {
      box.style.cssText = '--cb:#5936a5;--cbg:#f5f3ff';
      box.innerHTML = '<h3>आपका स्कोर / Your score: ' + score + ' / ' + exam.max + '</h3>' + offer;
      return;
    }
    const cut = exam.cutoff[cat], safe = exam.safe[cat];
    let color, bg, head;
    if (score >= safe) {
      color = '#15803d'; bg = '#f0fdf4';
      head = '🎉 बहुत बढ़िया! आपका स्कोर सुरक्षित लक्ष्य से ऊपर है। अभ्यास जारी रखें।<br>Great! Your score is above the safe target. Keep practising.';
    } else if (score >= cut) {
      const gap = Math.ceil(safe - score);
      color = '#b45309'; bg = '#fffbeb';
      head = '⚠️ आपने कट-ऑफ पार किया, पर सुरक्षित लक्ष्य से ' + gap + ' अंक पीछे हैं।<br>You crossed the cut-off but are ' + gap + ' marks short of the safe target.';
    } else {
      const gap = Math.ceil(cut - score);
      color = '#dc2626'; bg = '#fef2f2';
      head = '🚨 आपका स्कोर कट-ऑफ से ' + gap + ' अंक कम है।<br>Your score is ' + gap + ' marks below the cut-off.';
    }
    box.style.cssText = '--cb:' + color + ';--cbg:' + bg;
    box.innerHTML =
      '<div class="cutoff-cats">श्रेणी / Category:' +
      ['UR', 'OBC', 'EWS', 'SC', 'ST'].map(c => '<button type="button" data-cat="' + c + '" aria-pressed="' + (c === cat) + '">' + c + '</button>').join('') +
      '</div><h3>' + head + '</h3>' +
      '<div class="cutoff-grid"><div><small>आपका स्कोर / Your score</small><b style="color:' + color + '">' + score + ' / ' + exam.max + '</b></div>' +
      '<div><small>' + exam.cutLabel + ' (' + cat + ')</small><b>' + cut + '</b></div>' +
      '<div><small>सुरक्षित लक्ष्य (अनुमान) / Safe target (est.)</small><b style="color:#15803d">' + safe + '+</b></div></div>' +
      offer;
    box.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => render(box, exam, score, b.dataset.cat)));
  }

  // after: element the box is inserted after. Skipped for buyers (profile passed by tet-engine).
  window.showCutoffBox = function (testId, score, after, profile) {
    const exam = examFor(testId);
    if (!exam || !after || typeof score !== 'number' || isNaN(score)) return;
    if (profile && (profile.purchased_tests || []).some(id => id !== testId && id.slice(0, -2) === testId.slice(0, -2))) return;
    if (!document.getElementById('cutoffBoxCss')) {
      const s = document.createElement('style');
      s.id = 'cutoffBoxCss'; s.textContent = CSS;
      document.head.appendChild(s);
    }
    let box = document.getElementById('cutoffBox');
    if (!box) { box = document.createElement('div'); box.id = 'cutoffBox'; box.className = 'cutoff-box'; }
    after.insertAdjacentElement('afterend', box);
    render(box, exam, Math.round(score * 100) / 100, 'UR');
  };
})();
