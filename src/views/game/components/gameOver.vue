<template>
  <div class="game-over appearing">
    <p>Game over!</p>
    <div class="buttons">
      <button @click="goHome()" class="btn btn-primary">
        <i class="fa fa-home icon"></i>
        <span>Home</span>
      </button>
      <button @click="restartGame()" class="btn btn-danger">
        <i class="fa fa-sync icon"></i>
        <span>Restart</span>
      </button>
      <button @click="undoGame()" class="btn btn-warning">
        <i class="fa fa-undo icon"></i>
        <span>Undo</span>
      </button>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    restartGame() {
      this.$root.$emit("restart-game");
    },
    goHome() {
      this.$router.push({ name: "home" });
    },
    undoGame() {
      this.$root.$emit("undo-game");
    },
  },
};
</script>
<style lang="scss" scoped>
.game-over {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #00000073;
  gap: 1rem;
  padding: 1rem;
  text-align: center;
  p {
    margin: 0;
    font-size: 2.4rem;
    color: #fff;
    font-weight: 600;
    width: 100%;
  }
  .buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: space-evenly;
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;
      .icon {
        margin-bottom: 0.2rem;
      }
    }
  }
}
</style>