<template>
    <div>

        <Head>
            <Title>Daily checklist - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>Daily checklist</template>
            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-5">
                    <NuxtLink class="flex max-w-fit items-center gap-x-2 text-gray-700 hover:text-gray-900"
                        to="/checklists">
                        <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                    </NuxtLink>

                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <template v-if="checklist">
                        <!-- Sheet header: date, branch, status, times -->
                        <section class="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
                            <div class="flex flex-wrap items-start justify-between gap-4">
                                <div class="min-w-0">
                                    <p class="text-xs font-semibold uppercase tracking-wider text-primary-700">
                                        Barista daily checklist
                                    </p>
                                    <h2 class="mt-1 text-xl font-bold text-gray-900">
                                        {{ formatLongDate(checklist.date) }}
                                        <span v-if="isToday"
                                            class="ml-1 align-middle rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700 ring-1 ring-primary-200">Today</span>
                                    </h2>
                                    <p class="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600">
                                        <Icon name="ph:storefront" class="size-4" />
                                        {{ checklist.branch?.name }}
                                    </p>
                                </div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <span :class="isVerified
                                        ? 'bg-green-50 text-green-800 ring-green-600/20'
                                        : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'"
                                        class="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset">
                                        <Icon :name="isVerified ? 'ph:seal-check' : 'ph:hourglass-medium'"
                                            class="size-4" />
                                        {{ isVerified ? 'Verified' : 'Pending' }}
                                    </span>
                                    <FormButton v-if="!isVerified" buttonStyle="success"
                                        @click="state.modal.isVerifyOpen = true">
                                        <Icon name="ph:seal-check" class="size-4" /> Verify checklist
                                    </FormButton>
                                    <FormButton v-else buttonStyle="secondary" @click="state.modal.isReopenOpen = true">
                                        <Icon name="ph:lock-open" class="size-4" /> Reopen
                                    </FormButton>
                                </div>
                            </div>

                            <div
                                class="mt-5 grid gap-4 border-t border-gray-100 pt-5 md:grid-cols-[1fr_1fr_auto_minmax(0,1.4fr)] md:items-end">
                                <div class="space-y-1">
                                    <FormLabel for="time_started" label="Time started" />
                                    <FormTimeField v-if="!isVerified" id="time_started" name="time_started"
                                        placeholder="--:--" v-model:value="state.times.time_started" />
                                    <p v-else class="h-11 leading-[2.75rem] text-sm font-medium text-gray-900">
                                        {{ formatTime(checklist.time_started) }}
                                    </p>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="time_finished" label="Time finished" />
                                    <FormTimeField v-if="!isVerified" id="time_finished" name="time_finished"
                                        placeholder="--:--" v-model:value="state.times.time_finished" />
                                    <p v-else class="h-11 leading-[2.75rem] text-sm font-medium text-gray-900">
                                        {{ formatTime(checklist.time_finished) }}
                                    </p>
                                </div>
                                <div>
                                    <FormButton v-if="!isVerified && timesChanged" buttonStyle="primary" class="h-11"
                                        @click="saveTimes">
                                        Save times
                                    </FormButton>
                                </div>
                                <div>
                                    <div class="flex items-center justify-between text-sm">
                                        <span class="font-medium text-gray-700">Overall</span>
                                        <span class="text-gray-600">{{ overall.done }} of {{ overall.total }} tasks
                                            done</span>
                                    </div>
                                    <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
                                        <div class="h-full rounded-full bg-green-600 transition-all duration-300"
                                            :style="{ width: `${overall.percent}%` }" />
                                    </div>
                                    <p class="mt-1.5 text-[11px] text-gray-500">
                                        Times fill in on their own with the first and last tick; you can change them.
                                    </p>
                                </div>
                            </div>

                            <p v-if="isVerified"
                                class="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                                <Icon name="ph:lock-simple" class="size-4" />
                                This checklist is verified and locked. Reopen it to make changes.
                            </p>
                        </section>

                        <div class="grid gap-5 xl:grid-cols-2">
                            <ModulesChecklistSection type="opener" :tasks="tasksFor('opener')"
                                :users="usersFor('opener')" :userOptions="state.userOptions" :locked="isVerified"
                                @toggle="toggleTask" @saveRemark="saveRemark"
                                @syncUsers="(uuids: string[]) => syncUsers('opener', uuids)" />
                            <ModulesChecklistSection type="closer" :tasks="tasksFor('closer')"
                                :users="usersFor('closer')" :userOptions="state.userOptions" :locked="isVerified"
                                @toggle="toggleTask" @saveRemark="saveRemark"
                                @syncUsers="(uuids: string[]) => syncUsers('closer', uuids)" />
                        </div>
                    </template>
                </div>
            </LoadingSpinner>

            <DialogConfirmation :isModalOpen="state.modal.isVerifyOpen" title="Verify checklist"
                :message="verifyMessage" @close="state.modal.isVerifyOpen = false" @confirm="setStatus('verified')" />
            <DialogConfirmation :isModalOpen="state.modal.isReopenOpen" title="Reopen checklist"
                message="Reopen this checklist so tasks, baristas and times can be changed again?"
                @close="state.modal.isReopenOpen = false" @confirm="setStatus('pending')" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { checklistService } from '@/components/api/user/ChecklistService'
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { successAlert, errorAlert } = useAlert()
const checklistUuid = route.params.checklist_uuid as string
const breadcrumbLinks = [
    { name: 'Daily checklist', href: '/checklists' },
    { name: 'Checklist', href: `/checklists/${checklistUuid}` },
]

