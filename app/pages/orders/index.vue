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
                    <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
                        <TableSearch @search="handleSearch" />
                        <div class="grid gap-1">
                            <FormLabel for="order-period" label="Transaction date" />
                            <FormDateRangeField id="order-period" name="order_period" placeholder="Select date range"
                                v-model="state.dateRange" />
                        </div>
                    </div>
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
                                            {{ formatDatetimeToReadable(order.created_at) }}
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
                                        <span :class="order.refunded_at
                                            ? 'bg-red-50 text-red-700 ring-red-600/20'
                                            : 'bg-green-50 text-green-700 ring-green-600/20'"
                                            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset">
                                            {{ order.refunded_at ? 'Refunded' : 'Completed' }}
                                        </span>
                                    </td>
                                    <td>
                                        <p class="font-semibold"
                                            :class="order.refunded_at && 'text-gray-400 line-through'">
                                            {{ money(orderTotal(order)) }}
                                        </p>
                                    </td>
                                    <td>
                                        <div class="flex items-end gap-2">
                                            <Tooltip text="View">
                                                <FormButton buttonStyle="action" buttonSize="xs"
                                                    @click="viewOrder(order)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip text="Print receipt">
                                                <FormButton buttonStyle="action" buttonSize="xs"
                                                    :disabled="state.printingUuid === order.uuid"
                                                    @click="printOrder(order)">
                                                    <Icon name="ph:printer" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip v-if="!order.refunded_at" text="Refund order">
                                                <FormButton buttonStyle="danger" buttonSize="xs"
                                                    :disabled="state.refundingUuid === order.uuid"
                                                    @click="openRefundConfirmation(order)">
                                                    <Icon name="ph:arrow-u-up-left" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
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
                                        {{ formatDatetimeToReadable(state.selectedOrder.created_at) }}
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
                            <div v-if="state.selectedOrder.refunded_at"
                                class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                                <Icon name="ph:arrow-u-up-left" class="mt-0.5 size-5 shrink-0" />
                                <div>
                                    <p class="font-semibold">This order was refunded</p>
                                    <p class="mt-0.5 text-sm">
                                        {{ formatDateToReadable(state.selectedOrder.refunded_at) }}
                                        <span v-if="state.selectedOrder.refunded_by">
                                            by {{ fullName(state.selectedOrder.refunded_by) }}
                                        </span>
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
                                <div class="mb-3 flex items-center justify-between gap-3">
                                    <h3 class="font-semibold">Payments</h3>
                                    <span class="text-xs text-gray-500">
                                        {{ state.selectedOrder.payments?.length || 0 }} payment{{
                                            state.selectedOrder.payments?.length === 1 ? '' : 's' }}
                                    </span>
                                </div>
                                <div v-for="payment in state.selectedOrder.payments" :key="payment.uuid"
                                    class="border-t border-gray-100 py-3 first:border-t-0 first:pt-0 last:pb-0">
                                    <div v-if="state.editingPaymentUuid !== payment.uuid"
                                        class="flex items-center justify-between gap-3 text-sm">
                                        <div class="min-w-0">
                                            <p class="font-medium capitalize text-gray-900">
                                                {{ paymentMethodLabel(payment.payment_method) }}
                                            </p>
                                            <p class="truncate text-xs text-gray-500">
                                                {{ payment.reference || 'No reference' }}
                                            </p>
                                        </div>
                                        <FormButton v-if="!state.selectedOrder.refunded_at" buttonStyle="action"
                                            buttonSize="xs" @click="editPayment(payment)">
                                            <Icon name="ph:pencil-simple" class="size-4" /> Edit
                                        </FormButton>
                                    </div>
                                    <div v-else class="space-y-3 rounded-lg bg-gray-50 p-3">
                                        <div class="grid gap-3 sm:grid-cols-2" id="form-payment-method">
                                            <div class="grid gap-1">
                                                <FormLabel :for="`payment-method-${payment.uuid}`"
                                                    label="Payment method" />
                                                <FormSelect :id="`payment-method-${payment.uuid}`"
                                                    :options="paymentMethodOptions" :searchable="false"
                                                    :canClear="false" v-model="state.paymentForm.payment_method" />
                                            </div>
                                            <div class="grid gap-1">
                                                <FormLabel :for="`payment-reference-${payment.uuid}`"
                                                    label="Reference" />
                                                <input :id="`payment-reference-${payment.uuid}`"
                                                    v-model="state.paymentForm.reference" type="text"
                                                    placeholder="Optional reference"
                                                    class="h-[42px] rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                                            </div>
                                        </div>
                                        <div class="flex justify-end gap-2">
                                            <FormButton buttonStyle="secondary" buttonSize="xs"
                                                :disabled="state.isUpdatingPayment" @click="cancelEditPayment">
                                                Cancel
                                            </FormButton>
                                            <FormButton buttonStyle="primary" buttonSize="xs"
                                                :disabled="state.isUpdatingPayment" @click="updatePayment(payment)">
                                                <Icon name="ph:check" class="size-4" />
                                                {{ state.isUpdatingPayment ? 'Saving…' : 'Save payment' }}
                                            </FormButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </LoadingSpinner>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.isRefundConfirmationOpen" title="Refund order"
                :message="`Refund order #${state.refundOrder?.order_no || ''} for ${money(orderTotal(state.refundOrder))}? This action cannot be undone.`"
                @close="closeRefundConfirmation" @confirm="refundOrder" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { orderService } from '@/components/api/user/OrderService'
import { useAlert } from '@/composables/alert'
import { useOrderStore } from '@/store/order'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const orderStore = useOrderStore() as any
const { formatDateToReadable, formatDatetimeToReadable } = useDatetimeFormatter()
const { successAlert, errorAlert } = useAlert()
const pageLengths = [10, 20, 30, 40, 50, 100, 500]
const paymentMethodOptions = [
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
    { label: 'GCash', value: 'gcash' },
    { label: 'GoTyme', value: 'gotyme' },
]

