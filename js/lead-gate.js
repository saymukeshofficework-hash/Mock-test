/* Lead box for the free test 01 opened from a group landing page (/free/).
   Shown once, just before the result: name + WhatsApp number, saved with one
   insert into Supabase `leads` (insert-only for anon, see
   supabase/migrations/20261014090000_leads.sql). Remembered in localStorage so
   the same student is not asked again. Needs supabaseClient (js/auth.js). */
(function () {
  const KEY = 'tth-lead';
  const src = () => {
    const q = new URLSearchParams(location.search).get('src');
    try { if (q) sessionStorage.setItem('tth-src', q); return (q || sessionStorage.getItem('tth-src') || 'direct').slice(0, 30); }
    catch (e) { return (q || 'direct').slice(0, 30); }
  };
  src();

  const CSS = '.lg-bg{position:fixed;inset:0;background:rgba(17,24,39,.6);display:flex;align-items:center;justify-content:center;padding:16px;z-index:9999}' +
    '.lg{background:#fff;color:#1f2937;border-radius:14px;max-width:380px;width:100%;padding:20px;font:15px/1.5 system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.3)}' +
    '.lg h3{margin:0 0 6px;font-size:18px;color:#0f6b5f}.lg p{margin:0 0 12px;font-size:13px;color:#4b5563}' +
    '.lg input{width:100%;box-sizing:border-box;padding:11px;border:1px solid #d1d5db;border-radius:8px;font-size:16px;margin:0 0 10px}' +
    '.lg button{width:100%;padding:12px;border:0;border-radius:8px;background:#0f6b5f;color:#fff;font-size:16px;font-weight:700;cursor:pointer}' +
    '.lg button:disabled{opacity:.6}.lg .err{color:#dc2626;font-size:13px;min-height:18px;margin:0 0 6px}.lg small{display:block;margin-top:10px;font-size:11px;color:#6b7280}';

  // exam: short label saved with the lead; testId: e.g. tets-maths-01; done: shows the result.
  window.leadGate = function (exam, testId, name, done) {
    try { if (localStorage.getItem(KEY)) return done(); } catch (e) {}
    if (!document.getElementById('lgCss')) {
      const s = document.createElement('style'); s.id = 'lgCss'; s.textContent = CSS; document.head.appendChild(s);
    }
    const bg = document.createElement('div');
    bg.className = 'lg-bg';
    bg.innerHTML = '<form class="lg" novalidate><h3>🎯 आपका रिज़ल्ट तैयार है!</h3>' +
      '<p>अपना स्कोर व कट-ऑफ रैंक देखने के लिए नाम और WhatsApp नंबर डालें।<br>Enter your name and WhatsApp number to see your score and cut-off rank.</p>' +
      '<input name="n" autocomplete="name" placeholder="आपका नाम / Your name" maxlength="60">' +
      '<input name="p" type="tel" inputmode="numeric" autocomplete="tel" placeholder="WhatsApp नंबर / number (10 अंक)" maxlength="14">' +
      '<div class="err"></div><button type="submit">रिज़ल्ट देखें / See result</button>' +
      '<small>नंबर सिर्फ TETTESTHUB की टेस्ट व परीक्षा अपडेट के लिए। / Used only for TETTESTHUB test and exam updates.</small></form>';
    document.body.appendChild(bg);
    const f = bg.querySelector('form'), err = bg.querySelector('.err'), btn = bg.querySelector('button');
    f.n.value = name || '';
    (name ? f.p : f.n).focus();
    f.onsubmit = async (e) => {
      e.preventDefault();
      const n = f.n.value.trim().replace(/\s+/g, ' ');
      const p = f.p.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
      if (n.length < 2) { err.textContent = 'कृपया नाम लिखें। / Please enter your name.'; return; }
      if (!/^[6-9]\d{9}$/.test(p)) { err.textContent = 'सही 10 अंकों का मोबाइल नंबर लिखें। / Enter a valid 10-digit mobile number.'; return; }
      btn.disabled = true; err.textContent = '';
      try {
        if (typeof supabaseClient !== 'undefined' && supabaseClient) await supabaseClient.from('leads').insert({ name: n, phone: p, exam: String(exam).slice(0, 40), test_id: String(testId).slice(0, 40), source: src() });
      } catch (e2) {} // never block the result on a failed insert
      try { localStorage.setItem(KEY, '1'); } catch (e3) {}
      bg.remove();
      done();
    };
  };
})();
