import { InputHandler } from "./InputHandler.js";
import { Header, Footer } from "./UI.js";
import { Board } from "./ultimate.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.input = new InputHandler({
      game: this,
      canvas: this.canvas,
    });
    this.header = new Header(this);
    this.board = new Board(this);
    this.footer = new Footer(this);
  }
  render(c) {
    this.header.logo(c);
    this.board.update(c);
    this.board.draw(c);
    this.footer.draw(c);
  }
}
