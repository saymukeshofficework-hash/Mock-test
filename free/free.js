/* Group landing pages (Telegram / WhatsApp). One page per exam with a free test 01.
   ?src=telegram|whatsapp|<group> is kept and passed to the test, so each lead shows its source.
   The test opens without login (free-test.html, or rrb-ntpc with lead=1). */
(function () {
  const PAGES = {
    'tet-primary': { tests: [
      ['हिंदी / Hindi', '150 प्रश्न · 150 मिनट', '/free-test.html?t=test01'],
      ['अंग्रेज़ी / English', '150 प्रश्न · 150 मिनट', '/free-test.html?t=tetp-english-01'],
      ['संस्कृत / Sanskrit', '150 प्रश्न · 150 मिनट', '/free-test.html?t=tetp-sanskrit-01']] },
    'tet-secondary': { tests: [
      ['हिंदी / Hindi', '150 प्रश्न · 150 मिनट', '/free-test.html?t=tets-hindi-01'],
      ['अंग्रेज़ी / English', '150 प्रश्न · 150 मिनट', '/free-test.html?t=tets-english-01'],
      ['गणित / Mathematics', '150 प्रश्न · 150 मिनट', '/free-test.html?t=tets-maths-01'],
      ['विज्ञान / Science', '150 प्रश्न · 150 मिनट', '/free-test.html?t=tets-science-01'],
      ['सामाजिक विज्ञान / Social Science', '150 प्रश्न · 150 मिनट', '/free-test.html?t=tets-sst-01']] },
    'rrb-ntpc-graduate': { tests: [
      ['पूर्ण CBT-1 / Full CBT-1', '100 प्रश्न · 90 मिनट · −⅓', '/rrb-ntpc/?test=rrbntpc-g-full-01&lead=1']] },
    'rrb-ntpc-12th': { tests: [
      ['पूर्ण CBT-1 / Full CBT-1', '100 प्रश्न · 90 मिनट · −⅓', '/rrb-ntpc/?test=rrbntpc-u-full-01&lead=1']] },
    'cpct': { tests: [
      ['CPCT पेपर (MCQ) / Paper (MCQ)', '75 प्रश्न · 75 मिनट', '/free-test.html?t=cpct-exam-01']] },
  };
  const p = PAGES[document.body.dataset.exam];
  const src = (new URLSearchParams(location.search).get('src') || 'direct').replace(/[^\w-]/g, '').slice(0, 30) || 'direct';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  document.getElementById('tests').innerHTML = p.tests.map(([t, m, href]) =>
    `<div class="card"><div><h3>${esc(t)}</h3><p>${esc(m)}</p></div><a class="btn" href="${href}&src=${src}">▶ शुरू करें / Start</a></div>`).join('');
  if (p.tests.length === 1) {
    const a = document.querySelector('#tests a');
    document.getElementById('cta').innerHTML = `<a class="btn big" href="${a.getAttribute('href')}">▶ फ्री टेस्ट शुरू करें / Start free test</a>`;
  }
})();
