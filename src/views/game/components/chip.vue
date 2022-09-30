<template>
  <transition :css="false" @enter="enter">
    <div class="chip" :style="style">{{ chip.value }}</div>
  </transition>
</template>
<script>
var fontSizeCoefs = [1, 1, 0.8, 0.65, 0.5, 0.4, 0.35, 0.32];

import * as chipColors from "../../../helpers/chipColors.js";

const chipBgColors = chipColors.original.background;
const chipTextColors = chipColors.original.color;

export default {
  props: {
    chip: { type: Object },
    sizePx: { type: Number },
    animationTimeMs: { type: Number },
  },
  mounted() {
    this.enter(this.$el);
  },
  computed: {
    style: function () {
      return {
        fontSize: this.fontSizePx - 10 + "px",
        backgroundColor: this.backColor,
        color: this.color,
      };
    },
    fontSizePx() {
      var n = Math.floor(Math.log(this.chip.value) / Math.log(10));
      var b = Math.floor(this.sizePx / 1.5);
      return b * (n < 8 ? fontSizeCoefs[n] : fontSizeCoefs[7]);
    },
    backColor() {
      return chipBgColors[this.chip.value] || chipBgColors[2048];
    },
    color() {
      return chipTextColors[this.chip.value] || chipTextColors[2048];
    },
  },
  watch: {
    // "chip.value": function () {
    //   var el = this.$el;
    //   if (el) {
    //     var d = this.animationTimeMs + "ms";
    //     el.style["-webkit-animation"] = el.style.animation =
    //       "chip-value-changed " + d;
    //     el.style.transition = "background-color " + d;
    //     el.style["-webkit-transition"] = "-web-kit-background-color " + d;
    //   }
    // },
  },
  methods: {
    enter(el) {
      var self = this;
      if (this.chip.prevRelPos) {
        var p = this.chip.prevRelPos;
        el.style["-webkit-transform"] = el.style.transform =
          "translate(" + p.left + "px," + p.top + "px)";
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.style.transition = "transform " + self.animationTimeMs + "ms";
            el.style["-webkit-transition"] =
              "-webkit-transform " + self.animationTimeMs + "ms";
            el.style["-webkit-transform"] = el.style.transform = "";
          });
        });
      } else if (this.chip.isNew) {
        el.style["-webkit-animation"] = el.style.animation =
          "chip-appear " + this.animationTimeMs + "ms";
      }
    },
  },
};
</script>