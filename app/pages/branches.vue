<template>
    <div>

        <Head>
            <Title>Branches - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Branches</template>
            <div class="bg-white rounded-md p-5">
                <div>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                        <div class="flex items-center gap-x-1">
                            <span>Entriers per page:</span>
                            <select class="focus:outline-none bg-transparent" @change="changePageLength"
                                id="branchesPageLength">
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
                            <FormButton buttonStyle="action" @click="navigateTo('/branches/new')">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                New branch
                            </FormButton>
                        </div>
                    </div>
                    <div class="space-y-5">
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.branches"
                                :isLoading="state.isTableLoading" :sortData="branchStore.getSortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.branches?.data?.length === 0))">
                                    <tr v-for="(branch, index) in state.branches?.data" :key="index">
                                        <td width="20%">
                                            <p>
                                                {{ branch?.name }}
                                            </p>
                                        </td>
                                        <td width="20%">
                                            <p>
                                                {{ branch?.address }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <p>
                                                {{ branch?.phone }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <p>
                                                {{ branch?.alternate_phone }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <p>
                                                {{ branch?.email }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <Badge class="w-fit" :type="branch?.is_active ? 'active' : 'inactive'">
                                                <p class="text-xs">
                                                    {{ branch?.is_active ? 'Active' : 'Inactive' }}
                                                </p>
                                            </Badge>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <Tooltip text="Edit">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="navigateTo(`/branches/${branch.uuid}/edit`)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip text="Delete">
                                                    <FormButton type="button" buttonStyle="danger" @click="">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.branches" @previous="previous" @next="next" />
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { branchService } from '@/components/api/user/BranchService'
import { useBranchStore } from '@/store/branch'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const branchStore = useBranchStore() as any

const state = reactive({
    columnHeaders: [
        { name: 'Name', sorter: true, key: 'name' },
        { name: 'Address' },
        { name: 'Phone', sorter: true, key: 'phone' },
        { name: 'Altenate phone', sorter: true, key: 'alternate_phone' },
        { name: 'Email', sorter: true, key: 'email' },
        { name: 'Status', sorter: true, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    branches: [] as any,
    error: {} as Error,
    isTableLoading: false,
    selectedBranch: {} as any,
})

onMounted(() => {
    fetchBranches()
})

async function fetchBranches() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: branchStore.getCurrentPageNumber,
            page_length: branchStore.getCurrentPageLength,
            sortField: branchStore.getSortData.sortField,
            sortOrder: branchStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await branchService.getBranches(params)
        if (response) {
            state.branches = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = branchStore.getCurrentPageNumber - 1
    branchStore.setCurrentPageNumber(currentTablePage)
    fetchBranches()
}

function next() {
    const currentTablePage = branchStore.getCurrentPageNumber + 1
    branchStore.setCurrentPageNumber(currentTablePage)
    fetchBranches()
}

function sort(sortingData: any) {
    branchStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    branchStore.setSortData(sortField, sortOrder)
    fetchBranches()
}

function handleSearch(value: any) {
    branchStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchBranches()
}

function changePageLength(event: any) {
    branchStore.setCurrentPageNumber(1)
    branchStore.setCurrentPageLength(event.target.value)
    fetchBranches()
}
</script>