// Shared renderer for exam landing pages (uptet.html, up-tgt.html, up-pgt.html,
// ctet.html). Reuses the same .card/.grid/.status-locked classes as tests.html and
// dashboard.html — no new visual system. Every test links to exam-test.html?t=<id>,
// the one generic test-taking page shared with the original 20 TET tests.

function testChip(examName, subjectLabel, test) {
  const a = document.createElement('a');
  const available = test.contentStatus === 'available';
  a.className = 'btn ' + (available ? 'btn-primary' : 'btn-locked');
  a.style.cssText = 'font-size:12px;padding:6px 4px;text-align:center;';
  a.textContent = `Test ${String(test.number).padStart(2, '0')}`;
  if (available) {
    a.href = `exam-test.html?t=${encodeURIComponent(test.id)}`;
  } else {
    a.href = '#';
    a.setAttribute('aria-disabled', 'true');
    a.title = 'Content coming soon';
    a.addEventListener('click', (e) => e.preventDefault());
  }
  return a;
}

function subjectCard(examName, subject, paperLabel) {
  const card = document.createElement('div');
  card.className = 'card';
  const availableCount = subject.tests.filter((t) => t.contentStatus === 'available').length;
  card.innerHTML = `
    <h3 style="margin:0 0 4px;">${subject.name}</h3>
    <p class="desc" style="margin:0 0 10px;color:var(--muted);font-size:13px;">
      ${paperLabel ? paperLabel + ' &middot; ' : ''}${subject.tests.length} tests
      ${availableCount > 0 ? `&middot; <span class="status-owned">${availableCount} live</span>` : `&middot; <span class="status-locked">Content coming soon</span>`}
    </p>
    <button type="button" class="btn btn-secondary btn-block toggle-btn">Show Tests</button>
    <div class="test-grid" style="display:none;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:6px;margin-top:12px;"></div>
  `;
  const toggleBtn = card.querySelector('.toggle-btn');
  const grid = card.querySelector('.test-grid');
  let built = false;
  toggleBtn.addEventListener('click', () => {
    if (!built) {
      subject.tests.forEach((t) => grid.appendChild(testChip(examName, subject.name, t)));
      built = true;
    }
    const showing = grid.style.display !== 'none';
    grid.style.display = showing ? 'none' : 'grid';
    toggleBtn.textContent = showing ? 'Show Tests' : 'Hide Tests';
  });
  return card;
}

// Renders one exam's full structure (papers/subjects, and mocks if present) into
// `container`. `examId` must be a key in EXAM_CATALOG.
function renderExamPage(examId, container) {
  const exam = EXAM_CATALOG[examId];
  if (!exam) {
    container.textContent = 'Exam not found.';
    return;
  }

  const intro = document.createElement('div');
  intro.innerHTML = `<h1>${exam.name}</h1><p class="lead">${exam.fullName} &mdash; ${exam.description}</p>`;
  container.appendChild(intro);

  const paperGroups = exam.papers
    ? exam.papers.map((p) => ({ label: p.id.toUpperCase(), subjects: p.subjects }))
    : [{ label: null, subjects: exam.subjects }];

  paperGroups.forEach((group) => {
    if (group.label) {
      const h2 = document.createElement('h2');
      h2.style.cssText = 'font-size:18px;margin:28px 0 14px;';
      h2.textContent = `Paper ${group.label.slice(1)}`;
      container.appendChild(h2);
    }
    const grid = document.createElement('div');
    grid.className = 'grid';
    group.subjects.forEach((s) => grid.appendChild(subjectCard(exam.name, s, group.label)));
    container.appendChild(grid);
  });

  if (exam.mocks) {
    const h2 = document.createElement('h2');
    h2.style.cssText = 'font-size:18px;margin:28px 0 14px;';
    h2.textContent = 'Full Mock Tests';
    container.appendChild(h2);
    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.appendChild(subjectCard(exam.name, { name: 'Full-Length Mocks', tests: exam.mocks }, null));
    container.appendChild(grid);
  }
}
