import { defineStore } from 'pinia'

export const useDiscountStore = defineStore('discountStore', {
    persist: true,
    state: () => ({
        currentPageLength: 10,
        currentPageNumber: 1,
        selectedDiscount: {},
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
        setSelectedDiscount(discount) {
            this.selectedDiscount = discount
        },
        setSortData(sortField, sortOrder) {
            this.sortData.sortField = sortField
            this.sortData.sortOrder = sortOrder
        },
    },
    getters: {
        getCurrentPageLength: (state) => state.currentPageLength,
        getCurrentPageNumber: (state) => state.currentPageNumber,
        getSelectedDiscount: (state) => state.selectedDiscount,
        getSortData: (state) => state.sortData,
    },
})
