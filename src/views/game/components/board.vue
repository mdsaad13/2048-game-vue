<template>
  <div class="board" :tabindex="tabIndex" :style="boardStyle">
    <div
      ref="cells"
      v-for="(cl, i) in cells"
      class="cell"
      :key="i"
      :style="cellStyle"
    >
      <Chip
        v-for="(ch, j) in cl.chips"
        :key="getKey(ch, i, j)"
        ref="chips"
        :animation-time-ms="animationTimeMs"
        :chip="ch"
        :size-px="cellSizePx"
      />
    </div>
  </div>
</template>
<script>
import Chip from "./chip.vue";

// eslint-disable-next-line no-unused-vars
import createGame2048 from "../../../helpers/game2048";

import config from "../../../helpers/config";

function deffered(delayMs, func) {
  var executed = false;
  function execute() {
    if (!executed) {
      func();
      executed = true;
    }
  }
  function renew() {
    executed = false;
    setTimeout(execute, delayMs);
  }
  renew();
  return {
    finish: execute,
    renew: renew,
  };
}

function createSwipeListener(onSwipe) {
  var sens = 5;
  var st;

  function onStart(e) {
    st = e.touches[0];
    e.preventDefault();
  }

  function onEnd(e) {
    var et = e.changedTouches[0];
    var x = st.clientX - et.clientX;
    var y = st.clientY - et.clientY;
    var mx = Math.abs(x);
    var my = Math.abs(y);
    if (mx < sens && my < sens) return;

    var d = mx > my ? (x > 0 ? "left" : "right") : y > 0 ? "up" : "down";
    onSwipe(d);
  }

  return {
    attach: function (el) {
      el.addEventListener("touchstart", onStart, false);
      el.addEventListener("touchend", onEnd, false);
    },
    detach: function (el) {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    },
  };
}

let listners = {
  keyboard: {
    listner: null,
    fun: null,
  },
  swipe: {
    listner: null,
  },
};

