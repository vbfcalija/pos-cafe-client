<template>
    <div>

        <Head>
            <Title>Users - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Users</template>
            <div class="bg-white rounded-md p-5">
                <div>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                        <div class="flex items-center gap-x-1">
                            <span>Entriers per page:</span>
                            <select class="focus:outline-none bg-transparent" @change="changePageLength"
                                id="usersPageLength">
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="30">30</option>
                                <option value="40">40</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="500">500</option>
                            </select>
                        </div>
                        <div class="flex flex-wrap items-center gap-3">
                            <FormButton buttonStyle="action" @click="navigateTo('/users/new')">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                New user
                            </FormButton>
                        </div>
                    </div>
                    <div class="space-y-5">
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.users"
                                :isLoading="state.isTableLoading" :sortData="userStore.getSortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.users?.data?.length === 0))">
                                    <tr v-for="(user, index) in state.users?.data" :key="index">
                                        <td width="30%">
                                            <div class="flex items-center gap-x-2">
                                                <div class="relative">
                                                    <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${user?.firstname + ' ' + (user?.lastname ?? '')}`"
                                                        class="h-11 w-11 rounded-full bg-gray-50 object-cover" />
                                                </div>
                                                <span>
                                                    {{ user?.firstname }} {{ user?.lastname }}
                                                </span>
                                            </div>
                                        </td>
                                        <td width="20%">
                                            <span>{{ user?.email }}</span>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <Tooltip text="View">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="navigateTo(`/users/${user.uuid}/view-details`)">
                                                        <Icon name="ph:eye" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip text="Edit">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="navigateTo(`/users/${user.uuid}/edit`)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.users" @previous="previous" @next="next" />
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any

const state = reactive({
    columnHeaders: [
        { name: 'Name', sorter: true, key: 'firstname' },
        { name: 'Email', sorter: true, key: 'email' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    users: [] as any,
    error: {} as Error,
    isTableLoading: false,
    selectedUser: {} as any,
})

onMounted(() => {
    fetchUsers()
})

async function fetchUsers() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: userStore.getCurrentPageNumber,
            page_length: userStore.getCurrentPageLength,
            sortField: userStore.getSortData.sortField,
            sortOrder: userStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await userService.getUsers(params)
        if (response) {
            state.users = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = userStore.getCurrentPageNumber - 1
    userStore.setCurrentPageNumber(currentTablePage)
    fetchUsers()
}

function next() {
    const currentTablePage = userStore.getCurrentPageNumber + 1
    userStore.setCurrentPageNumber(currentTablePage)
    fetchUsers()
}

function sort(sortingData: any) {
    userStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    userStore.setSortData(sortField, sortOrder)
    fetchUsers()
}

function handleSearch(value: any) {
    userStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchUsers()
}

function changePageLength(event: any) {
    userStore.setCurrentPageNumber(1)
    userStore.setCurrentPageLength(event.target.value)
    fetchUsers()
}
</script>