if (orderStore.getSortData.sortField === 'date') {
    orderStore.setSortData('created_at', orderStore.getSortData.sortOrder)
}

const state = reactive({
    orders: {} as any, selectedOrder: null as any,
    columnHeaders: [
        { name: 'Order no.', sorter: true, key: 'id' },
        { name: 'Date & time', sorter: true, key: 'created_at' },
        { name: 'Branch' },
        { name: 'Customer' },
        { name: 'Cashier' },
        { name: 'Payment' },
        { name: 'Status' },
        { name: 'Total' },
        { name: '' },
    ],
    dataFilter: {
        search: [] as string[]
    },
    dateRange: [] as string[],
    error: {} as Error,
    isTableLoading: false,
    isOrderLoading: false,
    isOrderModalOpen: false,
    isRefundConfirmationOpen: false,
    refundOrder: null as any,
    refundingUuid: '' as string,
    printingUuid: '' as string,
    editingPaymentUuid: '' as string,
    isUpdatingPayment: false,
    paymentForm: {
        payment_method: 'cash',
        reference: '',
    },
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
            date_from: state.dateRange[0] || undefined,
            date_to: state.dateRange[1] || undefined,
            ...state.dataFilter
        })
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
async function printOrder(order: any) {
    if (state.printingUuid) return
    state.printingUuid = order.uuid
    try {
        await orderService.printReceipt(order.uuid)
        successAlert('Success', 'Receipt sent to printer.')
    } catch (error: any) {
        errorAlert('Could not print', error?.message || 'Printer not detected. Make sure a Bluetooth thermal printer is paired and try again.')
    } finally {
        state.printingUuid = ''
    }
}

function openRefundConfirmation(order: any) {
    state.refundOrder = order
    state.isRefundConfirmationOpen = true
}

function closeRefundConfirmation() {
    state.isRefundConfirmationOpen = false
    if (!state.refundingUuid) {
        state.refundOrder = null
    }
}

async function refundOrder() {
    const order = state.refundOrder
    if (!order || state.refundingUuid) return

    state.refundingUuid = order.uuid
    try {
        await orderService.refundOrder(order.uuid)
        successAlert('Order refunded', `Order #${order.order_no} was refunded successfully.`)
        await fetchOrders()
        if (state.selectedOrder?.uuid === order.uuid) {
            await viewOrder(order)
        }
    } catch (error: any) {
        errorAlert('Could not refund order', error?.message || 'Please try again.')
    } finally {
        state.refundingUuid = ''
        state.refundOrder = null
    }
}

async function viewOrder(order: any) {
    cancelEditPayment()
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

function editPayment(payment: any) {
    state.editingPaymentUuid = payment.uuid
    state.paymentForm.payment_method = payment.payment_method?.value || payment.payment_method || 'cash'
    state.paymentForm.reference = payment.reference || ''
}

function cancelEditPayment() {
    state.editingPaymentUuid = ''
    state.paymentForm.payment_method = 'cash'
    state.paymentForm.reference = ''
}

async function updatePayment(payment: any) {
    if (!state.selectedOrder || state.isUpdatingPayment) return

    state.isUpdatingPayment = true
    try {
        const response = await orderService.updatePayment(state.selectedOrder.uuid, payment.uuid, {
            payment_method: state.paymentForm.payment_method,
            reference: state.paymentForm.reference || null,
        })
        if (response?.data) {
            state.selectedOrder = response.data
        }
        cancelEditPayment()
        await fetchOrders()
        successAlert('Payment updated', 'The payment method was updated successfully.')
    } catch (error: any) {
        errorAlert('Could not update payment', error?.message || 'Please try again.')
    } finally {
        state.isUpdatingPayment = false
    }
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

watch(() => state.dateRange, (value) => {
    if (value.length === 0 || value.length === 2) {
        orderStore.setCurrentPageNumber(1)
        fetchOrders()
    }
}, { deep: true })

function changePageLength(event: any) {
    orderStore.setCurrentPageNumber(1)
    orderStore.setCurrentPageLength(event.target.value)
    fetchOrders()
}

function fullName(user: any) {
    return user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || '-' : '-'
}

function paymentMethods(order: any) {
    return order.payments?.map((payment: any) => paymentMethodLabel(payment.payment_method)).join(', ') || '-'
}

function paymentMethodLabel(method: any) {
    const value = method?.value || method
    return paymentMethodOptions.find(option => option.value === value)?.label || value || '-'
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

// Prices are tax-inclusive: the listed price is what the customer pays, so
// tax is backed out of the post-discount total rather than added on top.
// orderSubtotal + orderTax == orderTotal; orderDiscount is informational
// (how much was taken off the original gross to arrive at orderTotal).
function lineTotal(line: any) {
    return Math.max(0, gross(line) - lineDiscount(line))
}

function lineTax(line: any) {
    const rate = Number(line.tax_percentage) / 100
    return lineTotal(line) * rate / (1 + rate)
}

function orderSubtotal(order: any) {
    return orderTotal(order) - orderTax(order)
}

function orderDiscount(order: any) {
    return order.details?.reduce((sum: number, line: any) => sum + lineDiscount(line), 0) || 0
}

function orderTax(order: any) {
    return order.details?.reduce((sum: number, line: any) => sum + lineTax(line), 0) || 0
}

function orderTotal(order: any) {
    return order?.details?.reduce((sum: number, line: any) => sum + lineTotal(line), 0) || 0
}

function money(value: number | string) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))
}
</script>

<style>
#form-payment-method .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>