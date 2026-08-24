import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', {
    persist: true,
    state: () => ({
        user: {},
    }),
    actions: {
        setUser(user) {
            this.user = user
        },
        resetUser() {
            this.user = {}
        },
    },
    getters: {
        getUser: (state) => state.user,
    },
})
