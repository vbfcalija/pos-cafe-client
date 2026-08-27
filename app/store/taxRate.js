import { defineStore } from 'pinia'

export const useTaxRateStore = defineStore('taxRateStore', {
    persist: true,
    state: () => ({
        currentPageLength: 10,
        currentPageNumber: 1,
        selectedTaxRate: {},
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
        setSelectedTaxRate(taxRate) {
            this.selectedTaxRate = taxRate
        },
        setSortData(sortField, sortOrder) {
            this.sortData.sortField = sortField
            this.sortData.sortOrder = sortOrder
        },
    },
    getters: {
        getCurrentPageLength: (state) => state.currentPageLength,
        getCurrentPageNumber: (state) => state.currentPageNumber,
        getSelectedTaxRate: (state) => state.selectedTaxRate,
        getSortData: (state) => state.sortData,
    },
})
