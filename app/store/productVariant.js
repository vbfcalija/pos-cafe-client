import { defineStore } from 'pinia'

export const useProductVariantStore = defineStore('productVariantStore', {
    persist: true,
    state: () => ({
        currentPageLength: 10,
        currentPageNumber: 1,
        selectedProductVariant: {},
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
        setSelectedProductVariant(productVariant) {
            this.selectedProductVariant = productVariant
        },
        setSortData(sortField, sortOrder) {
            this.sortData.sortField = sortField
            this.sortData.sortOrder = sortOrder
        },
    },
    getters: {
        getCurrentPageLength: (state) => state.currentPageLength,
        getCurrentPageNumber: (state) => state.currentPageNumber,
        getSelectedProductVariant: (state) => state.selectedProductVariant,
        getSortData: (state) => state.sortData,
    },
})
