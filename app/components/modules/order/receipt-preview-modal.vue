<template>
    <Modal size="sm" title="Receipt preview" :show="props.show" @close="$emit('close')">
        <template #modal-body>
            <div class="flex justify-center">
                <div
                    class="w-[280px] rounded-md border border-dashed border-gray-300 bg-white p-4 font-mono text-[11px] leading-relaxed shadow-sm">
                    <p class="text-center font-bold">{{ runtimeConfig?.public?.appName }}</p>
                    <p v-if="branchName" class="text-center">{{ branchName }}</p>
                    <p v-if="isRefunded"
                        class="mt-2 border border-red-600 py-0.5 text-center text-sm font-bold tracking-widest text-red-600">
                        REFUNDED
                    </p>
                    <hr class="my-2 border-t border-dashed border-gray-400">
                    <p>Order #: {{ props.order?.order_no }}</p>
                    <p>Date: {{ formattedDate }}</p>
                    <p>Cashier: {{ fullName(props.order?.user) }}</p>
                    <p v-if="props.order?.customer">Customer: {{ props.order.customer.name }}</p>
                    <hr class="my-2 border-t border-dashed border-gray-400">
                    <div v-for="line in props.order?.details" :key="line.uuid" class="mb-1.5">
                        <p>{{ lineLabel(line) }}</p>
                        <div class="flex justify-between">
                            <span>{{ line.quantity }} x {{ money(line.price) }}</span>
                            <span>{{ money(lineTotal(line)) }}</span>
                        </div>
                        <div v-if="line.discount" class="flex justify-between text-red-600">
                            <span>&nbsp;&nbsp;{{ line.discount.name }}</span>
                            <span>-{{ money(lineDiscount(line)) }}</span>
                        </div>
                    </div>
                    <hr class="my-2 border-t border-dashed border-gray-400">
                    <div class="flex justify-between">
                        <span>Subtotal</span><span>{{ money(orderSubtotal) }}</span>
                    </div>
                    <div class="flex justify-between text-red-600">
                        <span>Discount</span><span>-{{ money(orderDiscount) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Tax</span><span>{{ money(orderTax) }}</span>
                    </div>
                    <div class="flex justify-between font-bold">
                        <span>TOTAL</span><span>{{ money(orderTotal) }}</span>
                    </div>
                    <hr class="my-2 border-t border-dashed border-gray-400">
                    <p>Payment: {{ paymentMethods }}</p>
                    <template v-if="isRefunded">
                        <hr class="my-2 border-t border-dashed border-gray-400">
                        <div class="flex justify-between font-bold text-red-600">
                            <span>REFUNDED</span><span>-{{ money(orderTotal) }}</span>
                        </div>
                        <p>Refunded: {{ formattedRefundDate }}</p>
                        <p v-if="props.order?.refunded_by">Refunded by: {{ fullName(props.order.refunded_by) }}</p>
                    </template>
                    <p class="mt-3 text-center font-bold">Thank you!</p>
                    <p class="text-center">Please come again.</p>
                </div>
            </div>
            <Alert type="danger" :text="state.error" class="mt-4" v-if="state.error && state.error.length > 0" />
            <div class="mt-5 grid grid-cols-2 gap-3">
                <FormButton buttonStyle="secondary" :disabled="state.isGeneratingPdf" @click="downloadPdf">
                    <Icon name="ph:file-pdf" class="size-4" />
                    {{ state.isGeneratingPdf ? 'Generating…' : 'Save as PDF' }}
                </FormButton>
                <FormButton buttonStyle="primary" :disabled="!state.escposData || state.isPrinting"
                    @click="printReceipt">
                    <Icon name="ph:printer" class="size-4" />
                    {{ printButtonLabel }}
                </FormButton>
            </div>
            <p v-if="printMethod === 'rawbt'" class="mt-2 text-center text-xs text-gray-400">
                Printing requires the RawBT app installed on this device, paired to the printer.
            </p>
            <p v-else-if="printMethod === 'bluetooth'" class="mt-2 text-center text-xs text-gray-400">
                <template v-if="connectedPrinterName">
                    Printer: <span class="font-medium text-gray-600">{{ connectedPrinterName }}</span> ·
                    <button type="button" class="text-primary-600 underline" @click="forgetPrinter">Change</button>
                </template>
                <template v-else>
                    Turn on the printer — you'll pick it from the list the first time you print.
                </template>
            </p>
            <p v-else class="mt-2 text-center text-xs text-gray-500">
                To print on iPhone/iPad, open this site in the
                <a href="https://apps.apple.com/app/bluefy-web-ble-browser/id1492822055" target="_blank" rel="noopener"
                    class="text-primary-600 underline">
                    Bluefy browser
                </a>(free) — Safari can't reach Bluetooth printers.
            </p>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { orderService } from '@/components/api/user/OrderService'
import { useAlert } from '@/composables/alert'
import { useReceiptPrinter } from '@/composables/receiptPrinter'
import moment from 'moment'

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    order: {
        type: Object,
        required: false,
        default: null,
    },
})
const emit = defineEmits(['close'])

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { printMethod, connectedPrinterName, sendToPrinter, forgetPrinter } = useReceiptPrinter()

