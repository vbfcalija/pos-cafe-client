import { defineStore } from 'pinia'

export const useBranchStore = defineStore('branchStore', {
    persist: true,
    state: () => ({
        currentPageLength: 10,
        currentPageNumber: 1,
        selectedBranch: {},
        sortData: {
            sortField: 'name',
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
        setSelectedBranch(branch) {
            this.selectedBranch = branch
        },
        setSortData(sortField, sortOrder) {
            this.sortData.sortField = sortField
            this.sortData.sortOrder = sortOrder
        },
    },
    getters: {
        getCurrentPageLength: (state) => state.currentPageLength,
        getCurrentPageNumber: (state) => state.currentPageNumber,
        getSelectedBranch: (state) => state.selectedBranch,
        getSortData: (state) => state.sortData,
        getBranch: (state) => state.branch,
    },
})
