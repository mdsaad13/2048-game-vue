const localStorageKey = 'appTheme';
var matchMediaListner = null;

const getTheme = function () {
    if (localStorage.getItem(localStorageKey) && ['dark', 'light', 'system-default'].includes(localStorage.getItem(localStorageKey))) {
        return localStorage.getItem(localStorageKey);
    }

    // set theme to system default
    localStorage.setItem(localStorageKey, 'system-default');
    return 'system-default';
}

const changeTheme = function (commit) {
    const payload = getTheme();
    let themeName = payload;

    if (payload == 'system-default') {
        themeName = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // set attribute for html tag
    document.body.parentNode.setAttribute('theme', themeName);
    commit('theme', payload);
    commit('themeExact', themeName);
};

const state = {
    theme: getTheme(),
    themeExact: 'light',
};

const getters = {
    theme: state => state.theme,
    themeExact: state => state.themeExact,
};

const mutations = {
    theme: (state, payload) => (state.theme = payload),
    themeExact: (state, payload) => (state.themeExact = payload),
};

const actions = {
    setTheme({ commit }, payload) {
        if (!payload) {
            payload = getTheme();
        }
        localStorage.setItem(localStorageKey, payload);
        changeTheme(commit);
        if (payload == 'system-default') {
            matchMediaListner = window.matchMedia(
                "(prefers-color-scheme: dark)"
            );
            try {
                // Chrome & Firefox
                matchMediaListner.addEventListener("change", () => changeTheme(commit));
            } catch (e1) {
                try {
                    // Safari
                    matchMediaListner.addListener(() => changeTheme(commit));
                } catch {
                    // error
                }
            }
        } else {
            if (matchMediaListner) {
                matchMediaListner.removeEventListener("change", () => changeTheme(commit));
                matchMediaListner.removeListener(() => changeTheme(commit));
            }
        }
    },
};

export default {
    state,
    getters,
    mutations,
    actions
};