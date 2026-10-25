<template>
    <div>

        <Head>
            <Title>Checklist tasks - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Checklist tasks</template>
            <div class="bg-white rounded-md p-5">
                <div>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                        <div class="flex items-center gap-x-1">
                            <span>Entries per page:</span>
                            <select id="pageLength" class="bg-transparent focus:outline-none"
                                :value="taskStore.getCurrentPageLength" @change="changePageLength">
                                <option v-for="length in pageLengths" :key="length" :value="length">{{ length }}
                                </option>
                            </select>
                        </div>
                        <div class="flex flex-wrap items-center gap-3">
                            <FormButton buttonStyle="action" @click="navigateTo('/checklist-tasks/new')">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                New task
                            </FormButton>
                        </div>
                    </div>
                    <div class="space-y-5">
                        <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
                            <TableSearch @search="handleSearch" />
                            <div class="grid gap-1">
                                <p class="text-sm text-gray-600">Checklist</p>
                                <FormSelect :options="typeOptions" :searchable="false" :canClear="false"
                                    v-model="state.typeFilter" />
                            </div>
                        </div>
                        <p class="text-xs text-gray-500">
                            Tasks appear on each day's checklist in the order they were created. New tasks are added to
                            any checklist that hasn't been verified yet.
                        </p>
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.tasks"
                                :isLoading="state.isTableLoading" :sortData="taskStore.getSortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.tasks?.data?.length === 0))">
                                    <tr v-for="task in state.tasks?.data" :key="task.uuid">
                                        <td width="40%">
                                            <p class="font-medium text-gray-900">{{ task.name }}</p>
                                        </td>
                                        <td width="14%">
                                            <span :class="task.type === 'opener'
                                                ? 'bg-amber-50 text-amber-800 ring-amber-600/20'
                                                : 'bg-indigo-50 text-indigo-800 ring-indigo-600/20'"
                                                class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset">
                                                <Icon
                                                    :name="task.type === 'opener' ? 'ph:sun-horizon' : 'ph:moon-stars'"
                                                    class="size-3.5" />
                                                {{ task.type === 'opener' ? 'Opening' : 'Closing' }}
                                            </span>
                                        </td>
                                        <td width="34%">
                                            <p class="text-gray-600">{{ task.description || '-' }}</p>
                                        </td>
                                        <td width="12%">
                                            <div class="flex items-end gap-2">
                                                <Tooltip text="Edit">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="navigateTo(`/checklist-tasks/${task.uuid}/edit`)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip text="Delete">
                                                    <FormButton type="button" buttonStyle="danger"
                                                        @click="deleteTaskConfirmation(task)">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.tasks" @previous="previous" @next="next" />
                    </div>
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteTaskOpen"
                message="Delete this task? A task that already appears on a past checklist can't be deleted, so that record stays complete."
                @close="state.modal.isDeleteTaskOpen = false" @confirm="deleteTask" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { taskService } from '@/components/api/user/TaskService'
import { useAlert } from '@/composables/alert'
import { useTaskStore } from '@/store/task'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const taskStore = useTaskStore() as any
const pageLengths = [10, 20, 30, 40, 50, 100, 500]
const { successAlert } = useAlert()

const typeOptions = [
    { label: 'All', value: 'all' },
    { label: 'Opening', value: 'opener' },
    { label: 'Closing', value: 'closer' },
]

const state = reactive({
    tasks: [] as any,
    columnHeaders: [
        { name: 'Task', sorter: true, key: 'name' },
        { name: 'Checklist', sorter: true, key: 'type' },
        { name: 'Description', sorter: false, key: 'description' },
        { name: '' },
    ],
    dataFilter: { search: [] as string[] },
    typeFilter: 'all',
    error: {} as Error,
    isTableLoading: false,
    modal: { isDeleteTaskOpen: false },
    selectedTask: {} as any,
})

onMounted(() => {
    fetchTasks()
})

watch(() => state.typeFilter, () => {
    taskStore.setCurrentPageNumber(1)
    fetchTasks()
})

async function fetchTasks() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: taskStore.getCurrentPageNumber,
            page_length: taskStore.getCurrentPageLength,
            sortField: taskStore.getSortData.sortField,
            sortOrder: taskStore.getSortData.sortOrder,
            type: state.typeFilter === 'all' ? undefined : state.typeFilter,
            ...state.dataFilter
        }
        const response = await taskService.getTasks(params)
        if (response) state.tasks = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    taskStore.setCurrentPageNumber(taskStore.getCurrentPageNumber - 1)
    fetchTasks()
}

function next() {
    taskStore.setCurrentPageNumber(taskStore.getCurrentPageNumber + 1)
    fetchTasks()
}

function sort(sortingData: any) {
    taskStore.setCurrentPageNumber(1)
    taskStore.setSortData(sortingData.column, sortingData.sort)
    fetchTasks()
}

function handleSearch(value: any) {
    taskStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchTasks()
}

function changePageLength(event: any) {
    taskStore.setCurrentPageNumber(1)
    taskStore.setCurrentPageLength(event.target.value)
    fetchTasks()
}

function deleteTaskConfirmation(task: any) {
    state.selectedTask = task
    state.modal.isDeleteTaskOpen = true
}

async function deleteTask() {
    state.modal.isDeleteTaskOpen = false
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await taskService.deleteTask(state.selectedTask.uuid)
        if (response?.message) {
            successAlert('Success!', 'Checklist task successfully deleted.')
            fetchTasks()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
