<template>
    <div>

        <Head>
            <Title>Activity log - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Activity log</template>
            <div class="space-y-5">
                <!-- Selected user's summary -->
                <section v-if="selectedUser"
                    class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
                    <div class="flex min-w-0 items-center gap-3">
                        <img :src="`https://ui-avatars.com/api/?background=6e4430&color=fff&name=${encodeURIComponent(fullName(selectedUser))}`"
                            class="size-12 rounded-full object-cover" alt="" />
                        <div class="min-w-0">
                            <p class="truncate text-base font-semibold text-gray-900">{{ fullName(selectedUser) }}</p>
                            <p class="truncate text-sm text-gray-500">{{ selectedUser.email }}</p>
                        </div>
                    </div>
                    <div class="text-sm">
                        <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">Last sign-in</p>
                        <p v-if="state.lastLogin" class="mt-0.5 text-gray-900">
                            {{ formatDateTime(state.lastLogin.created_at) }}
                            <span class="text-gray-500">· {{ deviceSummary(state.lastLogin) }} · {{
                                state.lastLogin.ip_address || 'IP unknown' }}</span>
                        </p>
                        <p v-else class="mt-0.5 text-gray-500">No sign-in recorded yet</p>
                    </div>
                    <FormButton buttonStyle="cancel" @click="state.filters.user = 'all'">
                        <Icon name="ph:x" class="size-4" /> Show everyone
                    </FormButton>
                </section>

                <section class="rounded-md bg-white p-5">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="mb-5 flex items-center gap-x-1">
                        <span>Entries per page:</span>
                        <select id="pageLength" class="bg-transparent focus:outline-none"
                            :value="activityLogStore.getCurrentPageLength" @change="changePageLength">
                            <option v-for="length in pageLengths" :key="length" :value="length">{{ length }}</option>
                        </select>
                    </div>
                    <div class="space-y-5">
                        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_1fr_1fr_1fr] xl:items-end">
                            <TableSearch @search="handleSearch" />
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">User</p>
                                <FormSelect :options="[{ label: 'Everyone', value: 'all' }, ...state.userOptions]"
                                    :canClear="false" v-model="state.filters.user" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">Activity</p>
                                <FormSelect :options="eventOptions" :canClear="false" v-model="state.filters.event" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="activity-period" label="Dates" />
                                <FormDateRangeField id="activity-period" name="activity_period"
                                    placeholder="Select date range" v-model="state.filters.dateRange" />
                            </div>
                        </div>
                        <p class="text-xs text-gray-500">Search matches the description, IP address or device ID.</p>
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.logs"
                                :isLoading="state.isTableLoading" :sortData="activityLogStore.getSortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || state.logs?.data?.length === 0)">
                                    <tr v-for="log in state.logs.data" :key="log.uuid"
                                        class="cursor-pointer hover:bg-primary-50/50" @click="openLog(log)">
                                        <td class="whitespace-nowrap">
                                            <p class="font-medium text-gray-900">{{ formatDate(log.created_at) }}</p>
                                            <p class="text-xs text-gray-500">{{ formatTime(log.created_at) }}</p>
                                        </td>
                                        <td>
                                            <p v-if="log.user" class="font-medium text-gray-900">{{ fullName(log.user)
                                                }}
                                            </p>
                                            <p v-else class="text-gray-500">{{ log.properties?.email || 'Unknown' }}</p>
                                        </td>
                                        <td class="min-w-[18rem]">
                                            <ModulesActivityLogEventBadge :event="log.event" />
                                            <p class="mt-1 text-sm text-gray-800">{{ log.description }}</p>
                                        </td>
                                        <td>
                                            <div class="flex items-start gap-2">
                                                <Icon :name="deviceIcon(log.device_type)"
                                                    class="mt-0.5 size-5 shrink-0 text-gray-400" />
                                                <div class="min-w-0">
                                                    <p class="text-sm text-gray-800">{{ deviceSummary(log) }}</p>
                                                    <p class="text-xs text-gray-500">{{ log.ip_address || '—' }}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Tooltip text="Details">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click.stop="openLog(log)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.logs" @previous="previous" @next="next" />
                    </div>
                </section>
            </div>

            <!-- Details -->
            <Modal size="xl" :show="Boolean(state.selectedLog)" title="Activity details"
                @close="state.selectedLog = null">
                <template #modal-body>
                    <div v-if="state.selectedLog" class="space-y-6 text-sm">
                        <div>
                            <ModulesActivityLogEventBadge :event="state.selectedLog.event" />
                            <p class="mt-2 text-base font-medium text-gray-900">{{ state.selectedLog.description }}</p>
                            <p class="mt-1 text-gray-500">
                                {{ formatDateTime(state.selectedLog.created_at) }} ·
                                {{ state.selectedLog.user ? fullName(state.selectedLog.user) :
                                    state.selectedLog.properties?.email || 'Unknown user' }}
                            </p>
                            <p v-if="state.selectedLog.properties?.failure_reason"
                                class="mt-2 inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-red-700">
                                <Icon name="ph:warning-circle" class="size-4" />
                                {{ state.selectedLog.properties.failure_reason }}
                            </p>
                        </div>

                        <!-- What changed -->
                        <div v-if="changeRows.length">
                            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {{ state.selectedLog.properties?.changes ? 'What changed' : 'Details' }}
                            </h4>
                            <div class="overflow-hidden rounded-lg ring-1 ring-gray-200">
                                <table class="w-full text-left text-sm">
                                    <thead class="bg-gray-50 text-xs text-gray-500">
                                        <tr>
                                            <th class="px-3 py-2 font-medium">Field</th>
                                            <th v-if="state.selectedLog.properties?.changes"
                                                class="px-3 py-2 font-medium">
                                                Before</th>
                                            <th class="px-3 py-2 font-medium">
                                                {{ state.selectedLog.properties?.changes ? 'After' : 'Value' }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100">
                                        <tr v-for="row in changeRows" :key="row.field">
                                            <td class="px-3 py-2 font-medium text-gray-700">{{ row.field }}</td>
                                            <td v-if="state.selectedLog.properties?.changes"
                                                class="px-3 py-2 text-gray-500 line-through decoration-gray-300">
                                                {{ row.old }}</td>
                                            <td class="px-3 py-2 text-gray-900">{{ row.new }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Where it came from -->
                        <div>
                            <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Device &
                                connection</h4>
                            <dl class="grid gap-x-6 gap-y-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
                                <div v-for="item in deviceRows" :key="item.label" class="min-w-0">
                                    <dt class="text-xs text-gray-500">{{ item.label }}</dt>
                                    <dd class="break-words text-gray-900" :class="item.mono && 'font-mono text-xs'">
                                        {{ item.value }}</dd>
                                </div>
                            </dl>
                            <p v-if="state.selectedLog.user_agent"
                                class="mt-3 break-all font-mono text-[11px] text-gray-500">
                                {{ state.selectedLog.user_agent }}
                            </p>
                            <p class="mt-2 text-[11px] text-gray-500">
                                Browsers don't reveal a device's MAC address, so each device is identified by the ID the
                                app stores on it.
                            </p>
                        </div>
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { activityLogService } from '@/components/api/user/ActivityLogService'
import { userService } from '@/components/api/user/UserService'
import { useActivityLogStore } from '@/store/activityLog'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const activityLogStore = useActivityLogStore() as any
const pageLengths = [20, 50, 100, 200]

const eventOptions = [
    { label: 'All activity', value: 'all' },
    { label: 'Signed in', value: 'login' },
    { label: 'Failed sign-in', value: 'login_failed' },
    { label: 'Signed out', value: 'logout' },
    { label: 'Created', value: 'created' },
    { label: 'Updated', value: 'updated' },
    { label: 'Deleted', value: 'deleted' },
    { label: 'Refunded', value: 'refunded' },
    { label: 'Checklist verified', value: 'verified' },
    { label: 'Checklist reopened', value: 'reopened' },
    { label: 'Task ticked', value: 'task_done' },
    { label: 'Task unticked', value: 'task_undone' },
]

const state = reactive({
    logs: [] as any,
    users: [] as any[],
    userOptions: [] as any[],
    columnHeaders: [
        { name: 'When', sorter: true, key: 'created_at' },
        { name: 'User', sorter: true, key: 'user_id' },
        { name: 'Activity', sorter: true, key: 'event' },
        { name: 'Device', sorter: false, key: 'device' },
        { name: '' },
    ],
    filters: {
        // /activity-logs?user=<uuid> opens one user's log (from the Users page).
        user: (route.query.user as string) || 'all',
        event: 'all',
        dateRange: [] as string[],
        search: [] as string[],
    },
    lastLogin: null as any,
    selectedLog: null as any,
    error: {} as Error,
    isTableLoading: false,
})

const selectedUser = computed(() =>
    state.filters.user === 'all' ? null : state.users.find((user: any) => user.uuid === state.filters.user)
)

onMounted(() => {
    activityLogStore.setCurrentPageNumber(1)
    fetchUsers()
    fetchLogs()
    fetchLastLogin()
})

watch(() => state.filters.user, (userUuid: string) => {
    router.replace({ query: userUuid === 'all' ? {} : { user: userUuid } })
    activityLogStore.setCurrentPageNumber(1)
    fetchLogs()
    fetchLastLogin()
})

watch(() => state.filters.event, () => {
    activityLogStore.setCurrentPageNumber(1)
    fetchLogs()
})

watch(() => state.filters.dateRange, (range: string[]) => {
    if (range.length === 0 || range.length === 2) {
        activityLogStore.setCurrentPageNumber(1)
        fetchLogs()
    }
})

async function fetchUsers() {
    try {
        const response = await userService.getUsers({ page: 1, page_length: 500, sortField: 'firstname', sortOrder: 'ascend' })
        state.users = response?.data ?? []
        state.userOptions = state.users.map((user: any) => ({
            label: `${fullName(user)}${user.is_active ? '' : ' (inactive)'}`,
            value: user.uuid,
        }))
    } catch (error: any) {
        state.error = error
    }
}

async function fetchLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await activityLogService.getActivityLogs({
            page: activityLogStore.getCurrentPageNumber,
            page_length: activityLogStore.getCurrentPageLength,
            sortField: activityLogStore.getSortData.sortField,
            sortOrder: activityLogStore.getSortData.sortOrder,
            user: state.filters.user === 'all' ? undefined : state.filters.user,
            event: state.filters.event === 'all' ? undefined : state.filters.event,
            date_from: state.filters.dateRange[0] || undefined,
            date_to: state.filters.dateRange[1] || undefined,
            search: state.filters.search,
        })
        if (response) state.logs = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchLastLogin() {
    state.lastLogin = null
    if (state.filters.user === 'all') return
    try {
        const response = await activityLogService.getActivityLogs({
            page: 1, page_length: 1, user: state.filters.user, event: 'login',
        })
        state.lastLogin = response?.data?.[0] ?? null
    } catch {
        // The summary is a nicety; the table still shows everything.
    }
}

function openLog(log: any) {
    state.selectedLog = log
}

const changeRows = computed(() => {
    const properties = state.selectedLog?.properties ?? {}
    if (properties.changes) {
        return Object.entries(properties.changes).map(([field, change]: [string, any]) => ({
            field: fieldLabel(field), old: formatValue(change?.old), new: formatValue(change?.new),
        }))
    }
    if (properties.attributes) {
        return Object.entries(properties.attributes).map(([field, value]) => ({
            field: fieldLabel(field), old: '', new: formatValue(value),
        }))
    }
    return []
})

const deviceRows = computed(() => {
    const log = state.selectedLog ?? {}
    const device = log.properties?.device ?? {}
    const rows = [
        { label: 'IP address', value: log.ip_address },
        { label: 'Forwarded for (proxy chain)', value: log.properties?.forwarded_for },
        { label: 'Device ID', value: log.device_id, mono: true },
        { label: 'Device type', value: capitalize(log.device_type) },
        { label: 'Model', value: log.device_model },
        { label: 'Operating system', value: [log.platform, device.platform_version && `(reported ${device.platform_version})`].filter(Boolean).join(' ') },
        { label: 'Browser', value: log.browser },
        { label: 'Screen', value: device.screen },
        { label: 'Window', value: device.viewport },
        { label: 'Touch screen', value: device.touch === undefined ? null : device.touch ? 'Yes' : 'No' },
        { label: 'Timezone', value: device.timezone },
        { label: 'Language', value: device.language },
        { label: 'Installed as app', value: device.standalone === undefined ? null : device.standalone ? 'Yes' : 'No' },
        { label: 'App version', value: device.app_version },
        { label: 'Session token', value: log.properties?.token_id ? `#${log.properties.token_id}` : null },
    ]
    return rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== '')
})

function fieldLabel(field: string) {
    const label = field.replace(/_(id|uuid)$/, '').replace(/_/g, ' ')
    return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatValue(value: any) {
    if (value === null || value === undefined || value === '') return '—'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
}

function capitalize(value?: string | null) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : null
}

function fullName(user: any) {
    return [user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.email || 'Unknown'
}

function deviceIcon(type?: string | null) {
    return type === 'mobile' ? 'ph:device-mobile' : type === 'tablet' ? 'ph:device-tablet' : 'ph:desktop'
}

function deviceSummary(log: any) {
    const what = log.device_model || capitalize(log.device_type)
    const how = [log.browser, log.platform].filter(Boolean).join(' on ')
    return [what, how].filter(Boolean).join(' · ') || 'Unknown device'
}

function formatDate(value: string) {
    return moment(value).format('MMM D, YYYY')
}

function formatTime(value: string) {
    return moment(value).format('h:mm:ss A')
}

function formatDateTime(value: string) {
    return moment(value).format('MMM D, YYYY h:mm A')
}

function previous() {
    activityLogStore.setCurrentPageNumber(activityLogStore.getCurrentPageNumber - 1)
    fetchLogs()
}

function next() {
    activityLogStore.setCurrentPageNumber(activityLogStore.getCurrentPageNumber + 1)
    fetchLogs()
}

function sort(sortingData: any) {
    activityLogStore.setCurrentPageNumber(1)
    activityLogStore.setSortData(sortingData.column, sortingData.sort)
    fetchLogs()
}

function handleSearch(value: any) {
    activityLogStore.setCurrentPageNumber(1)
    state.filters.search = value?.[0] == '' ? [] : value
    fetchLogs()
}

function changePageLength(event: any) {
    activityLogStore.setCurrentPageNumber(1)
    activityLogStore.setCurrentPageLength(event.target.value)
    fetchLogs()
}
</script>