const state = reactive({
    checklist: null as any,
    error: {} as Error,
    isPageLoading: false,
    userOptions: [] as any[],
    times: { time_started: '', time_finished: '' },
    modal: { isVerifyOpen: false, isReopenOpen: false },
})

const checklist = computed(() => state.checklist)
const isVerified = computed(() => state.checklist?.status === 'verified')
const isToday = computed(() => state.checklist?.date === moment().format('YYYY-MM-DD'))
const overall = computed(() => {
    const tasks = state.checklist?.tasks ?? []
    const done = tasks.filter((completion: any) => completion.is_done).length
    return { done, total: tasks.length, percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0 }
})
const timesChanged = computed(() =>
    state.times.time_started !== toTimeInput(state.checklist?.time_started) ||
    state.times.time_finished !== toTimeInput(state.checklist?.time_finished)
)
const verifyMessage = computed(() => {
    const remaining = overall.value.total - overall.value.done
    return remaining > 0
        ? `${remaining} task${remaining === 1 ? ' is' : 's are'} still not done. Every task has to be ticked before the checklist can be verified.`
        : 'All tasks are done. Verify and lock this checklist?'
})

onMounted(() => {
    fetchChecklist()
    fetchUsers()
})

async function fetchChecklist() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await checklistService.getChecklist(checklistUuid)
        if (response?.data) setChecklist(response.data)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchUsers() {
    try {
        const response = await userService.getUsers({
            page: 1,
            page_length: 500,
            sortField: 'firstname',
            sortOrder: 'ascend',
        })
        state.userOptions = (response?.data ?? [])
            .filter((user: any) => user.is_active)
            .map((user: any) => ({ label: `${user.firstname} ${user.lastname ?? ''}`.trim(), value: user.uuid }))
    } catch (error: any) {
        errorAlert('Could not load users', error?.message)
    }
}

function setChecklist(data: any) {
    state.checklist = data
    state.times = {
        time_started: toTimeInput(data.time_started),
        time_finished: toTimeInput(data.time_finished),
    }
}

function tasksFor(type: string) {
    return (state.checklist?.tasks ?? []).filter((completion: any) => completion.task?.type === type)
}

function usersFor(type: string) {
    return (state.checklist?.users ?? []).filter((checklistUser: any) => checklistUser.type === type)
}

// Every change returns the whole checklist, so the page always shows what the server saved.
async function run(request: () => Promise<any>, failureTitle: string) {
    try {
        const response = await request()
        if (response?.data) setChecklist(response.data)
        return true
    } catch (error: any) {
        errorAlert(failureTitle, error?.message)
        return false
    }
}

async function toggleTask(completion: any) {
    if (isVerified.value) return
    // Tick immediately; put it back if the save fails.
    const previous = completion.is_done
    completion.is_done = !previous
    const saved = await run(
        () => checklistService.updateTask(checklistUuid, completion.uuid, { is_done: !previous }),
        'Could not update task'
    )
    if (!saved) completion.is_done = previous
}

function saveRemark(completion: any, remarks: string) {
    run(() => checklistService.updateTask(checklistUuid, completion.uuid, { remarks }), 'Could not save remark')
}

// Each pick saves the whole list for that side. If several picks are in flight,
// only the newest response is applied, so a slower earlier one can't undo a later pick.
const latestSync: Record<string, number> = { opener: 0, closer: 0 }

async function syncUsers(type: string, userUuids: string[]) {
    const requestId = ++latestSync[type]
    try {
        const response = await checklistService.syncUsers(checklistUuid, { type, user_uuids: userUuids })
        if (requestId === latestSync[type] && response?.data) setChecklist(response.data)
    } catch (error: any) {
        errorAlert(type === 'opener' ? 'Could not update openers' : 'Could not update closers', error?.message)
        if (requestId === latestSync[type]) fetchChecklist()
    }
}

async function saveTimes() {
    const saved = await run(() => checklistService.updateChecklist(checklistUuid, {
        time_started: state.times.time_started || null,
        time_finished: state.times.time_finished || null,
    }), 'Could not save times')
    if (saved) successAlert('Saved', 'Checklist times updated.')
}

async function setStatus(status: string) {
    const saved = await run(
        () => checklistService.updateChecklist(checklistUuid, { status }),
        status === 'verified' ? 'Could not verify' : 'Could not reopen'
    )
    if (saved) successAlert('Success', status === 'verified' ? 'Checklist verified.' : 'Checklist reopened.')
}

function toTimeInput(value: string | null | undefined) {
    return value ? moment(value).format('HH:mm') : ''
}

function formatTime(value: string | null | undefined) {
    return value ? moment(value).format('h:mm A') : '-'
}

function formatLongDate(value: string) {
    return moment(value, 'YYYY-MM-DD').format('dddd, MMMM D, YYYY')
}
</script>
