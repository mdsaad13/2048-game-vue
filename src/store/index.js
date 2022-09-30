import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

import app from "./modules/app";
import game from './modules/game';

export default new Vuex.Store({
    modules: {
        app,
        game
    },
    plugins: [
        createPersistedState({ storage: window.localStorage })
    ],
});
