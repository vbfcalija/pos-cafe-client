<template>
    <div>

        <Head>
            <Title>Daily checklist - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Daily checklist</template>
            <div class="space-y-5">
                <!-- Open a day's checklist -->
                <section class="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 class="text-base font-semibold text-gray-900">Open a checklist</h2>
                            <p class="mt-0.5 text-sm text-gray-600">
                                Each branch gets one checklist a day, with its opening and closing tasks. Today's is
                                created automatically.
                            </p>
                        </div>
                        <FormButton buttonStyle="action" @click="navigateTo('/checklist-tasks')">
                            <Icon name="ph:list-checks" class="size-4" /> Manage tasks
                        </FormButton>
                    </div>
                    <div class="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">Branch</p>
                            <FormSelect :options="state.branchOptions" :canClear="false"
                                v-model="state.openForm.branch_uuid" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="checklist-date" label="Date" />
                            <FormDateField id="checklist-date" name="checklist_date" placeholder="Date"
                                v-model="state.openForm.date" />
                        </div>
                        <FormButton buttonStyle="primary" class="h-11"
                            :disabled="!state.openForm.branch_uuid || !state.openForm.date || state.isOpening"
                            @click="openChecklist">
                            <Icon name="ph:clipboard-text" class="size-4" />
                            {{ state.openForm.date === today ? "Open today's checklist" : 'Open checklist' }}
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
                            :value="checklistStore.getCurrentPageLength" @change="changePageLength">
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
                                <FormLabel for="checklist-period" label="Dates" />
                                <FormDateRangeField id="checklist-period" name="checklist_period"
                                    placeholder="Select date range" v-model="state.filters.dateRange" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">Status</p>
                                <FormSelect :options="statusOptions" :canClear="false" :searchable="false"
                                    v-model="state.filters.status" />
                            </div>
                        </div>
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.checklists"
                                :isLoading="state.isTableLoading" :sortData="checklistStore.getSortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || state.checklists?.data?.length === 0)">
                                    <tr v-for="checklist in state.checklists.data" :key="checklist.uuid"
                                        class="cursor-pointer hover:bg-primary-50/50"
                                        @click="navigateTo(`/checklists/${checklist.uuid}`)">
                                        <td>
                                            <p class="font-medium text-gray-900">{{ formatDate(checklist.date) }}</p>
                                            <span v-if="checklist.date === today"
                                                class="text-[11px] font-semibold text-primary-700">Today</span>
                                        </td>
                                        <td>
                                            <p>{{ checklist.branch?.name || '-' }}</p>
                                        </td>
                                        <td>
                                            <p class="mb-1 text-xs text-gray-600">{{ names(checklist, 'opener') }}</p>
                                            <ProgressCell :progress="checklist.progress?.opener" />
                                        </td>
                                        <td>
                                            <p class="mb-1 text-xs text-gray-600">{{ names(checklist, 'closer') }}</p>
                                            <ProgressCell :progress="checklist.progress?.closer" />
                                        </td>
                                        <td>
                                            <span :class="checklist.status === 'verified'
                                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'"
                                                class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset">
                                                {{ checklist.status === 'verified' ? 'Verified' : 'Pending' }}
                                            </span>
                                        </td>
                                        <td>
                                            <Tooltip text="Open">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click.stop="navigateTo(`/checklists/${checklist.uuid}`)">
                                                    <Icon name="ph:arrow-right" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.checklists" @previous="previous" @next="next" />
                    </div>
                </section>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { branchService } from '@/components/api/user/BranchService'
import { checklistService } from '@/components/api/user/ChecklistService'
import { useAlert } from '@/composables/alert'
import { useChecklistStore } from '@/store/checklist'
import type { Error } from '@/types'

// Small "done / total" bar used in the Opening and Closing columns.
const ProgressCell = defineComponent({
    props: { progress: { type: Object, required: false } },
    setup(props) {
        return () => {
            const done = props.progress?.done ?? 0
            const total = props.progress?.total ?? 0
            const percent = total ? Math.round((done / total) * 100) : 0
            return h('div', { class: 'flex items-center gap-2' }, [
                h('div', { class: 'h-1.5 w-20 overflow-hidden rounded-full bg-gray-100' }, [
                    h('div', {
                        class: ['h-full rounded-full', done === total && total > 0 ? 'bg-green-600' : 'bg-primary-500'],
                        style: { width: `${percent}%` },
                    }),
                ]),
                h('span', { class: 'text-xs font-medium text-gray-700' }, `${done}/${total}`),
            ])
        }
    },
})

