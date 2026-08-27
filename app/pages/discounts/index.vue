<template>
    <div>

        <Head>
            <Title>Discounts - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Discounts</template>
            <div class="bg-white rounded-md p-5">
                <div>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                        <div class="flex items-center gap-x-1">
                            <span>Entriers per page:</span>
                            <select id="pageLength" class="bg-transparent focus:outline-none"
                                :value="discountStore.getCurrentPageLength" @change="changePageLength">
                                <option v-for="length in pageLengths" :key="length" :value="length">
                                    {{ length }}
                                </option>
                            </select>
                        </div>
                        <div class="flex flex-wrap items-center gap-3">
                            <FormButton buttonStyle="action" @click="navigateTo('/discounts/new')">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                New discount
                            </FormButton>
                        </div>
                    </div>
                    <div class="space-y-5">
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.discounts"
                                :isLoading="state.isTableLoading" :sortData="discountStore.getSortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.discounts?.data?.length === 0))">
                                    <tr v-for="(discount, index) in state.discounts?.data" :key="index">
                                        <td width="30%">
                                            <p>{{ discount?.name }}</p>
                                        </td>
                                        <td width="25%">
                                            <p class="capitalize">{{ discount?.type }}</p>
                                        </td>
                                        <td width="25%">
                                            <p>
                                                {{ discount?.type === 'percentage'
                                                    ? `${discount?.value}%`
                                                    : Number(discount?.value).toFixed(2) }}
                                            </p>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <Tooltip text="Edit">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="navigateTo(`/discounts/${discount.uuid}/edit`)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip text="Delete">
                                                    <FormButton type="button" buttonStyle="danger"
                                                        @click="deleteDiscountConfirmation(discount)">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.discounts" @previous="previous" @next="next" />
                    </div>
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteDiscountOpen"
                message="Are you sure you want to delete this discount?"
                @close="state.modal.isDeleteDiscountOpen = false" @confirm="deleteDiscount" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { discountService } from '@/components/api/user/DiscountService'
import { useAlert } from '@/composables/alert'
import { useDiscountStore } from '@/store/discount'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const discountStore = useDiscountStore() as any
const pageLengths = [10, 20, 30, 40, 50, 100, 500]
const { successAlert } = useAlert()

const state = reactive({
    discounts: [] as any,
    columnHeaders: [
        { name: 'Name', sorter: true, key: 'name' },
        { name: 'Type', sorter: true, key: 'type' },
        { name: 'Value', sorter: true, key: 'value' },
        { name: '' },
    ],
    dataFilter: {
        search: [] as string[]
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteDiscountOpen: false,
    },
    selectedDiscount: {} as any,
})

onMounted(() => {
    fetchDiscounts()
})

async function fetchDiscounts() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: discountStore.getCurrentPageNumber,
            page_length: discountStore.getCurrentPageLength,
            sortField: discountStore.getSortData.sortField,
            sortOrder: discountStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await discountService.getDiscounts(params)
        if (response) {
            state.discounts = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = discountStore.getCurrentPageNumber - 1
    discountStore.setCurrentPageNumber(currentTablePage)
    fetchDiscounts()
}

function next() {
    const currentTablePage = discountStore.getCurrentPageNumber + 1
    discountStore.setCurrentPageNumber(currentTablePage)
    fetchDiscounts()
}

function sort(sortingData: any) {
    discountStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    discountStore.setSortData(sortField, sortOrder)
    fetchDiscounts()
}

function handleSearch(value: any) {
    discountStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchDiscounts()
}

function changePageLength(event: any) {
    discountStore.setCurrentPageNumber(1)
    discountStore.setCurrentPageLength(event.target.value)
    fetchDiscounts()
}

function deleteDiscountConfirmation(discount: any) {
    state.selectedDiscount = discount
    state.modal.isDeleteDiscountOpen = true
}

async function deleteDiscount() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await discountService.deleteDiscount(state.selectedDiscount.uuid)
        if (response?.message) {
            successAlert('Success!', 'Discount successfully deleted.')
            fetchDiscounts()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
