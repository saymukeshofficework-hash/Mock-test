import { Token } from './Token.js';

export const TOKENS_PER_PLAYER = 4;

export class Player {
  constructor(color, name, seatIndex) {
    this.color = color;
    this.name = name;
    this.seatIndex = seatIndex; // 0-based turn order / panel slot
    this.tokens = Array.from({ length: TOKENS_PER_PLAYER }, (_, i) => new Token(color, i));
  }

  get finishedCount() {
    return this.tokens.filter((t) => t.isFinished).length;
  }

  get hasWon() {
    return this.finishedCount === TOKENS_PER_PLAYER;
  }

  get tokensAtHome() {
    return this.tokens.filter((t) => t.isHome);
  }

  get tokensActive() {
    return this.tokens.filter((t) => t.isActive);
  }

  toJSON() {
    return {
      color: this.color,
      name: this.name,
      seatIndex: this.seatIndex,
      tokens: this.tokens.map((t) => t.toJSON())
    };
  }

  static fromJSON(data) {
    const p = new Player(data.color, data.name, data.seatIndex);
    p.tokens = data.tokens.map(Token.fromJSON);
    return p;
  }
}
