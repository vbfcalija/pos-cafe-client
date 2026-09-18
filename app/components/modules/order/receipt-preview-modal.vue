<template>
    <Modal size="sm" title="Receipt preview" :show="props.show" @close="$emit('close')">
        <template #modal-body>
            <div class="flex justify-center">
                <div class="w-[280px] rounded-md border border-dashed border-gray-300 bg-white p-4 font-mono text-[11px] leading-relaxed shadow-sm">
                    <p class="text-center font-bold">{{ runtimeConfig?.public?.appName }}</p>
                    <p v-if="branchName" class="text-center">{{ branchName }}</p>
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
                <FormButton buttonStyle="primary" :disabled="!state.escposData" @click="printReceipt">
                    <Icon name="ph:printer" class="size-4" />
                    {{ state.escposData ? 'Print via Bluetooth' : 'Preparing…' }}
                </FormButton>
            </div>
            <p class="mt-2 text-center text-xs text-gray-400">
                Printing requires the RawBT app installed on this device, paired to the printer.
            </p>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { orderService } from '@/components/api/user/OrderService'
import { useAlert } from '@/composables/alert'
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

const state = reactive({
    isGeneratingPdf: false,
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

const branchName = computed(() => props.order?.shift?.branch?.name || '')
const formattedDate = computed(() => props.order?.date ? moment(props.order.date).format('YYYY-MM-DD HH:mm') : '')

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

// The app is a plain website now, not a packaged native app, so there's no
// bridge for a browser to talk Bluetooth to a classic-SPP thermal printer
// (Web Bluetooth only supports BLE). RawBT bridges that gap: handing it
// ESC/POS bytes via Chrome's "intent:" URL syntax hands the print job to
// that app, which does the real Bluetooth printing — this is RawBT's own
// documented integration (rawbt.ru/intents.html), not a plain `rawbt:` href,
// which Chrome doesn't reliably resolve into an app handoff on its own.
//
// Critically, this must run synchronously inside the click itself — no
// `await` before it. Android/Chrome only honors an app-intent handoff as
// part of a real user gesture, and that gesture is considered "spent" the
// moment an async microtask (like an awaited fetch) runs first, so the
// intent silently gets dropped. That's why the ESC/POS bytes are fetched
// ahead of time (see the `show` watcher above) instead of on click.
//
// There's also no way to get a genuine success/failure signal back from
// this handoff, so this can only confirm the job was *sent to RawBT* —
// never that it actually printed, unlike the (now unreachable) native
// Bluetooth path this used to call.
function printReceipt() {
    if (!state.escposData) {
        state.error = 'Still preparing the receipt — wait a moment and try again.'
        return
    }
    state.error = ''
    // The literal "base64," prefix is required — without it RawBT can't
    // tell the payload apart from plain text and just prints the base64
    // string itself verbatim instead of decoding it into ESC/POS bytes
    // first. Matches escpos-php's own RawbtPrintConnector exactly.
    const intentUrl = `intent:base64,${state.escposData}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`
    window.location.href = intentUrl
    successAlert('Sent to RawBT', 'Check RawBT to confirm the receipt printed.')
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
