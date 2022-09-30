<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty("--vh", `${vh}px`);
window.onresize = function () {
  vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

export default {
  name: "App",
  components: {},
};
</script>