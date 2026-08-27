<template>
    <div>

        <Head>
            <Title>Tax rates - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Tax rates</template>
            <div class="bg-white rounded-md p-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                    <div class="flex items-center gap-x-1">
                        <span>Entriers per page:</span>
                        <select id="pageLength" class="bg-transparent focus:outline-none"
                            :value="taxRateStore.getCurrentPageLength" @change="changePageLength">
                            <option v-for="length in pageLengths" :key="length" :value="length">{{ length }}</option>
                        </select>
                    </div>
                    <FormButton buttonStyle="action" @click="navigateTo('/tax-rates/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" /> New tax rate
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.taxRates"
                            :isLoading="state.isTableLoading" :sortData="taxRateStore.getSortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.taxRates?.data?.length === 0))">
                                <tr v-for="(taxRate, index) in state.taxRates?.data" :key="index">
                                    <td width="40%">
                                        <p>{{ taxRate?.name }}</p>
                                    </td>
                                    <td width="40%">
                                        <p>{{ taxRate?.percentage }}%</p>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <Tooltip text="Edit">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="navigateTo(`/tax-rates/${taxRate.uuid}/edit`)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip text="Delete">
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="deleteTaxRateConfirmation(taxRate)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.taxRates" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteTaxRateOpen"
                message="Are you sure you want to delete this tax rate?"
                @close="state.modal.isDeleteTaxRateOpen = false" @confirm="deleteTaxRate" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { taxRateService } from '@/components/api/user/TaxRateService'
import { useAlert } from '@/composables/alert'
import { useTaxRateStore } from '@/store/taxRate'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const taxRateStore = useTaxRateStore() as any
const pageLengths = [10, 20, 30, 40, 50, 100, 500]
const { successAlert } = useAlert()

const state = reactive({
    taxRates: [] as any,
    columnHeaders: [
        { name: 'Name', sorter: true, key: 'name' },
        { name: 'Percentage', sorter: true, key: 'percentage' },
        { name: '' },
    ],
    dataFilter: {
        search: [] as string[]
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteTaxRateOpen: false
    },
    selectedTaxRate: {} as any,
})

onMounted(() => {
    fetchTaxRates()
})

async function fetchTaxRates() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: taxRateStore.getCurrentPageNumber,
            page_length: taxRateStore.getCurrentPageLength,
            sortField: taxRateStore.getSortData.sortField,
            sortOrder: taxRateStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await taxRateService.getTaxRates(params)
        if (response) {
            state.taxRates = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = taxRateStore.getCurrentPageNumber - 1
    taxRateStore.setCurrentPageNumber(currentTablePage)
    fetchTaxRates()
}

function next() {
    const currentTablePage = taxRateStore.getCurrentPageNumber + 1
    taxRateStore.setCurrentPageNumber(currentTablePage)
    fetchTaxRates()
}

function sort(sortingData: any) {
    taxRateStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    taxRateStore.setSortData(sortField, sortOrder)
    fetchTaxRates()
}

function handleSearch(value: any) {
    taxRateStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchTaxRates()
}

function changePageLength(event: any) {
    taxRateStore.setCurrentPageNumber(1)
    taxRateStore.setCurrentPageLength(event.target.value)
    fetchTaxRates()
}

function deleteTaxRateConfirmation(taxRate: any) {
    state.selectedTaxRate = taxRate
    state.modal.isDeleteTaxRateOpen = true
}

async function deleteTaxRate() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await taxRateService.deleteTaxRate(state.selectedTaxRate.uuid)
        if (response?.message) {
            successAlert('Success!', 'Tax rate successfully deleted.')
            fetchTaxRates()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
