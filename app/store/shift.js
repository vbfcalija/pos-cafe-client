import { defineStore } from 'pinia'

export const useShiftStore = defineStore('shiftStore', {
    persist: true,
    state: () => ({
        currentPageLength: 10,
        currentPageNumber: 1,
        selectedShift: {},
        sortData: {
            sortField: 'date',
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
        setSelectedShift(shift) {
            this.selectedShift = shift
        },
        setSortData(sortField, sortOrder) {
            this.sortData.sortField = sortField
            this.sortData.sortOrder = sortOrder
        },
    },
    getters: {
        getCurrentPageLength: (state) => state.currentPageLength,
        getCurrentPageNumber: (state) => state.currentPageNumber,
        getSelectedShift: (state) => state.selectedShift,
        getSortData: (state) => state.sortData,
    },
})
