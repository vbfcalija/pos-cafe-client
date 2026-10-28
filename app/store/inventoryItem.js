import { defineStore } from 'pinia'

export const useInventoryItemStore = defineStore('inventoryItemStore', {
    persist: true,
    state: () => ({
        currentPageLength: 50,
        currentPageNumber: 1,
        sortData: {
            sortField: 'id',
            sortOrder: 'ascend',
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
