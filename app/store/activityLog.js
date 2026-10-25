import { defineStore } from 'pinia'

export const useActivityLogStore = defineStore('activityLogStore', {
    persist: true,
    state: () => ({
        currentPageLength: 20,
        currentPageNumber: 1,
        sortData: {
            sortField: 'created_at',
            sortOrder: 'descend',
        },
    }),
    actions: {
        setCurrentPageLength(pageLength) {
            this.currentPageLength = pageLength
        },
        setCurrentPageNumber(pageNumber) {
            this.currentPageNumber = pageNumber
        },
        setSortData(sortField, sortOrder) {
            this.sortData.sortField = sortField
            this.sortData.sortOrder = sortOrder
        },
    },
    getters: {
        getCurrentPageLength: (state) => state.currentPageLength,
        getCurrentPageNumber: (state) => state.currentPageNumber,
        getSortData: (state) => state.sortData,
    },
})
