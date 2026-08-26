import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', {
    persist: true,
    state: () => ({
        currentPageLength: 10,
        currentPageNumber: 1,
        selectedUser: {},
        sortData: {
            sortField: 'firstname',
            sortOrder: 'ascend',
        },
        user: {},
    }),
    actions: {
        setCurrentPageLength(pageLength) {
            this.currentPageLength = pageLength
        },
        setCurrentPageNumber(pageNumber) {
            this.currentPageNumber = pageNumber
        },
        setSelectedUser(user) {
            this.selectedUser = user
        },
        setSortData(sortField, sortOrder) {
            this.sortData.sortField = sortField
            this.sortData.sortOrder = sortOrder
        },
        setUser(user) {
            this.user = user
        },
        resetUser() {
            this.user = {}
        },
    },
    getters: {
        getCurrentPageLength: (state) => state.currentPageLength,
        getCurrentPageNumber: (state) => state.currentPageNumber,
        getSelectedUser: (state) => state.selectedUser,
        getSortData: (state) => state.sortData,
        getUser: (state) => state.user,
    },
})