export default {
  components: {
    Chip,
  },
  props: {
    size: { type: Number },
    sizeAimMap: { type: Object, required: true },
    listenOwnKeyEventsOnly: { type: Boolean, default: false },
    tabIndex: { type: Number, default: 1 },
    boardSizePx: { type: Number, default: 0 },
    // animationTimeMs: { type: Number, default: 150 },
    animationTimeMs: { type: Number, default: 150 },
  },
  data() {
    var aim = this.sizeAimMap[this.size];
    return {
      cells: this.createCells(),
      boardSizeAutoPx: 0,
      aim: aim,
      justStarted: true, // to prevent history recording on resume game
      showCells: true,
    };
  },
  mounted() {
    this.boardSizeAutoPx =
      this.boardSizePx > 0
        ? this.boardSizePx
        : this.$el.getBoundingClientRect().width;

    this.justStarted = true;

    this.startGame();

    this.$root.$on("restart-game", this.restartGame);
    this.$root.$on("undo-game", this.undoGame);
  },
  methods: {
    getKey(chip, i, j) {
      chip = JSON.stringify(chip);

      // encode with base64
      chip = btoa(chip);

      // replace special characters
      chip = chip.replace(/\+/g, "-");

      return `${i}-${j}-${chip}`;
    },

    startGame() {
      this.emptyCells();
      this.removeListners();

      const resumeGame = JSON.parse(
        JSON.stringify(this.$store.getters["game/cellsToResume"] || null)
      );

      const game =
        resumeGame && resumeGame.cells && resumeGame.cells.length > 0
          ? this.resumeFromHistory(resumeGame)
          : this.freshStartGame();

      const doGameMove = this.createGameMove(game);
      this.runKeyboardControl(doGameMove);
      this.runTouchControl(doGameMove);

      this.$emit("started", this);
    },

    restartGame() {
      this.removeListners();

      this.$store.dispatch("game/reset");

      this.justStarted = true;

      // wait for vuex to update
      setTimeout(() => {
        this.startGame();
      }, 100);
    },

    undoGame() {
      const currentHistory = this.$store.getters["game/currentHistory"];

      if (currentHistory && this.getObjLength(currentHistory) > 1) {
        this.removeListners();

        this.$store.dispatch("game/undoHistory");

        this.justStarted = true;

        // wait for vuex to update
        setTimeout(() => {
          this.startGame();
        }, 200);
      }
    },

    resumeFromHistory(historyData) {
      this.cells = historyData.cells;

      // remove prevRelPos from chips in cells
      // this.cells.forEach((cl) => {
      //   cl.chips.forEach((ch) => {
      //     delete ch.prevRelPos;
      //   });
      // });

      const score = historyData ? historyData.score : 0;

      const game = createGame2048(
        this.size,
        score,
        this.cellsToBoard(historyData.cells)
      );

      return game;
    },

    freshStartGame() {
      const game = createGame2048(this.size);

      for (let i = Math.max(2, this.size - 2); i > 0; i--) {
        this.addChips(game.turn());
      }

      return game;
    },

    cellsToBoard(cells) {
      let board = [];
      for (let i = 0; i < this.size; i++) {
        board[i] = [];
        for (let j = 0; j < this.size; j++) {
          let index = i * this.size + j;
          let value = 0;

          if (cells[index].chips && cells[index].chips.length > 0) {
            value = cells[index].chips[cells[index].chips.length - 1].value;
          }

          board[i][j] = value;
        }
      }
      return board;
    },

    runKeyboardControl: function (doGameMove) {
      const listenKeysOn = this.listenOwnKeyEventsOnly ? this.$el : document;

      const h = (e) => {
        let m = config.keyMap[e.keyCode];
        if (m == null) return;
        this.justStarted = false;
        e.preventDefault();
        doGameMove(m);
      };

      listners.keyboard.fun = h;

      listners.keyboard.listner = listenKeysOn.addEventListener("keydown", h);

      // eventBus.$once("ended", () => {
      //   listenKeysOn.removeEventListener("keydown", h);
      // });
    },

    runTouchControl: function (doGameMove) {
      const sw = createSwipeListener((m) => {
        this.justStarted = false;
        doGameMove(m);
      });

      listners.swipe.listner = sw;

      sw.attach(this.$el);

      // this.$once("ended", () => {
      //   sw.detach(this.$el);
      // });
    },

    createGameMove: function (game) {
      var self = this;
      var boardChanges = { consolidations: [] };
      var newChips = [];

      var consolidateAndAddChipsDeffered = deffered(
        self.animationTimeMs,
        function () {
          self.consolidateChips(boardChanges.consolidations);
          self.addChips(newChips);

          setTimeout(() => {
            self.removePrevPos();
          }, self.animationTimeMs);

          setTimeout(() => {
            if (!self.justStarted) {
              self.$store.dispatch("game/updateHistory", {
                score: game.score(),
                cells: self.cells,
              });

              self.$root.$emit("game-history-updated");
            }
          });
        }
      );

      return function (m) {
        consolidateAndAddChipsDeffered.finish();

        boardChanges = game[m]();
        newChips.length = 0;

        if (boardChanges.moves.length > 0) {
          for (var i = 1; i > 0; i--) {
            var chips = game.turn();
            chips.push.apply(newChips, chips);
          }
          if (boardChanges.scoreInc > 0) {
            for (let i = 0; i < boardChanges.consolidations.length; i++) {
              if (boardChanges.consolidations[i].value == self.aim) {
                self.$emit("aim-reached");
                break;
              }
            }
          }
        }

        self.moveChips(boardChanges.moves);
        consolidateAndAddChipsDeffered.renew();

        if (!game.canMove()) {
          setTimeout(function () {
            self.endGame();
          }, self.animationTimeMs);
          return;
        }

        // setTimeout(() => {
        //   self.$store.dispatch("game/updateHistory", {
        //     score: game.score(),
        //     cells: self.cells,
        //   });
        // });
      };
    },

    removePrevPos() {
      this.cells.forEach((cl) => {
        cl.chips.forEach((ch) => {
          delete ch.prevRelPos;
          ch.isNew = false;
          ch.isMoving = false;
        });
      });
    },

    endGame: function () {
      this.$emit("ended", this);

      this.removeListners();
    },

    removeListners() {
      if (listners.keyboard.listner) {
        listners.keyboard.listner =
          listners.keyboard.listner.removeEventListener(
            "keydown",
            listners.keyboard.fun
          );

        listners.keyboard.fun = null;
        listners.keyboard.listner = null;
      }

      if (listners.swipe.listner) {
        listners.swipe.listner = listners.swipe.listner.detach(this.$el);

        listners.swipe.listner = null;
      }
    },

    // chip which are added, Eg. 2+2=4
    consolidateChips: function (consolidations) {
      consolidations.forEach((c) => {
        const cell = this.getCell(c);
        const chips = cell.chips;
        chips.splice(0, chips.length - 1);
        chips[0].value = c.value;
      });
    },
    moveChips(moves) {
      for (var i = 0; i < moves.length; i++) {
        this.moveChip(moves[i].from, moves[i].to);
      }
      setTimeout(() => {
        this.removePrevPos();
      }, this.animationTimeMs);
    },
    moveChip(from, to) {
      var fcell = this.getCell(from);
      var fcellEl = this.getCellEl(from);
      var tcell = this.getCell(to);
      var tcellEl = this.getCellEl(to);
      var chip = fcell.chips.splice(0, 1)[0];
      var fboundRect = fcellEl.getBoundingClientRect();
      var tboundRect = tcellEl.getBoundingClientRect();
      chip.prevRelPos = {
        left: fboundRect.left - tboundRect.left,
        top: fboundRect.top - tboundRect.top,
      };
      tcell.chips.push(chip);
      // console.log("movechip");
    },
    addChips: function (chips) {
      chips.forEach(this.addChip);
    },
    addChip: function (c) {
      this.cells[this.getCellIndex(c)].chips.push({
        value: c.value,
        isNew: true,
        isMoving: false,
      });
    },
    getCellIndex: function (c) {
      return c.y * this.size + c.x;
    },
    getCell: function (c) {
      return this.cells[this.getCellIndex(c)];
    },
    getCellEl: function (c) {
      return this.$refs.cells[this.getCellIndex(c)];
    },
    createCells: function () {
      return Array.apply(null, { length: this.size * this.size }).map(
        function () {
          return {
            chips: [
              {
                value: null,
                isNew: true,
                isMoving: false,
              },
            ],
          };
        }
      );
    },
    emptyCells: function () {
      this.cells.forEach(function (c) {
        c.chips.splice(0);
      });
    },
  },
  computed: {
    boardStyle: function () {
      return {
        width: this.boardSizePx > 0 ? this.boardSizePx + "px" : "100%",
        height: this.boardSizePx > 0 ? this.boardSizePx + "px" : "100%",
        borderRadius: 7 / this.size + "%",
      };
    },
    cellStyle: function () {
      return {
        width: this.cellSizePct + "%",
        height: this.cellSizePct + "%",
        marginLeft: this.cellMarginPct + "%",
        marginTop: this.cellMarginPct + "%",
      };
    },
    cellSizePct: function () {
      return 8 * this.cellMarginPct;
    },
    cellMarginPct: function () {
      return 100 / (9 * this.size + 1);
    },
    cellSizePx: function () {
      return (
        (this.cellSizePct / 100) *
        (this.boardSizePx > 0 ? this.boardSizePx : this.boardSizeAutoPx)
      );
    },
  },
  beforeDestroy() {
    this.removeListners();

    this.$root.$off("restart-game", this.restartGame);
    this.$root.$off("undo-game", this.undoGame);
  },
};
</script>
<style lang="scss" scoped>
.board {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  align-items: space-around;
  background-color: var(--board-bg);
  outline: none;
  max-width: 100%;

  .cell {
    background-color: var(--cell-bg);
    position: relative;
    border-radius: 8px;
  }
}
</style>