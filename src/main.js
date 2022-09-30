import Vue from 'vue';
import router from "./router";
import store from "./store";
import App from './App.vue';

Vue.config.productionTip = false;

// import css
import './scss/app.scss';
import "@fortawesome/fontawesome-free/css/all.css";

// create getObjLength mixin
Vue.mixin({
  methods: {
    getObjLength(obj) {
      if (!obj) return 0;

      return Object.keys(obj).length || 0;
    }
  }
});

const app = new Vue({
  router: router,
  store: store,
  render: h => h(App),
}).$mount('#app');

store.$app = app;
