<template>
    <div>

        <Head>
            <Title>Daily inventory - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Daily inventory</template>
            <div class="space-y-5">
                <!-- Open a day's sheet -->
                <section class="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 class="text-base font-semibold text-gray-900">
                                Open an inventory sheet
                            </h2>
                            <p class="mt-0.5 text-sm text-gray-600">
                                Each branch gets one sheet a day. Begin is filled in from the previous sheet's Ending.
                                Today's sheet is created automatically.
                            </p>
                        </div>
                        <FormButton buttonStyle="action" @click="navigateTo('/inventory-items')">
                            <Icon name="ph:list-bullets" class="size-4" /> Manage items
                        </FormButton>
                    </div>
                    <div class="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">Branch</p>
                            <FormSelect :options="state.branchOptions" :canClear="false"
                                v-model="state.openForm.branch_uuid" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="inventory-date" label="Date" />
                            <FormDateField id="inventory-date" name="inventory_date" placeholder="Date"
                                v-model="state.openForm.date" />
                        </div>
                        <FormButton buttonStyle="primary" class="h-11"
                            :disabled="!state.openForm.branch_uuid || !state.openForm.date || state.isOpening"
                            @click="openSheet">
                            <Icon name="ph:package" class="size-4" />
                            {{ state.openForm.date === today ? "Open today's sheet" : 'Open sheet' }}
                        </FormButton>
                    </div>
                </section>

                <!-- History -->
                <section class="rounded-md bg-white p-5">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="mb-5 flex items-center gap-x-1">
                        <span>Entries per page:</span>
                        <select id="pageLength" class="bg-transparent focus:outline-none"
                            :value="sheetStore.getCurrentPageLength" @change="changePageLength">
                            <option v-for="length in pageLengths" :key="length" :value="length">{{ length }}</option>
                        </select>
                    </div>
                    <div class="space-y-5">
                        <div class="grid gap-3 md:grid-cols-3 md:items-end">
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">Branch</p>
                                <FormSelect :options="[{ label: 'All branches', value: 'all' }, ...state.branchOptions]"
                                    :canClear="false" v-model="state.filters.branch" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="inventory-period" label="Dates" />
                                <FormDateRangeField id="inventory-period" name="inventory_period"
                                    placeholder="Select date range" v-model="state.filters.dateRange" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">Status</p>
                                <FormSelect :options="statusOptions" :canClear="false" :searchable="false"
                                    v-model="state.filters.status" />
                            </div>
                        </div>
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.sheets"
                                :isLoading="state.isTableLoading" :sortData="sheetStore.getSortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || state.sheets?.data?.length === 0)">
                                    <tr v-for="sheet in state.sheets.data" :key="sheet.uuid"
                                        class="cursor-pointer hover:bg-primary-50/50"
                                        @click="navigateTo(`/daily-inventories/${sheet.uuid}`)">
                                        <td>
                                            <p class="font-medium text-gray-900">{{ formatDate(sheet.date) }}</p>
                                            <span v-if="sheet.date === today"
                                                class="text-[11px] font-semibold text-primary-700">Today</span>
                                        </td>
                                        <td>
                                            <p>{{ sheet.branch?.name || '-' }}</p>
                                        </td>
                                        <td>
                                            <p class="text-sm text-gray-700">{{ counters(sheet) }}</p>
                                        </td>
                                        <td>
                                            <div class="flex items-center gap-2">
                                                <div class="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                                                    <div class="h-full rounded-full"
                                                        :class="isComplete(sheet) ? 'bg-green-600' : 'bg-primary-500'"
                                                        :style="{ width: `${percent(sheet)}%` }" />
                                                </div>
                                                <span class="text-xs font-medium text-gray-700 tabular-nums">
                                                    {{ sheet.progress?.counted ?? 0 }}/{{ sheet.progress?.total ?? 0 }}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span :class="sheet.status === 'verified'
                                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'"
                                                class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset">
                                                {{ sheet.status === 'verified' ? 'Verified' : 'Pending' }}
                                            </span>
                                        </td>
                                        <td>
                                            <Tooltip text="Open">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click.stop="navigateTo(`/daily-inventories/${sheet.uuid}`)">
                                                    <Icon name="ph:arrow-right" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.sheets" @previous="previous" @next="next" />
                    </div>
                </section>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { branchService } from '@/components/api/user/BranchService'
import { dailyInventoryService } from '@/components/api/user/DailyInventoryService'
import { useAlert } from '@/composables/alert'
import { useDailyInventoryStore } from '@/store/dailyInventory'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const sheetStore = useDailyInventoryStore() as any
const pageLengths = [10, 20, 30, 50, 100]
const { errorAlert } = useAlert()
const today = moment().format('YYYY-MM-DD')

const statusOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Verified', value: 'verified' },
]

const state = reactive({
    sheets: [] as any,
    branchOptions: [] as any[],
    columnHeaders: [
        { name: 'Date', sorter: true, key: 'date' },
        { name: 'Branch', sorter: true, key: 'branch_id' },
        { name: 'Counted by', sorter: false, key: 'users' },
        { name: 'Counted', sorter: false, key: 'progress' },
        { name: 'Status', sorter: true, key: 'status' },
        { name: '' },
    ],
    filters: {
        branch: 'all',
        dateRange: [] as string[],
        status: 'all',
    },
    openForm: {
        branch_uuid: sheetStore.getSelectedBranchUuid || '',
        date: today,
    },
    error: {} as Error,
    isTableLoading: false,
    isOpening: false,
})

onMounted(async () => {
    await fetchBranches()
    await generateTodaysSheets()
    fetchSheets()
})

watch(() => [state.filters.branch, state.filters.status], () => {
    sheetStore.setCurrentPageNumber(1)
    fetchSheets()
})

watch(() => state.filters.dateRange, (range: string[]) => {
    if (range.length === 0 || range.length === 2) {
        sheetStore.setCurrentPageNumber(1)
        fetchSheets()
    }
})

watch(() => state.openForm.branch_uuid, (branchUuid: string) => {
    if (branchUuid) sheetStore.setSelectedBranchUuid(branchUuid)
})

async function fetchBranches() {
    try {
        const response = await branchService.getBranches({ page: 1, page_length: 500, sortField: 'name', sortOrder: 'ascend' })
        state.branchOptions = (response?.data ?? [])
            .filter((branch: any) => branch.is_active)
            .map((branch: any) => ({ label: branch.name, value: branch.uuid }))
        const remembered = state.branchOptions.some((option: any) => option.value === state.openForm.branch_uuid)
        if (!remembered && state.branchOptions.length > 0) {
            state.openForm.branch_uuid = state.branchOptions[0].value
        }
    } catch (error: any) {
        state.error = error
    }
}

// Makes sure every active branch has today's sheet even if the nightly job didn't run.
async function generateTodaysSheets() {
    await Promise.allSettled(state.branchOptions.map((option: any) =>
        dailyInventoryService.generateDailyInventory({ branch_uuid: option.value, date: today })
    ))
}

async function fetchSheets() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await dailyInventoryService.getDailyInventories({
            page: sheetStore.getCurrentPageNumber,
            page_length: sheetStore.getCurrentPageLength,
            sortField: sheetStore.getSortData.sortField,
            sortOrder: sheetStore.getSortData.sortOrder,
            branch: state.filters.branch === 'all' ? undefined : state.filters.branch,
            status: state.filters.status === 'all' ? undefined : state.filters.status,
            date_from: state.filters.dateRange[0] || undefined,
            date_to: state.filters.dateRange[1] || undefined,
        })
        if (response) state.sheets = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function openSheet() {
    state.isOpening = true
    try {
        const response = await dailyInventoryService.generateDailyInventory({
            branch_uuid: state.openForm.branch_uuid,
            date: state.openForm.date,
        })
        if (response?.data?.uuid) navigateTo(`/daily-inventories/${response.data.uuid}`)
    } catch (error: any) {
        errorAlert('Could not open the sheet', error?.message)
    } finally {
        state.isOpening = false
    }
}

function counters(sheet: any) {
    const names = (sheet.users ?? []).map((sheetUser: any) => sheetUser.user?.firstname).filter(Boolean)
    return names.length ? names.join(', ') : 'No one yet'
}

function percent(sheet: any) {
    const total = sheet.progress?.total ?? 0
    return total ? Math.round(((sheet.progress?.counted ?? 0) / total) * 100) : 0
}

function isComplete(sheet: any) {
    return (sheet.progress?.total ?? 0) > 0 && sheet.progress.counted === sheet.progress.total
}

function formatDate(value: string) {
    return moment(value, 'YYYY-MM-DD').format('ddd, MMM D, YYYY')
}

function previous() {
    sheetStore.setCurrentPageNumber(sheetStore.getCurrentPageNumber - 1)
    fetchSheets()
}

function next() {
    sheetStore.setCurrentPageNumber(sheetStore.getCurrentPageNumber + 1)
    fetchSheets()
}

function sort(sortingData: any) {
    sheetStore.setCurrentPageNumber(1)
    sheetStore.setSortData(sortingData.column, sortingData.sort)
    fetchSheets()
}

function changePageLength(event: any) {
    sheetStore.setCurrentPageNumber(1)
    sheetStore.setCurrentPageLength(event.target.value)
    fetchSheets()
}
</script>
