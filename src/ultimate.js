import { RoundedRect, EndGameMessage, CurrentPlayerSign } from "./UI.js";

const PLAYER = {
  X: "X",
  O: "O",
};

const CELL = {
  EMPTY: " ",
  X: PLAYER.X,
  O: PLAYER.O,
};

const GRID = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  X: PLAYER.X,
  O: PLAYER.O,
  DRAW: "draw",
};

const BOARD = {
  PLAY: "play",
  X: PLAYER.X,
  O: PLAYER.O,
  DRAW: "draw",
};

const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

class Cell {
  constructor({ board, grid, x, y, width, height }) {
    this.board = board;
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.globalAlpha;
    this.borderColor;
    this.borderWidth = 2;
    this.bg;
    this.color;
    this.content;
    this.state = CELL.EMPTY;
    this.roundedRect = new RoundedRect(this.board.game);
  }
  setState(newState) {
    if (this.state === CELL.EMPTY) this.state = newState;
  }
  cellStates(stateName) {
    switch (stateName) {
      case CELL.EMPTY:
        this.borderColor = "white";
        this.bg = "lightgray";
        this.color = "";
        this.content = " ";
        break;
      case CELL.X:
        this.borderColor = "#99A3FF";
        this.bg = "#0A1DC2";
        this.color = "#99A3FF";
        this.content = "X";
        break;
      case CELL.O:
        this.borderColor = "#FFCCCC";
        this.bg = "#C20A0A";
        this.color = "#FFCCCC";
        this.content = "O";
        break;
    }
    switch (this.grid.state) {
      case GRID.ACTIVE:
        this.globalAlpha = 1;
        this.borderColor = "#777";
        break;
      case GRID.INACTIVE:
        this.globalAlpha = 0.35;
        break;
      case GRID.X:
        this.borderColor = "rgba(10, 29, 194, 0.2)";
        this.bg = "#99A3FF";
        this.color = "rgba(10, 29, 194, 0.2)";
        break;
      case GRID.O:
        this.borderColor = "rgba(194, 10, 10, 0.2)";
        this.bg = "#FFCCCC";
        this.color = "rgba(194, 10, 10, 0.2)";
        break;
      case GRID.DRAW:
        this.borderColor = "#999999";
        this.bg = "#AAAAAA";
        this.color = "#999999";
        break;
    }
    switch (this.board.state) {
      case BOARD.X:
        this.borderColor = "rgba(10, 29, 194, 0.2)";
        this.bg = "#99A3FF";
        this.color = "rgba(10, 29, 194, 0.2)";
        break;
      case BOARD.O:
        this.borderColor = "rgba(194, 10, 10, 0.2)";
        this.bg = "#FFCCCC";
        this.color = "rgba(194, 10, 10, 0.2)";
        break;
      case BOARD.DRAW:
        this.borderColor = "#999999";
        this.bg = "#AAAAAA";
        this.color = "#999999";
        break;
    }
  }
  update() {
    this.cellStates(this.state);
  }
  draw(c) {
    let cellSpacing = this.grid.width <= 640 ? 8 : 16;
    let fontSize = this.grid.width <= 640 ? "64px" : "128px";
    let radius = this.grid.width <= 640 ? 10 : 20;
    c.save();
    // Cell Border
    c.strokeStyle = this.borderColor;
    c.lineWidth = this.borderWidth;
    this.roundedRect.draw({
      c: c,
      x: this.x + cellSpacing / 2,
      y: this.y + cellSpacing / 2,
      width: this.width - cellSpacing,
      height: this.height - cellSpacing,
      radius: radius,
      stroke: true,
    });
    // Cell Background
    c.fillStyle = this.bg;
    this.roundedRect.draw({
      c: c,
      x: this.x + cellSpacing / 2,
      y: this.y + cellSpacing / 2,
      width: this.width - cellSpacing,
      height: this.height - cellSpacing,
      radius: radius,
      fill: true,
    });
    // Cell Content
    c.fillStyle = this.color;
    c.font = `bold ${fontSize} Roboto Mono`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(
      this.state,
      this.x + this.width * 0.5,
      this.y + this.height * 0.5
    );
    c.restore();
  }
}

class Grid {
  constructor({ board, x, y, width, height }) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.state = GRID.INACTIVE;
    this.cells = [];
    this.createGrid();
  }
  createGrid() {
    const offset = 16;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        this.cells.push(
          new Cell({
            board: this.board,
            grid: this,
            x: offset / 2 + this.x + (col * (this.width - offset)) / 3,
            y: offset / 2 + this.y + (row * (this.height - offset)) / 3,
            width: (this.width - offset) / 3,
            height: (this.height - offset) / 3,
          })
        );
      }
    }
  }
  setState(newState) {
    this.state = newState;
  }
  isPlayable() {
    return this.state === GRID.ACTIVE || this.state === GRID.INACTIVE;
  }
  isNotPlayable() {
    return (
      this.state === GRID.X || this.state === GRID.O || this.state === GRID.DRAW
    );
  }
  isGridWon() {
    for (let combination of WINNING_COMBOS) {
      const [a, b, c] = combination;
      const cellA = this.cells[a].state;
      const cellB = this.cells[b].state;
      const cellC = this.cells[c].state;
      if (cellA === cellB && cellB === cellC && cellA !== CELL.EMPTY) {
        return { won: true, winner: cellA };
      }
    }
    return { won: false, winner: null };
  }
  isGridDraw() {
    return this.cells.every((cell) => cell.state !== CELL.EMPTY);
  }
  handleGridStateChange() {
    const { won, winner } = this.isGridWon();
    if (won) this.setState(GRID[winner]);
    else if (this.isGridDraw()) this.setState(GRID.DRAW);
  }
  update() {
    this.cells.forEach((cell) => cell.update());
    this.handleGridStateChange();
  }
  draw(c) {
    this.cells.forEach((cell) => cell.draw(c));
  }
}

