<template>
    <div>

        <Head>
            <Title>Shifts - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Shifts</template>
            <div class="bg-white rounded-md p-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                    <div class="flex items-center gap-x-1">
                        <span>Entriers per page:</span>
                        <select id="pageLength" class="bg-transparent focus:outline-none"
                            :value="shiftStore.getCurrentPageLength" @change="changePageLength">
                            <option v-for="length in pageLengths" :key="length" :value="length">{{ length }}</option>
                        </select>
                    </div>
                    <FormButton buttonStyle="action" @click="navigateTo('/shifts/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" /> New shift
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.shifts"
                            :isLoading="state.isTableLoading" :sortData="shiftStore.getSortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.shifts?.data?.length === 0))">
                                <tr v-for="(shift, index) in state.shifts?.data" :key="index">
                                    <td width="20%">
                                        <p>{{ shift?.date }}</p>
                                    </td>
                                    <td width="25%">
                                        <p>{{ shift?.name }}</p>
                                    </td>
                                    <td width="20%">
                                        <p>{{ Number(shift?.starting_cash).toFixed(2) }}</p>
                                    </td>
                                    <td width="20%">
                                        <p>{{ shift?.user?.firstname }} {{ shift?.user?.lastname }}</p>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <Tooltip text="Edit">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="navigateTo(`/shifts/${shift.uuid}/edit`)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip text="Delete">
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="deleteShiftConfirmation(shift)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.shifts" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteShiftOpen"
                message="Are you sure you want to delete this shift?" @close="state.modal.isDeleteShiftOpen = false"
                @confirm="deleteShift" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { shiftService } from '@/components/api/user/ShiftService'
import { useAlert } from '@/composables/alert'
import { useShiftStore } from '@/store/shift'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const shiftStore = useShiftStore() as any
const pageLengths = [10, 20, 30, 40, 50, 100, 500]
const { successAlert } = useAlert()

const state = reactive({
    shifts: [] as any,
    columnHeaders: [
        { name: 'Date', sorter: true, key: 'date' },
        { name: 'Name', sorter: true, key: 'name' },
        { name: 'Starting cash', sorter: true, key: 'starting_cash' },
        { name: 'User', sorter: true, key: 'user_id' },
        { name: '' },
    ],
    dataFilter: {
        search: [] as string[]
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteShiftOpen: false
    },
    selectedShift: {} as any,
})

onMounted(() => {
    fetchShifts()
})

async function fetchShifts() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: shiftStore.getCurrentPageNumber,
            page_length: shiftStore.getCurrentPageLength,
            sortField: shiftStore.getSortData.sortField,
            sortOrder: shiftStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await shiftService.getShifts(params)
        if (response) {
            state.shifts = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = shiftStore.getCurrentPageNumber - 1
    shiftStore.setCurrentPageNumber(currentTablePage)
    fetchShifts()
}

function next() {
    const currentTablePage = shiftStore.getCurrentPageNumber + 1
    shiftStore.setCurrentPageNumber(currentTablePage)
    fetchShifts()
}

function sort(sortingData: any) {
    shiftStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    shiftStore.setSortData(sortField, sortOrder)
    fetchShifts()
}

function handleSearch(value: any) {
    shiftStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchShifts()
}

function changePageLength(event: any) {
    shiftStore.setCurrentPageNumber(1)
    shiftStore.setCurrentPageLength(event.target.value)
    fetchShifts()
}

function deleteShiftConfirmation(shift: any) {
    state.selectedShift = shift
    state.modal.isDeleteShiftOpen = true
}

async function deleteShift() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await shiftService.deleteShift(state.selectedShift.uuid)
        if (response?.message) {
            successAlert('Success!', 'Shift successfully deleted.')
            fetchShifts()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
