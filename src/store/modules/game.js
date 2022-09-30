/* eslint-disable no-unused-vars */
const historyTemplate = {
    moves: 0,
    score: 0,
    cells: [],
}

const state = {
    mode: 4,
    aim: 2048,
    score: {
        3: 0,
        4: 0,
        5: 0,
        6: 0,
    },
    bestScores: {
        3: 0,
        4: 0,
        5: 0,
        6: 0,
    },
    moves: {
        3: 0,
        4: 0,
        5: 0,
        6: 0,
    },
    history: {
        3: {},
        4: {},
        5: {},
        6: {},
    },
};

const getters = {
    mode: state => state.mode,
    aim: state => state.aim,

    moves: state => state.moves,
    currentMoves: state => state.moves[state.mode],

    score: state => state.score,
    currentScore: state => state.score[state.mode],

    bestScores: state => state.bestScores,
    currentBestScore: state => state.bestScores[state.mode],

    history: state => state.history,
    currentHistory: state => state.history[state.mode],

    cellsForUndo: state => state.history[state.mode][state.moves[state.mode] - 1],
    cellsToResume: state => state.history[state.mode][state.moves[state.mode]],
};

const mutations = {
    setMode(state, mode) {
        state.mode = mode;
    },
    setAim(state, aim) {
        state.aim = aim;
    },
    setMoves(state, moves) {
        state.moves[state.mode] = moves;
    },
    incrementMoves(state) {
        state.moves[state.mode]++;
    },
    setScore(state, score) {
        state.score[state.mode] = score;
    },
    setBestScores(state, bestScores) {
        state.bestScores[state.mode] = bestScores;
    },
    setHistory(state, history) {
        state.history[state.mode] = history;
    },
    addHistory(state, history) {
        // add new history by making it non reactive
        state.history[state.mode][history.moves] = JSON.parse(JSON.stringify(history));

        // keep only 11 last histories
        if (Object.keys(state.history[state.mode]).length > 11) {
            delete state.history[state.mode][Object.keys(state.history[state.mode])[0]];
        }
    },
};

const actions = {
    setMode({ commit }, mode) {
        commit('setMode', mode);
    },
    reset({ commit }) {
        commit('setMoves', 0);
        commit('setScore', 0);
        commit('setHistory', {});
    },
    updateScore({ commit, state }, score) {
        commit('setScore', score);
        if (score > state.bestScores[state.mode]) {
            commit('setBestScores', score);
        }
    },
    updateMoves({ commit }, moves) {
        commit('setMoves', moves);
    },
    updateHistory({ commit, state, dispatch }, payload) {
        let history = historyTemplate;

        history.moves = state.moves[state.mode] + 1;
        history.score = payload.score;
        history.cells = payload.cells;

        commit('addHistory', history);
        commit('setMoves', history.moves);
        dispatch('updateScore', history.score);
    },
    undoHistory({ commit, state, dispatch }) {
        if (!Object.keys(state.history[state.mode]).length) {
            return;
        }

        // remmove last move / history
        let history = JSON.parse(JSON.stringify(state.history[state.mode]));

        delete history[state.moves[state.mode]];

        // now get last move / history
        let lastHistory = history[Object.keys(history)[Object.keys(history).length - 1]];

        if (!lastHistory) {
            return;
        }

        // update moves
        commit('setHistory', history);
        commit('setMoves', lastHistory.moves);
        dispatch('updateScore', lastHistory.score);
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};