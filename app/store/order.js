import { defineStore } from 'pinia'

export const useOrderStore = defineStore('orderStore', {
    persist: true,
    state: () => ({
        currentPageLength: 10,
        currentPageNumber: 1,
        sortData: {
            sortField: 'date',
            sortOrder: 'descend'
        }
    }),
    actions: {
        setCurrentPageLength(value) {
            this.currentPageLength = value
        },
        setCurrentPageNumber(value) {
            this.currentPageNumber = value
        },
        setSortData(sortField, sortOrder) {
            this.sortData.sortField = sortField
            this.sortData.sortOrder = sortOrder
        },
    },
    getters: {
        getCurrentPageLength: state => state.currentPageLength,
        getCurrentPageNumber: state => state.currentPageNumber,
        getSortData: state => state.sortData,
    },
})
