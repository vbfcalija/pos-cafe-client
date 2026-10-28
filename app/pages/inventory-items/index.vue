<template>
    <div>

        <Head>
            <Title>Inventory items - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Inventory items</template>
            <div class="bg-white rounded-md p-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                    <div class="flex items-center gap-x-1">
                        <span>Entries per page:</span>
                        <select id="pageLength" class="bg-transparent focus:outline-none"
                            :value="itemStore.getCurrentPageLength" @change="changePageLength">
                            <option v-for="length in pageLengths" :key="length" :value="length">{{ length }}</option>
                        </select>
                    </div>
                    <FormButton buttonStyle="action" @click="navigateTo('/inventory-items/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" /> New item
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-end">
                        <TableSearch @search="handleSearch" />
                        <div class="grid gap-1">
                            <p class="text-sm text-gray-600">Show</p>
                            <FormSelect :options="statusOptions" :searchable="false" :canClear="false"
                                v-model="state.statusFilter" />
                        </div>
                    </div>
                    <p class="text-xs text-gray-500">
                        Items appear on each day's inventory sheet in the order they were added. To stop counting an
                        item, untick “Count this item each day” instead of deleting it.
                    </p>
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.items"
                            :isLoading="state.isTableLoading" :sortData="itemStore.getSortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || state.items?.data?.length === 0)">
                                <tr v-for="item in state.items?.data" :key="item.uuid">
                                    <td width="50%">
                                        <p class="font-medium text-gray-900">{{ item.name }}</p>
                                    </td>
                                    <td width="20%">
                                        <p class="text-gray-600">{{ item.unit }}</p>
                                    </td>
                                    <td width="15%">
                                        <Badge class="w-fit" :type="item.is_active ? 'active' : 'inactive'">
                                            <p class="text-xs">{{ item.is_active ? 'Counted' : 'Not counted' }}</p>
                                        </Badge>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <Tooltip text="Edit">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="navigateTo(`/inventory-items/${item.uuid}/edit`)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip text="Delete">
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="deleteConfirmation(item)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.items" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.isDeleteOpen"
                message="Delete this item? An item that's already on a past inventory sheet can't be deleted; untick “Count this item each day” instead."
                @close="state.isDeleteOpen = false" @confirm="deleteItem" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { inventoryItemService } from '@/components/api/user/InventoryItemService'
import { useAlert } from '@/composables/alert'
import { useInventoryItemStore } from '@/store/inventoryItem'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const itemStore = useInventoryItemStore() as any
const pageLengths = [10, 20, 50, 100, 500]
const { successAlert } = useAlert()

const statusOptions = [
    { label: 'All items', value: 'all' },
    { label: 'Counted daily', value: 'true' },
    { label: 'Not counted', value: 'false' },
]

const state = reactive({
    items: [] as any,
    columnHeaders: [
        { name: 'Item', sorter: true, key: 'name' },
        { name: 'Unit', sorter: true, key: 'unit' },
        { name: 'Status', sorter: true, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: { search: [] as string[] },
    statusFilter: 'all',
    error: {} as Error,
    isTableLoading: false,
    isDeleteOpen: false,
    selectedItem: {} as any,
})

onMounted(() => {
    fetchItems()
})

watch(() => state.statusFilter, () => {
    itemStore.setCurrentPageNumber(1)
    fetchItems()
})

async function fetchItems() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await inventoryItemService.getInventoryItems({
            page: itemStore.getCurrentPageNumber,
            page_length: itemStore.getCurrentPageLength,
            sortField: itemStore.getSortData.sortField,
            sortOrder: itemStore.getSortData.sortOrder,
            is_active: state.statusFilter === 'all' ? undefined : state.statusFilter,
            ...state.dataFilter,
        })
        if (response) state.items = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    itemStore.setCurrentPageNumber(itemStore.getCurrentPageNumber - 1)
    fetchItems()
}

function next() {
    itemStore.setCurrentPageNumber(itemStore.getCurrentPageNumber + 1)
    fetchItems()
}

function sort(sortingData: any) {
    itemStore.setCurrentPageNumber(1)
    itemStore.setSortData(sortingData.column, sortingData.sort)
    fetchItems()
}

function handleSearch(value: any) {
    itemStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchItems()
}

function changePageLength(event: any) {
    itemStore.setCurrentPageNumber(1)
    itemStore.setCurrentPageLength(event.target.value)
    fetchItems()
}

function deleteConfirmation(item: any) {
    state.selectedItem = item
    state.isDeleteOpen = true
}

async function deleteItem() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await inventoryItemService.deleteInventoryItem(state.selectedItem.uuid)
        if (response?.message) {
            successAlert('Success!', 'Inventory item deleted.')
            fetchItems()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