const runtimeConfig = useRuntimeConfig()
const checklistStore = useChecklistStore() as any
const pageLengths = [10, 20, 30, 40, 50, 100]
const { errorAlert } = useAlert()
const today = moment().format('YYYY-MM-DD')

const statusOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Verified', value: 'verified' },
]

const state = reactive({
    checklists: [] as any,
    branchOptions: [] as any[],
    columnHeaders: [
        { name: 'Date', sorter: true, key: 'date' },
        { name: 'Branch', sorter: true, key: 'branch_id' },
        { name: 'Opening', sorter: false, key: 'opening' },
        { name: 'Closing', sorter: false, key: 'closing' },
        { name: 'Status', sorter: true, key: 'status' },
        { name: '' },
    ],
    filters: {
        branch: 'all',
        dateRange: [] as string[],
        status: 'all',
    },
    openForm: {
        branch_uuid: checklistStore.getSelectedBranchUuid || '',
        date: today,
    },
    error: {} as Error,
    isTableLoading: false,
    isOpening: false,
})

onMounted(async () => {
    await fetchBranches()
    await generateTodaysChecklists()
    fetchChecklists()
})

watch(() => [state.filters.branch, state.filters.status], () => {
    checklistStore.setCurrentPageNumber(1)
    fetchChecklists()
})

watch(() => state.filters.dateRange, (range: string[]) => {
    // A range is complete once both ends are picked (or it has been cleared).
    if (range.length === 0 || range.length === 2) {
        checklistStore.setCurrentPageNumber(1)
        fetchChecklists()
    }
})

watch(() => state.openForm.branch_uuid, (branchUuid: string) => {
    if (branchUuid) checklistStore.setSelectedBranchUuid(branchUuid)
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

// Makes sure every active branch has today's checklist even if the nightly job didn't run.
async function generateTodaysChecklists() {
    await Promise.allSettled(state.branchOptions.map((option: any) =>
        checklistService.generateChecklist({ branch_uuid: option.value, date: today })
    ))
}

async function fetchChecklists() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: checklistStore.getCurrentPageNumber,
            page_length: checklistStore.getCurrentPageLength,
            sortField: checklistStore.getSortData.sortField,
            sortOrder: checklistStore.getSortData.sortOrder,
            branch: state.filters.branch === 'all' ? undefined : state.filters.branch,
            status: state.filters.status === 'all' ? undefined : state.filters.status,
            date_from: state.filters.dateRange[0] || undefined,
            date_to: state.filters.dateRange[1] || undefined,
        }
        const response = await checklistService.getChecklists(params)
        if (response) state.checklists = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function openChecklist() {
    state.isOpening = true
    try {
        const response = await checklistService.generateChecklist({
            branch_uuid: state.openForm.branch_uuid,
            date: state.openForm.date,
        })
        if (response?.data?.uuid) navigateTo(`/checklists/${response.data.uuid}`)
    } catch (error: any) {
        errorAlert('Could not open checklist', error?.message)
    } finally {
        state.isOpening = false
    }
}

function names(checklist: any, type: string) {
    const people = (checklist.users ?? [])
        .filter((checklistUser: any) => checklistUser.type === type)
        .map((checklistUser: any) => checklistUser.user?.firstname)
        .filter(Boolean)
    return people.length ? people.join(', ') : 'No one assigned'
}

function formatDate(value: string) {
    return moment(value, 'YYYY-MM-DD').format('ddd, MMM D, YYYY')
}

function previous() {
    checklistStore.setCurrentPageNumber(checklistStore.getCurrentPageNumber - 1)
    fetchChecklists()
}

function next() {
    checklistStore.setCurrentPageNumber(checklistStore.getCurrentPageNumber + 1)
    fetchChecklists()
}

function sort(sortingData: any) {
    checklistStore.setCurrentPageNumber(1)
    checklistStore.setSortData(sortingData.column, sortingData.sort)
    fetchChecklists()
}

function changePageLength(event: any) {
    checklistStore.setCurrentPageNumber(1)
    checklistStore.setCurrentPageLength(event.target.value)
    fetchChecklists()
}
</script>
