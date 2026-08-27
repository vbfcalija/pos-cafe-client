<template>
    <div>

        <Head>
            <Title>Customers - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Customers</template>
            <div class="rounded-md bg-white p-5">
                <Alert v-if="state.error?.message" type="danger" :text="state.error.message" />
                <div class="mb-5 flex-none items-center justify-between space-y-3 lg:flex">
                    <div class="flex items-center gap-x-1">
                        <span>Entries per page:</span>
                        <select id="pageLength" class="bg-transparent focus:outline-none"
                            :value="customerStore.getCurrentPageLength" @change="changePageLength">
                            <option v-for="length in pageLengths" :key="length" :value="length">{{ length }}</option>
                        </select>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <FormButton buttonStyle="action" @click="navigateTo('/customers/new')">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            New customer
                        </FormButton>
                    </div>
                </div>
                <div class="space-y-5">
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.customers"
                            :isLoading="state.isTableLoading" :sortData="customerStore.getSortData" @sort="sort">
                            <template #body v-if="!state.isTableLoading && state.customers?.data?.length">
                                <tr v-for="customer in state.customers.data" :key="customer.uuid">
                                    <td>
                                        <p>{{ customer.name }}</p>
                                    </td>
                                    <td>
                                        <p>{{ customer.tin || '—' }}</p>
                                    </td>
                                    <td>
                                        <p>{{ customer.address || '—' }}</p>
                                    </td>
                                    <td>
                                        <p>{{ customer.contact_number || '—' }}</p>
                                    </td>
                                    <td>
                                        <div class="flex items-end gap-2">
                                            <Tooltip text="Edit">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="navigateTo(`/customers/${customer.uuid}/edit`)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip text="Delete">
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="deleteCustomerConfirmation(customer)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.customers" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteCustomerOpen"
                message="Are you sure you want to delete this customer?"
                @close="state.modal.isDeleteCustomerOpen = false" @confirm="deleteCustomer" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { customerService } from '@/components/api/user/CustomerService'
import { useAlert } from '@/composables/alert'
import { useCustomerStore } from '@/store/customer'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customerStore = useCustomerStore() as any
const pageLengths = [10, 20, 30, 40, 50, 100, 500]
const { successAlert } = useAlert()

const state = reactive({
    columnHeaders: [
        { name: 'Name', sorter: true, key: 'name' },
        { name: 'TIN', sorter: true, key: 'tin' },
        { name: 'Address', sorter: true, key: 'address' },
        { name: 'Contact number', sorter: true, key: 'contact_number' },
        { name: '' },
    ],
    dataFilter: { search: [] as string[] },
    customers: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteCustomerOpen: false,
    },
    selectedCustomer: {} as any,
})

onMounted(fetchCustomers)

async function fetchCustomers() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await customerService.getCustomers({
            page: customerStore.getCurrentPageNumber,
            page_length: customerStore.getCurrentPageLength,
            sortField: customerStore.getSortData.sortField,
            sortOrder: customerStore.getSortData.sortOrder,
            ...state.dataFilter,
        })
        if (response) state.customers = response
    } catch (error: any) {
        state.error = error
    } finally {
        state.isTableLoading = false
    }
}

function previous() {
    customerStore.setCurrentPageNumber(customerStore.getCurrentPageNumber - 1)
    fetchCustomers()
}

function next() {
    customerStore.setCurrentPageNumber(customerStore.getCurrentPageNumber + 1)
    fetchCustomers()
}

function sort(sortingData: any) {
    customerStore.setCurrentPageNumber(1)
    customerStore.setSortData(sortingData.column, sortingData.sort)
    fetchCustomers()
}

function handleSearch(value: any) {
    customerStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchCustomers()
}

function changePageLength(event: Event) {
    const target = event.target as HTMLSelectElement
    customerStore.setCurrentPageNumber(1)
    customerStore.setCurrentPageLength(Number(target.value))
    fetchCustomers()
}

function deleteCustomerConfirmation(customer: any) {
    state.selectedCustomer = customer
    state.modal.isDeleteCustomerOpen = true
}

async function deleteCustomer() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await customerService.deleteCustomer(state.selectedCustomer.uuid)
        if (response?.message === 'Success.') {
            successAlert('Success!', 'Customer successfully deleted.')
            fetchCustomers()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
