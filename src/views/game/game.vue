<template>
  <div class="container">
    <div class="main-container appearing">
      <div class="game-aim" :class="{ 'game-aim-reached': gameAimReached }">
        {{ gameAim }} Game
      </div>
      <Scores class="score-container" />
      <div class="game-controls">
        <router-link
          :to="{ name: 'home' }"
          class="btn btn-primary btn-sm"
          href=""
        >
          <i class="fa fa-home" style="margin-right: 0.2rem"></i>
          <span>Home</span>
        </router-link>
        <div class="group">
          <button class="btn btn-danger btn-sm" @click.prevent="restartGame">
            <i class="fa fa-sync" style="margin-right: 0.2rem"></i>
            <span>Restart</span>
          </button>
          <button
            class="btn btn-warning btn-sm"
            @click.prevent="undoGame"
            :disabled="undoCount <= 0"
          >
            <i class="fa fa-undo" style="margin-right: 0.2rem"></i>
            <span>Undo</span>
            <span class="badge" v-if="undoCount" v-text="undoCount"></span>
          </button>
        </div>
      </div>
      <div class="game-container" :style="gameContainerStyle">
        <GameOver v-if="gameEnded" />
        <Board
          v-if="showBoard"
          :size="parseInt(size)"
          :size-aim-map="sizeAimMap"
          :listen-own-key-events-only="false"
          :tab-index="1"
          :board-size-px="boardSizePx"
          :started="gameStarted"
          @started="onGameStarted"
          @ended="onGameEnded"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Board from "./components/board.vue";
import GameOver from "./components/gameOver.vue";
import Scores from "./components/scores.vue";

var defBoardSizePx = 420;
var defSize = 4;

export default {
  name: "HomePage",
  components: {
    Board,
    GameOver,
    Scores,
  },
  data() {
    const sizeAimMap = { 3: 256, 4: 2048, 5: 2048, 6: 2048 };

    var sizes = [];
    var i = 0;
    for (var s in sizeAimMap) {
      sizes[i++] = s;
    }

    defSize = this.$store.getters["game/mode"] || defSize;

    return {
      boardSizePx: defBoardSizePx,
      size: defSize,
      sizeAimMap: sizeAimMap,
      gameStarted: true,
      gameEnded: false,
      gameAim: sizeAimMap[defSize],
      gameAimReached: false,
      showBoard: true,
      undoCount: 0,
    };
  },
  mounted: function () {
    requestAnimationFrame(() => {
      this.fitBoardSizePx();
    });

    this.$root.$on("game-history-updated", this.calculateUndoCount);
  },
  methods: {
    fitBoardSizePx() {
      if (window.innerWidth < defBoardSizePx * 1.04) {
        const px = 16;
        this.boardSizePx = window.innerWidth - 2 * px;
      } else {
        this.boardSizePx = defBoardSizePx;
      }
    },
    startGame() {
      this.gameStarted = true;
    },
    restartGame() {
      this.gameStarted = false;
      this.gameEnded = false;
      this.gameAimReached = false;
      this.$root.$emit("restart-game");
    },
    undoGame() {
      this.$root.$emit("undo-game");
    },
    onGameStarted() {
      this.gameStarted = true;
      this.gameEnded = false;

      this.calculateUndoCount();
    },
    onGameEnded() {
      this.gameStarted = false;
      this.gameEnded = true;
      this.gameAimReached = false;
    },
    calculateUndoCount() {
      if (this.currentHistory && this.getObjLength(this.currentHistory) > 1) {
        this.undoCount = this.getObjLength(this.currentHistory) - 1;
        return;
      }
      this.undoCount = 0;
    },
  },
  computed: {
    gameContainerStyle: function () {
      return {
        width: this.boardSizePx + "px",
        height: this.boardSizePx + "px",
      };
    },
    // canUndo() {
    //   if (this.currentHistory && this.getObjLength(this.currentHistory) > 0) {
    //     return true;
    //   }
    //   return false;
    // },
    currentHistory() {
      return this.$store.getters["game/currentHistory"];
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: 0.1s ease;
  gap: 1.2rem;
  margin: auto;
  max-width: 420px;
  width: 100%;

  /* Hack to improve transition performance on mobile devices. It enables GPU rendering. */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);

  @media (max-width: 576px) {
    margin: 0 !important;
    width: 100% !important;
  }

  .score-container,
  .game-aim,
  .game-controls,
  .game-container {
    flex: 1;
    width: 100%;
  }

  .game-aim {
    font-size: 2.8rem;
    text-align: center;
    color: var(--dark);
    font-weight: 600;
    transition: 0.1s ease;
    letter-spacing: 1px;
  }

  .game-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin: 0.5rem 0;
    width: 100%;

    .group {
      display: flex;
      align-items: center;
      gap: 0.6rem;

      .btn {
        position: relative;
      }

      .badge {
        position: absolute;
        top: -10px;
        right: -9px;
        font-size: 0.6rem;
        padding: 0.1rem 0.3rem;
        border-radius: 50%;
        background-color: var(--primary);
        color: var(--dark);
        font-weight: 500;
      }
    }
  }
}
</style>
