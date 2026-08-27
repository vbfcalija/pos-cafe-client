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
                            <select id="pageLength" class="bg-transparent focus:outline-none"
                                :value="userStore.getCurrentPageLength" @change="changePageLength">
                                <option v-for="length in pageLengths" :key="length" :value="length">{{ length }}
                                </option>
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
                                        <td width="30%">
                                            <span>{{ user?.email }}</span>
                                        </td>
                                        <td width="20%">
                                            <Badge class="w-fit" :type="user?.is_active ? 'active' : 'inactive'">
                                                <p class="text-xs">{{ user?.is_active ? 'Active' : 'Inactive' }}</p>
                                            </Badge>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <Tooltip text="Edit">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="navigateTo(`/users/${user.uuid}/edit`)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip text="Delete">
                                                    <FormButton type="button" buttonStyle="danger"
                                                        @click="deleteUserConfirmation(user)">
                                                        <Icon name="ph:trash" class="size-4" />
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
            <DialogConfirmation :isModalOpen="state.modal.isDeleteUserOpen"
                message="Are you sure you want to delete this user?" @close="state.modal.isDeleteUserOpen = false"
                @confirm="deleteUser" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const pageLengths = [10, 20, 30, 40, 50, 100, 500]
const { successAlert } = useAlert()

const state = reactive({
    columnHeaders: [
        { name: 'Name', sorter: true, key: 'firstname' },
        { name: 'Email', sorter: true, key: 'email' },
        { name: 'Status', sorter: true, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: {
        search: [] as string[]
    },
    users: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteUserOpen: false,
    },
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

function deleteUserConfirmation(user: any) {
    state.selectedUser = user
    state.modal.isDeleteUserOpen = true
}

async function deleteUser() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await userService.deleteUser(state.selectedUser.uuid)
        if (response?.message) {
            successAlert('Success!', 'User successfully deleted.')
            fetchUsers()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
