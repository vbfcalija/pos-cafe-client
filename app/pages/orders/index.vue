<template>
    <div>

        <Head>
            <Title>Orders - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Orders</template>
            <div class="rounded-md bg-white p-5">
                <Alert v-if="state.error?.message" type="danger" :text="state.error.message" />
                <div class="mb-5 flex items-center gap-x-1">
                    <span>Entries per page:</span>
                    <select id="pageLength" class="bg-transparent focus:outline-none"
                        :value="orderStore.getCurrentPageLength" @change="changePageLength">
                        <option v-for="length in pageLengths" :key="length" :value="length">
                            {{ length }}
                        </option>
                    </select>
                </div>
                <div class="space-y-5">
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.orders"
                            :isLoading="state.isTableLoading" :sortData="orderStore.getSortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || state.orders?.data?.length === 0)">
                                <tr v-for="order in state.orders.data" :key="order.uuid">
                                    <td>
                                        <p class="font-medium">
                                            #{{ order.order_no }}
                                        </p>
                                    </td>
                                    <td>
                                        <p>
                                            {{ formatDateToReadable(order.date) }}
                                        </p>
                                    </td>
                                    <td>
                                        <p>
                                            {{ order.shift?.branch?.name || '-' }}
                                        </p>
                                    </td>
                                    <td>
                                        <p>
                                            {{ order.customer?.name || 'Walk-in' }}
                                        </p>
                                    </td>
                                    <td>
                                        <p>
                                            {{ fullName(order.user) }}
                                        </p>
                                    </td>
                                    <td>
                                        <p class="capitalize">
                                            {{ paymentMethods(order) }}
                                        </p>
                                    </td>
                                    <td>
                                        <p class="font-semibold">
                                            {{ money(orderTotal(order)) }}
                                        </p>
                                    </td>
                                    <td>
                                        <Tooltip text="View">
                                            <FormButton buttonStyle="action" buttonSize="xs" @click="viewOrder(order)">
                                                <Icon name="ph:eye" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.orders" @previous="previous" @next="next" />
                </div>
            </div>

            <Modal size="lg" :title="`Order #${state.selectedOrder?.order_no || ''}`" :show="state.isOrderModalOpen"
                @close="state.isOrderModalOpen = false">
                <template #modal-body>
                    <LoadingSpinner :isActive="state.isOrderLoading">
                        <div v-if="state.selectedOrder" class="space-y-5">
                            <div class="grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <p class="text-xs text-gray-500">Date</p>
                                    <p class="font-medium">
                                        {{ formatDateToReadable(state.selectedOrder.date) }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Branch</p>
                                    <p class="font-medium">
                                        {{ state.selectedOrder.shift?.branch?.name || '-' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Customer</p>
                                    <p class="font-medium">
                                        {{ state.selectedOrder.customer?.name || 'Walk-in' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Cashier</p>
                                    <p class="font-medium">
                                        {{ fullName(state.selectedOrder.user) }}
                                    </p>
                                </div>
                            </div>
                            <div class="overflow-x-auto rounded-lg border border-gray-200">
                                <table class="w-full text-sm">
                                    <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
                                        <tr>
                                            <th class="p-3">Product</th>
                                            <th class="p-3 text-right">Qty</th>
                                            <th class="p-3 text-right">Price</th>
                                            <th class="p-3 text-right">Discount</th>
                                            <th class="p-3 text-right">Tax</th>
                                            <th class="p-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100">
                                        <tr v-for="line in state.selectedOrder.details" :key="line.uuid">
                                            <td class="p-3">
                                                <p class="font-medium">
                                                    {{ line.product_variant?.product?.name || 'Product' }}
                                                </p>
                                                <p class="text-xs text-gray-500">
                                                    {{ line.product_variant?.name }}
                                                </p>
                                            </td>
                                            <td class="p-3 text-right">
                                                {{ line.quantity }}
                                            </td>
                                            <td class="p-3 text-right">
                                                {{ money(line.price) }}
                                            </td>
                                            <td class="p-3 text-right">
                                                {{ money(lineDiscount(line)) }}
                                            </td>
                                            <td class="p-3 text-right">
                                                {{ money(lineTax(line)) }}
                                            </td>
                                            <td class="p-3 text-right font-semibold">
                                                {{ money(lineTotal(line)) }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="ml-auto max-w-sm space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Subtotal</span>
                                    <span>{{ money(orderSubtotal(state.selectedOrder)) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Discount</span>
                                    <span class="text-red-600">- {{ money(orderDiscount(state.selectedOrder)) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Tax</span>
                                    <span>{{ money(orderTax(state.selectedOrder)) }}</span>
                                </div>
                                <div class="flex justify-between border-t pt-2 text-lg font-bold">
                                    <span>Total</span><span>{{ money(orderTotal(state.selectedOrder)) }}</span>
                                </div>
                            </div>
                            <div class="rounded-lg border border-gray-200 p-4">
                                <h3 class="mb-3 font-semibold">Payments</h3>
                                <div v-for="payment in state.selectedOrder.payments" :key="payment.uuid"
                                    class="flex justify-between gap-3 text-sm">
                                    <span class="capitalize">{{ payment.payment_method }}</span>
                                    <span class="text-gray-500">{{ payment.reference || 'No reference' }}</span>
                                </div>
                            </div>
                        </div>
                    </LoadingSpinner>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { orderService } from '@/components/api/user/OrderService'
import { useOrderStore } from '@/store/order'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const orderStore = useOrderStore() as any
const { formatDateToReadable } = useDatetimeFormatter()
const pageLengths = [10, 20, 30, 40, 50, 100, 500]
const state = reactive({
    orders: {} as any, selectedOrder: null as any,
    columnHeaders: [
        { name: 'Order no.', sorter: true, key: 'order_no' },
        { name: 'Date', sorter: true, key: 'date' },
        { name: 'Branch' },
        { name: 'Customer' },
        { name: 'Cashier' },
        { name: 'Payment' },
        { name: 'Total' },
        { name: '' },
    ],
    dataFilter: {
        search: [] as string[]
    },
    error: {} as Error,
    isTableLoading: false,
    isOrderLoading: false,
    isOrderModalOpen: false,
})

onMounted(fetchOrders)

async function fetchOrders() {
    state.error = {}; state.isTableLoading = true
    try {
        state.orders = await orderService.getOrders({
            page: orderStore.getCurrentPageNumber,
            page_length: orderStore.getCurrentPageLength,
            sortField: orderStore.getSortData.sortField,
            sortOrder: orderStore.getSortData.sortOrder,
            ...state.dataFilter
        })
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
async function viewOrder(order: any) {
    state.selectedOrder = order
    state.isOrderModalOpen = true
    state.isOrderLoading = true
    try {
        const response = await orderService.getOrder(order.uuid)
        if (response?.data) {
            state.selectedOrder = response.data
        }
    }
    catch (error: any) {
        state.error = error
    }
    state.isOrderLoading = false
}
function previous() {
    orderStore.setCurrentPageNumber(orderStore.getCurrentPageNumber - 1)
    fetchOrders()
}

function next() {
    orderStore.setCurrentPageNumber(orderStore.getCurrentPageNumber + 1)
    fetchOrders()
}

function sort(data: any) {
    orderStore.setCurrentPageNumber(1)
    orderStore.setSortData(data.column, data.sort)
    fetchOrders()
}

function handleSearch(value: any) {
    orderStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchOrders()
}

function changePageLength(event: any) {
    orderStore.setCurrentPageNumber(1)
    orderStore.setCurrentPageLength(event.target.value)
    fetchOrders()
}

function fullName(user: any) {
    return user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || '-' : '-'
}

function paymentMethods(order: any) {
    return order.payments?.map((payment: any) => payment.payment_method).join(', ') || '-'
}

function gross(line: any) {
    return Number(line.price) * Number(line.quantity)
}

function lineDiscount(line: any) {
    if (!line.discount) {
        return 0
    }
    return line.discount.type === 'percentage' ? gross(line) * Number(line.discount.value) / 100 : Math.min(gross(line), Number(line.discount.value))
}

function lineTax(line: any) {
    return Math.max(0, gross(line) - lineDiscount(line)) * Number(line.tax_percentage) / 100
}

function lineTotal(line: any) {
    return gross(line) - lineDiscount(line) + lineTax(line)
}

function orderSubtotal(order: any) {
    return order.details?.reduce((sum: number, line: any) => sum + gross(line), 0) || 0
}

function orderDiscount(order: any) {
    return order.details?.reduce((sum: number, line: any) => sum + lineDiscount(line), 0) || 0
}

function orderTax(order: any) {
    return order.details?.reduce((sum: number, line: any) => sum + lineTax(line), 0) || 0
}

function orderTotal(order: any) {
    return order.details?.reduce((sum: number, line: any) => sum + lineTotal(line), 0) || 0
}

function money(value: number | string) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))
}
</script>
