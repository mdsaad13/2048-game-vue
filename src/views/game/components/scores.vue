<template>
  <div class="scores">
    <div class="score moves">
      <div class="label">Moves</div>
      <div class="value">{{ moves }}</div>
    </div>
    <div class="score">
      <div class="label">Score</div>
      <div class="value">{{ score }}</div>
    </div>
    <div class="score best">
      <div class="label">Best</div>
      <div class="value">{{ bestScore }}</div>
    </div>
  </div>
</template>
<script>
export default {
  computed: {
    score() {
      return this.$store.getters["game/currentScore"] || 0;
    },
    bestScore() {
      return this.$store.getters["game/currentBestScore"] || 0;
    },
    moves() {
      return this.$store.getters["game/currentMoves"] || 0;
    },
  },
};
</script>
<style lang="scss" scoped>
.scores {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
  text-align: center;

  .score {
    flex: 1;
    background-color: var(--card-color);
    color: var(--dark);
    box-shadow: var(--box-shadow);
    border-radius: 6px;
    padding: 0.5rem 1.6rem;

    .label {
      font-size: 0.7rem;
      font-weight: 500;
      text-transform: uppercase;
      margin-bottom: 0.2rem;
      opacity: 0.7;
      letter-spacing: 1px;
    }

    .value {
      font-size: 1.2rem;
      font-weight: bold;
    }
  }
}
</style>