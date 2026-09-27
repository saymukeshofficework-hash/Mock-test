// Renders the passage with per-cluster highlighting and updates it incrementally.
//
// Each passage word is one <span class="w"> containing one <span class="c"> per
// visual cluster (so Hindi conjuncts and matras are never split). On every update
// only words whose state actually changed are re-rendered — typically the current
// word and its neighbour — so a keystroke costs a handful of DOM writes no matter
// how long the passage is.

function esc(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

export class PassageView {
  constructor(container, prepared) {
    this.container = container;
    this.prepared = prepared;
    this.wordEls = [];
    this.spaceEls = [];
    this.sigs = [];
    this.lastCurrent = 0;
    this.build();
  }

  build() {
    const frag = document.createDocumentFragment();
    this.prepared.words.forEach((word, i) => {
      const w = document.createElement("span");
      w.className = "w";
      w.innerHTML = this.renderWord(word, [], "pending");
      frag.appendChild(w);
      this.wordEls.push(w);
      this.sigs.push("p|");
      if (i < this.prepared.words.length - 1) {
        const sp = document.createElement("span");
        sp.className = "sp";
        sp.textContent = " ";
        frag.appendChild(sp);
        this.spaceEls.push(sp);
      }
    });
    this.container.textContent = "";
    this.container.appendChild(frag);
    this.update({ targetTyped: [], currentIndex: 0, missedSpaces: new Set() });
  }

  /** status: "done" | "current" | "pending" */
  renderWord(word, typed, status) {
    const units = word.units;
    let html = "";
    for (const { start, end } of word.clusters) {
      const text = esc(units.slice(start, end).join(""));
      let cls = "";
      if (status !== "pending") {
        if (typed.length >= end) {
          let ok = true;
          for (let k = start; k < end; k++) if (units[k] !== typed[k]) ok = false;
          cls = ok ? "ok" : "bad";
        } else if (typed.length > start) {
          let ok = true;
          for (let k = start; k < typed.length; k++) if (units[k] !== typed[k]) ok = false;
          cls = !ok ? "bad" : status === "current" ? "cur" : "miss";
        } else if (status === "current") {
          cls = typed.length === start ? "cur" : "";
        } else {
          cls = "miss";
        }
      }
      html += cls ? `<span class="c ${cls}">${text}</span>` : `<span class="c">${text}</span>`;
    }
    if (typed.length > units.length) {
      html += `<span class="x">${esc(typed.slice(units.length).join(""))}</span>`;
    }
    return html;
  }

  update({ targetTyped, currentIndex, missedSpaces }) {
    const words = this.prepared.words;
    const last = Math.min(words.length - 1, Math.max(currentIndex, this.lastCurrent) + 1);
    for (let i = 0; i <= last; i++) {
      const status = i < currentIndex ? "done" : i === currentIndex ? "current" : "pending";
      const typed = targetTyped[i] || [];
      const sig = status[0] + "|" + (status === "pending" ? "" : typed.join(""));
      if (sig !== this.sigs[i]) {
        this.sigs[i] = sig;
        const el = this.wordEls[i];
        el.innerHTML = this.renderWord(words[i], typed, status);
        el.classList.toggle("active", status === "current");
      }
      const sp = this.spaceEls[i];
      if (sp) {
        const spCls = missedSpaces.has(i) ? "sp miss" : i < currentIndex ? "sp ok" : i === currentIndex && typed.length >= words[i].units.length ? "sp cur" : "sp";
        if (sp.className !== spCls) sp.className = spCls;
      }
    }
    this.lastCurrent = currentIndex;
    this.keepCurrentVisible(Math.min(currentIndex, words.length - 1));
  }

  /** Scroll inside the passage box (never the page) so the current line stays in view. */
  keepCurrentVisible(index) {
    const el = this.wordEls[index];
    if (!el) return;
    const box = this.container;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    const viewTop = box.scrollTop;
    const viewBottom = viewTop + box.clientHeight;
    if (top < viewTop + 8 || bottom > viewBottom - 8) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 3);
    }
  }
}
