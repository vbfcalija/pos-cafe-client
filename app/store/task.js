import { defineStore } from 'pinia'

export const useTaskStore = defineStore('taskStore', {
    persist: true,
    state: () => ({
        currentPageLength: 50,
        currentPageNumber: 1,
        selectedTask: {},
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
        setSelectedTask(task) {
            this.selectedTask = task
        },
        setSortData(sortField, sortOrder) {
            this.sortData.sortField = sortField
            this.sortData.sortOrder = sortOrder
        },
    },
    getters: {
        getCurrentPageLength: (state) => state.currentPageLength,
        getCurrentPageNumber: (state) => state.currentPageNumber,
        getSelectedTask: (state) => state.selectedTask,
        getSortData: (state) => state.sortData,
    },
})
