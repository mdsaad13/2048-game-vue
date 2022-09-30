<template>
  <div class="container appearing">
    <img
      src="/images/favicon.png"
      alt=""
      height="100"
      style="margin-bottom: 0.5rem"
    />
    <h1 class="app-name">2048 Game</h1>
    <div class="game-modes">
      <div
        class="mode"
        v-for="gameMode in gameModes"
        :key="gameMode.size"
        role="button"
        @click.prevent="startGame(gameMode.size)"
      >
        <div class="label" v-text="gameMode.label"></div>
        <i class="fa fa-play icon"></i>
      </div>
      <div class="mode">
        <div class="label">Settings</div>
        <i class="fa fa-cog icon"></i>
      </div>
    </div>
  </div>
</template>

<script>
import config from "../helpers/config";

export default {
  name: "Home",
  mounted() {},
  methods: {
    startGame(size) {
      this.$store.dispatch("game/setMode", size);

      setTimeout(() => {
        this.$router.push({ name: "game" });
      });
    },
  },
  computed: {
    gameModes() {
      return config.sizeAimMap;
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.app-name {
  font-weight: 600;
  font-size: 2.5rem;
  margin: 0;
  margin-bottom: 2.4rem;
  color: var(--dark);
}

.game-modes {
  width: 100%;
  .mode {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    background-color: var(--card-color);

    cursor: pointer;
    outline: none;
    transition: all 0.2s ease-in-out;

    &:hover,
    &:focus,
    &:active {
      background-color: var(--primary);
      color: var(--primary-contrast);
    }

    .label {
      font-size: 1rem;
      font-weight: 600;
      flex: 1;
    }

    .icon {
      font-size: 1.2rem;
    }

    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }
}
</style>