export class Board {
  constructor(game) {
    this.game = game;
    this.input = this.game.input;
    this.width = Math.max(320, Math.min(this.game.width, 768)); // 320 to 768 width range
    this.height = Math.max(320, Math.min(this.game.width, 768)); // 320 to 768 height range
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = 160;
    this.init();
  }
  init() {
    this.gameOver = false;
    this.player = null;
    this.setCurrentPlayer();
    this.currentPlayerSign = new CurrentPlayerSign(this.game, this.player);
    this.grids = [];
    this.createBoard();
    this.state = BOARD.PLAY;
    this.endGameMessage = new EndGameMessage(this.game);
    this.setActiveGrid(4, 4);
  }
  createBoard() {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        this.grids.push(
          new Grid({
            board: this,
            x: this.x + (col * this.width) / 3,
            y: this.y + (row * this.height) / 3,
            width: this.width / 3,
            height: this.height / 3,
          })
        );
      }
    }
  }
  setState(newState) {
    this.state = newState;
  }
  setCurrentPlayer() {
    if (this.player === null)
      this.player = Math.random() <= 0.5 ? PLAYER.X : PLAYER.O;
    else if (this.player === PLAYER.X) this.player = PLAYER.O;
    else if (this.player === PLAYER.O) this.player = PLAYER.X;
  }
  handleClick() {
    this.grids.forEach((grid, gridIndex) => {
      if (grid.state === GRID.ACTIVE && !this.gameOver) {
        grid.cells.forEach((cell, cellIndex) => {
          if (
            this.input.isPointerOver(this.input.pointer, cell) &&
            cell.state === CELL.EMPTY
          ) {
            cell.setState(CELL[this.player]);
            grid.handleGridStateChange();
            this.handleBoardStateChange();
            if (this.gameOver) return;
            this.setActiveGrid(gridIndex, cellIndex);
            this.setCurrentPlayer();
          }
        });
      }
    });
  }
  setActiveGrid(prevIndex, newIndex) {
    const nextGrid = this.grids[newIndex];
    const prevGrid = this.grids[prevIndex];
    this.grids.forEach((grid) => {
      if (grid.state === GRID.ACTIVE) grid.setState(GRID.INACTIVE);
    });
    if (prevGrid === nextGrid) {
      if (nextGrid.isNotPlayable()) {
        this.grids.forEach((grid) => {
          if (grid.state === GRID.INACTIVE) grid.setState(GRID.ACTIVE);
        });
      } else if (nextGrid.isPlayable()) {
        nextGrid.setState(GRID.ACTIVE);
      }
    } else {
      if (prevGrid.isPlayable()) prevGrid.setState(GRID.INACTIVE);
      if (nextGrid.isNotPlayable()) {
        this.grids.forEach((grid) => {
          if (grid.state === GRID.INACTIVE) grid.setState(GRID.ACTIVE);
        });
      } else if (nextGrid.isPlayable()) {
        nextGrid.setState(GRID.ACTIVE);
      }
    }
  }
  isBoardWon(grids) {
    for (let combination of WINNING_COMBOS) {
      const [a, b, c] = combination;
      const gridA = grids[a].state;
      const gridB = grids[b].state;
      const gridC = grids[c].state;
      if (
        gridA === gridB &&
        gridB === gridC &&
        gridA !== GRID.INACTIVE &&
        gridA !== GRID.ACTIVE
      ) {
        return { won: true, winner: gridA };
      }
    }
    return { won: false, winner: null };
  }
  isBoardDraw(grid) {
    return grid.every((grids) => grids.isNotPlayable());
  }
  handleBoardStateChange() {
    const { won, winner } = this.isBoardWon(this.grids);
    if (won) {
      this.setState(BOARD[winner]);
      this.gameOver = true;
      this.handleReplayCountdown();
    } else if (this.isBoardDraw(this.grids)) {
      this.setState(BOARD.DRAW);
      this.gameOver = true;
      this.handleReplayCountdown();
    }
  }
  handleReplayCountdown() {
    if (this.gameOver) {
      let countdown = 3;
      const interval = setInterval(() => {
        countdown--;
        if (countdown < 0) {
          clearInterval(interval);
          this.init();
        }
      }, 1000);
    }
  }
  update() {
    this.grids.forEach((grid) => grid.update());
  }
  draw(c) {
    this.currentPlayerSign.draw(c);
    this.grids.forEach((grid) => grid.draw(c));
    const { won, winner } = this.isBoardWon(this.grids);
    if (won) {
      this.endGameMessage.draw(c, winner);
    } else if (this.isBoardDraw(this.grids)) {
      this.endGameMessage.draw(c);
    }
  }
}
