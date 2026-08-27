import { defineStore } from 'pinia'

export const useCustomerStore = defineStore('customerStore', {
    persist: true,
    state: () => ({
        currentPageLength: 10,
        currentPageNumber: 1,
        selectedCustomer: {},
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
        setSelectedCustomer(customer) {
            this.selectedCustomer = customer
        },
        setSortData(sortField, sortOrder) {
            this.sortData.sortField = sortField
            this.sortData.sortOrder = sortOrder
        },
    },
    getters: {
        getCurrentPageLength: (state) => state.currentPageLength,
        getCurrentPageNumber: (state) => state.currentPageNumber,
        getSelectedCustomer: (state) => state.selectedCustomer,
        getSortData: (state) => state.sortData,
    },
})
