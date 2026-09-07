import { defineStore } from 'pinia'

export const usePosStore = defineStore('posStore', {
    persist: true,
    state: () => ({
        cart: [],
    }),
    actions: {
        clearCart() {
            this.cart = []
        },
    },
    getters: {
        getCart: state => state.cart,
    },
})
