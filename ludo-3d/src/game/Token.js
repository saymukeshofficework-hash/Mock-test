import { FINISH_REL, relStepToGrid } from './BoardData.js';

let uid = 0;

/** A single Ludo piece. Purely data + small helpers — no rendering here. */
export class Token {
  constructor(color, indexInPlayer) {
    this.id = `tok_${color}_${indexInPlayer}_${uid++}`;
    this.color = color;
    this.indexInPlayer = indexInPlayer; // 0..3
    /** @type {'home'|'active'|'finished'} */
    this.state = 'home';
    /** Relative step 0..56, or null while sitting in the base. */
    this.relStep = null;
  }

  get isHome() { return this.state === 'home'; }
  get isFinished() { return this.state === 'finished'; }
  get isActive() { return this.state === 'active'; }

  gridPosition() {
    if (this.state !== 'active') return null;
    return relStepToGrid(this.color, this.relStep);
  }

  enterBoard(startRelStep = 0) {
    this.state = 'active';
    this.relStep = startRelStep;
  }

  advance(steps) {
    this.relStep += steps;
    if (this.relStep >= FINISH_REL) {
      this.relStep = FINISH_REL;
      this.state = 'finished';
    }
  }

  sendHome() {
    this.state = 'home';
    this.relStep = null;
  }

  toJSON() {
    return { id: this.id, color: this.color, indexInPlayer: this.indexInPlayer, state: this.state, relStep: this.relStep };
  }

  static fromJSON(data) {
    const t = new Token(data.color, data.indexInPlayer);
    t.id = data.id;
    t.state = data.state;
    t.relStep = data.relStep;
    return t;
  }
}
