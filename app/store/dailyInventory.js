import { defineStore } from 'pinia'

export const useDailyInventoryStore = defineStore('dailyInventoryStore', {
    persist: true,
    state: () => ({
        currentPageLength: 10,
        currentPageNumber: 1,
        // Remembered so the till keeps opening its own branch's sheet.
        selectedBranchUuid: '',
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
        setSelectedBranchUuid(branchUuid) {
            this.selectedBranchUuid = branchUuid
        },
        setSortData(sortField, sortOrder) {
            this.sortData.sortField = sortField
            this.sortData.sortOrder = sortOrder
        },
    },
    getters: {
        getCurrentPageLength: (state) => state.currentPageLength,
        getCurrentPageNumber: (state) => state.currentPageNumber,
        getSelectedBranchUuid: (state) => state.selectedBranchUuid,
        getSortData: (state) => state.sortData,
    },
})