const state = reactive({
    isGeneratingPdf: false,
    isPrinting: false,
    error: '',
    escposData: '' as string,
})

// RawBT's own intent handoff only fires when triggered synchronously inside
// a real user gesture (a click handler) — Android/Chrome silently drops it
// once an `await` has happened first, which is exactly what broke this the
// first time around. Fetching the ESC/POS bytes as soon as the modal opens
// (rather than when Print is clicked) means the click handler itself can
// stay fully synchronous.
watch(() => props.show, async (show) => {
    if (!show || !props.order?.uuid) return
    state.escposData = ''
    try {
        const response = await orderService.getReceiptEscPos(props.order.uuid)
        state.escposData = response.data
    } catch {
        // Print button will just show its own error if clicked with nothing loaded.
    }
}, { immediate: true })

const printButtonLabel = computed(() => {
    if (!state.escposData) return 'Preparing…'
    if (state.isPrinting) return 'Printing…'
    return printMethod.value === 'rawbt' ? 'Print via RawBT' : 'Print via Bluetooth'
})

const isRefunded = computed(() => !!props.order?.refunded_at)
const formattedRefundDate = computed(() => props.order?.refunded_at ? moment(props.order.refunded_at).format('YYYY-MM-DD HH:mm') : '')

const branchName = computed(() => props.order?.shift?.branch?.name || '')
const formattedDate = computed(() => props.order?.created_at ? moment(props.order.created_at).format('YYYY-MM-DD HH:mm') : '')

const paymentMethods = computed(() => {
    return props.order?.payments?.map((payment: any) => paymentMethodLabel(payment.payment_method)).join(', ') || '-'
})

// Same tax-inclusive math used across pos/index.vue, orders/index.vue,
// overview/index.vue, and reports/index.vue — duplicated here rather than
// shared, matching how this codebase re-implements it per page/component.
function gross(line: any) {
    return Number(line.price) * Number(line.quantity)
}

function lineDiscount(line: any) {
    if (!line.discount) return 0
    const lineGross = gross(line)
    return line.discount.type === 'percentage'
        ? lineGross * Number(line.discount.value) / 100
        : Math.min(lineGross, Number(line.discount.value))
}

function lineTotal(line: any) {
    return Math.max(0, gross(line) - lineDiscount(line))
}

function lineTax(line: any) {
    const rate = Number(line.tax_percentage) / 100
    return lineTotal(line) * rate / (1 + rate)
}

const orderTotal = computed(() => {
    return props.order?.details?.reduce((total: number, line: any) => total + lineTotal(line), 0) ?? 0
})
const orderTax = computed(() => {
    return props.order?.details?.reduce((total: number, line: any) => total + lineTax(line), 0) ?? 0
})
const orderDiscount = computed(() => {
    return props.order?.details?.reduce((total: number, line: any) => total + lineDiscount(line), 0) ?? 0
})
const orderSubtotal = computed(() => orderTotal.value - orderTax.value)

function lineLabel(line: any) {
    const productName = line.product_variant?.product?.name || 'Product'
    const variantName = line.product_variant?.name
    return variantName && variantName !== 'Regular' ? `${productName} (${variantName})` : productName
}

function fullName(user: any) {
    return user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || '-' : '-'
}

function paymentMethodLabel(method: any) {
    const value = method?.value || method
    const labels: Record<string, string> = { cash: 'Cash', card: 'Card', gcash: 'GCash', gotyme: 'GoTyme' }
    return labels[value] || value || '-'
}

function money(value: number | string) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))
}

// See composables/receiptPrinter.ts. Nothing may be awaited before
// sendToPrinter() starts: Android only honors the RawBT intent, and iOS only
// opens the Bluetooth printer picker, inside a real user gesture — which is
// why the ESC/POS bytes are fetched ahead of time (the `show` watcher above).
async function printReceipt() {
    if (!state.escposData) {
        state.error = 'Still preparing the receipt — wait a moment and try again.'
        return
    }
    state.error = ''
    state.isPrinting = true
    try {
        await sendToPrinter(state.escposData)
    } catch (error: any) {
        state.error = error?.message || 'Could not print the receipt.'
    } finally {
        state.isPrinting = false
    }
}

async function downloadPdf() {
    if (state.isGeneratingPdf || !props.order?.uuid) return
    state.isGeneratingPdf = true
    state.error = ''
    try {
        const result = await orderService.downloadReceiptPdf(props.order.uuid)
        successAlert('Success', result.deliveredVia === 'share' ? 'Choose where to save the receipt PDF.' : 'Receipt PDF downloaded.')
    } catch (error: any) {
        state.error = error?.message || 'Could not generate the receipt PDF. Please try again.'
    } finally {
        state.isGeneratingPdf = false
    }
}
</script>
