import { InputHandler } from "./InputHandler.js";
import { Board } from "./ultimate.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.input = new InputHandler({
      game: this,
      canvas: this.canvas,
      onPointerEvent: (pointer) => {
        this.handlePointerEvent(pointer);
      },
    });
    this.board = new Board(this);
  }
  handlePointerEvent(pointer) {
    this.board.handleClick(pointer);
  }
  render(c) {
    this.board.update(c);
    this.board.draw(c);
  }
}
