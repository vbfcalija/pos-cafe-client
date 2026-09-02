<template>
    <div>

        <Head>
            <Title>POS - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Point of sale</template>

            <Alert v-if="state.error?.message" type="danger" :text="state.error.message" class="mb-4" />

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <section class="min-w-0 rounded-xl bg-white p-5 shadow-sm">
                        <div v-if="hasOpenShift"
                            class="mb-5 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                            <div>
                                <p class="font-semibold text-green-900">
                                    {{ currentShift?.name }}
                                </p>
                                <p class="text-sm text-green-700">
                                    Shift opened {{ formatDateToReadable(currentShift?.date) }}
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                    Open shift
                                </span>
                                <FormButton buttonStyle="danger" buttonSize="xs" :disabled="state.isClosingShift"
                                    @click="state.isCloseShiftConfirmationOpen = true">
                                    <Icon name="ph:stop-circle" class="size-4" />
                                    {{ state.isClosingShift ? 'Closing…' : 'Close shift' }}
                                </FormButton>
                            </div>
                        </div>

                        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 class="text-lg font-semibold text-gray-900">Products</h2>
                                <p class="text-sm text-gray-500">
                                    Choose a product, select its variant, then add it to the order.
                                </p>
                            </div>
                            <div class="relative w-full sm:max-w-sm">
                                <Icon name="ph:magnifying-glass" class="absolute left-3 top-3 size-5 text-gray-400" />
                                <input v-model="state.productSearch" type="search"
                                    placeholder="Search product or variant"
                                    class="h-11 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" />
                            </div>
                        </div>

                        <div v-if="groupedProducts.length" class="space-y-8">
                            <section v-for="category in groupedProducts" :key="category.uuid">
                                <div class="mb-3 flex items-center gap-2">
                                    <span class="size-3 rounded-full border border-gray-200"
                                        :style="{ backgroundColor: category.color }" />
                                    <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
                                    <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                        {{ category.products.length }} product{{ category.products.length === 1 ? '' :
                                            's' }}
                                    </span>
                                </div>
                                <div class="grid gap-4 sm:grid-cols-2">
                                    <article v-for="product in category.products" :key="product.uuid"
                                        class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                                        <div class="h-1.5" :style="{ backgroundColor: product.color || '#dbeafe' }" />
                                        <div class="p-4">
                                            <div class="mb-4 flex items-start justify-between gap-3">
                                                <div class="flex min-w-0 items-center gap-3">
                                                    <div
                                                        class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                        <Icon name="ph:package" class="size-6" />
                                                    </div>
                                                    <div class="min-w-0">
                                                        <h4 class="truncate font-semibold text-gray-900">
                                                            {{ product.name }}
                                                        </h4>
                                                        <p class="truncate text-xs text-gray-500">
                                                            {{ product.sku || 'No SKU' }}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span
                                                    class="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                                                    {{ product.variants.length }} variant{{ product.variants.length ===
                                                        1 ? '' : 's'
                                                    }}
                                                </span>
                                            </div>

                                            <template v-if="product.variants.length">
                                                <div class="space-y-2">
                                                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Choose a variant
                                                    </p>
                                                    <div class="grid grid-cols-2 gap-2" role="group"
                                                        :aria-label="`${product.name} variants`">
                                                        <button v-for="variant in product.variants" :key="variant.uuid"
                                                            type="button"
                                                            class="group relative flex min-h-16 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition"
                                                            :class="state.selectedVariantByProduct[product.uuid] === variant.uuid
                                                                ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary/20 shadow-sm'
                                                                : 'border-gray-200 bg-white text-gray-600 hover:border-primary/50 hover:bg-blue-50/40'"
                                                            :aria-pressed="state.selectedVariantByProduct[product.uuid] === variant.uuid"
                                                            @click="state.selectedVariantByProduct[product.uuid] = variant.uuid">
                                                            <span class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                                                                :class="variantIconClass(variant)">
                                                                <Icon :name="variantIcon(variant)" class="size-4" />
                                                            </span>
                                                            <span class="min-w-0 flex-1">
                                                                <span class="block truncate text-xs font-semibold text-gray-900">
                                                                    {{ variantDisplayName(variant) }}
                                                                </span>
                                                                <span class="mt-0.5 flex items-center justify-between gap-2 text-[11px] font-medium text-gray-500">
                                                                    <span>{{ variantSize(variant) || 'Regular' }}</span>
                                                                    <span>{{ money(variant.price) }}</span>
                                                                </span>
                                                            </span>
                                                            <Icon v-if="state.selectedVariantByProduct[product.uuid] === variant.uuid"
                                                                name="ph:check-circle-fill"
                                                                class="absolute right-2 top-2 size-4 text-primary" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="mt-4 grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-4 border-t border-gray-100 pt-4">
                                                    <div class="min-w-0">
                                                        <p class="text-[11px] text-gray-500">Selected variant</p>
                                                        <p class="truncate text-sm font-semibold text-gray-900">
                                                            {{ selectedVariant(product)?.name || 'Select a variant' }}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p class="text-[11px] text-gray-500">Price</p>
                                                        <p class="text-lg font-bold text-gray-900">
                                                            {{ money(selectedVariant(product)?.price || product.price) }}
                                                        </p>
                                                    </div>
                                                    <FormButton buttonStyle="primary" buttonSize="xs"
                                                        class="shrink-0"
                                                        :disabled="!hasOpenShift || !state.selectedVariantByProduct[product.uuid]"
                                                        @click="addSelectedProduct(product)">
                                                        <Icon name="ph:plus" class="size-4" /> Add
                                                    </FormButton>
                                                </div>
                                            </template>
                                            <div v-else
                                                class="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-5 text-center">
                                                <Icon name="ph:warning-circle" class="mx-auto size-5 text-gray-400" />
                                                <p class="mt-1 text-xs text-gray-500">No active variants available</p>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            </section>
                        </div>
                        <div v-else
                            class="rounded-xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-500">
                            No products found.
                        </div>
                    </section>

                    <aside class="rounded-xl bg-white p-5 shadow-sm xl:sticky xl:top-20 xl:self-start">
                        <div class="mb-4 flex items-center justify-between">
                            <div>
                                <h2 class="text-lg font-semibold text-gray-900">
                                    Current order
                                </h2>
                                <p class="text-sm text-gray-500">
                                    {{ cartQuantity }} item{{ cartQuantity === 1 ? '' : 's' }}
                                </p>
                            </div>
                            <button v-if="state.cart.length" type="button"
                                class="text-xs font-medium text-red-600 hover:text-red-700" @click="clearCart">
                                Clear
                            </button>
                        </div>

                        <div class="max-h-[42vh] space-y-3 overflow-y-auto pr-1">
                            <div v-for="line in state.cart" :key="line.product_variant_uuid"
                                class="rounded-lg border border-gray-200 p-3">
                                <div class="flex items-start justify-between gap-3">
                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-semibold text-gray-900">
                                            {{ line.product_name }}
                                        </p>
                                        <p class="truncate text-xs text-gray-500">
                                            {{ line.variant_name }} · {{ money(line.price) }}
                                        </p>
                                    </div>
                                    <button type="button" class="text-gray-400 hover:text-red-600"
                                        @click="removeLine(line.product_variant_uuid)">
                                        <Icon name="ph:trash" class="size-4" />
                                    </button>
                                </div>
                                <div class="mt-3 flex items-center justify-between gap-3">
                                    <div class="inline-flex items-center rounded-lg border border-gray-200">
                                        <button type="button" class="px-2 py-1.5 text-gray-600"
                                            @click="decreaseQuantity(line)">
                                            −
                                        </button>
                                        <span class="min-w-8 text-center text-sm font-medium">
                                            {{ line.quantity }}
                                        </span>
                                        <button type="button" class="px-2 py-1.5 text-gray-600"
                                            @click="line.quantity++">
                                            +
                                        </button>
                                    </div>
                                    <span class="text-sm font-semibold">
                                        {{ money(lineTotal(line)) }}
                                    </span>
                                </div>
                                <div class="mt-3">
                                    <FormSelect :options="discountOptions" :searchable="false" :canClear="false"
                                        v-model="line.discount_uuid" />
                                </div>
                            </div>
                            <div v-if="!state.cart.length"
                                class="rounded-xl border border-dashed border-gray-300 py-12 text-center">
                                <Icon name="ph:shopping-cart-simple" class="mx-auto size-9 text-gray-300" />
                                <p class="mt-2 text-sm text-gray-500">Your cart is empty.</p>
                            </div>
                        </div>

                        <div class="mt-5 space-y-3 border-t border-gray-200 pt-5">
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">
                                    Customer (optional)
                                </p>
                                <FormSelect :options="customerOptions" v-model="state.customer_uuid" />
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="space-y-1">
                                    <p class="text-sm text-gray-600">Payment</p>
                                    <FormSelect :options="paymentMethodOptions" :searchable="false" :canClear="false"
                                        v-model="state.payment_method" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="reference" label="Reference" />
                                    <input id="reference" v-model="state.reference" type="text" placeholder="Optional"
                                        class="pos-select px-3" />
                                </div>
                            </div>
                            <div v-if="state.payment_method === 'cash'" class="space-y-1">
                                <FormLabel for="cash_tender" label="Cash tender" />
                                <FormNumberField id="cash_tender" name="cash_tender" placeholder="Enter amount received"
                                    :min="0" v-model="state.cash_tender" />
                                <p v-if="cashShortfall > 0 && Number(state.cash_tender) > 0"
                                    class="text-xs text-red-600">
                                    Additional {{ money(cashShortfall) }} is required.
                                </p>
                            </div>
                        </div>

                        <div class="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-500">Subtotal</span>
                                <span>{{ money(subtotal) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Discount</span>
                                <span class="text-red-600">− {{ money(discountTotal) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Tax</span>
                                <span>{{ money(taxTotal) }}</span>
                            </div>
                            <div class="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
                                <span>Total</span>
                                <span>{{ money(grandTotal) }}</span>
                            </div>
                            <template v-if="state.payment_method === 'cash'">
                                <div class="flex justify-between pt-1">
                                    <span class="text-gray-500">Cash tender</span>
                                    <span>{{ money(state.cash_tender) }}</span>
                                </div>
                                <div class="flex justify-between text-base font-bold text-green-700">
                                    <span>Change</span>
                                    <span>{{ money(cashChange) }}</span>
                                </div>
                            </template>
                        </div>

                        <FormButton buttonStyle="primary" class="mt-5 w-full"
                            :disabled="!canCheckout || state.isSubmitting" @click="checkout">
                            <Icon name="ph:check-circle" class="size-5" />
                            {{ state.isSubmitting ? 'Processing…' : `Charge ${money(grandTotal)}` }}
                        </FormButton>
                    </aside>
                </div>
            </LoadingSpinner>

            <ModulesShiftStartModal :show="state.isShiftModalOpen" @created="handleShiftCreated" />

            <DialogConfirmation :isModalOpen="state.isCloseShiftConfirmationOpen" title="Close shift"
                message="Are you sure you want to close the current shift?"
                @close="state.isCloseShiftConfirmationOpen = false" @confirm="closeShift" />

            <Modal size="sm" title="Order completed" :show="state.isSuccessOpen" @close="state.isSuccessOpen = false">
                <template #modal-body>
                    <div class="text-center">
                        <Icon name="ph:check-circle-fill" class="mx-auto size-14 text-green-600" />
                        <p class="mt-3 text-lg font-semibold">Sale recorded successfully</p>
                        <p class="mt-1 text-sm text-gray-500">Order #{{ state.completedOrder?.order_no }}</p>
                        <div v-if="state.completedPaymentMethod === 'cash'"
                            class="mt-4 rounded-lg bg-green-50 p-4 text-green-800">
                            <p class="text-xs font-medium uppercase tracking-wide">Change to customer</p>
                            <p class="mt-1 text-2xl font-bold">{{ money(state.completedChange) }}</p>
                        </div>
                        <FormButton buttonStyle="primary" class="mt-5 w-full" @click="state.isSuccessOpen = false">New
                            order</FormButton>
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { customerService } from '@/components/api/user/CustomerService'
import { discountService } from '@/components/api/user/DiscountService'
import { orderService } from '@/components/api/user/OrderService'
import { productService } from '@/components/api/user/ProductService'
import { productVariantService } from '@/components/api/user/ProductVariantService'
import { shiftService } from '@/components/api/user/ShiftService'
import { useUserStore } from '@/store/user'
import type { CartLine, Error } from '@/types'

const noDiscountValue = '__none__'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    shifts: [] as any[],
    customers: [] as any[],
    discounts: [] as any[],
    products: [] as any[],
    productVariants: [] as any[],
    selectedVariantByProduct: {} as Record<string, string>,
    cart: [] as CartLine[],
    shift_uuid: '',
    customer_uuid: '',
    payment_method: 'cash',
    reference: '',
    cash_tender: '',
    productSearch: '',
    error: {} as Error,
    isPageLoading: false,
    isSubmitting: false,
    isSuccessOpen: false,
    completedOrder: null as any,
    completedChange: 0,
    completedPaymentMethod: '',
    isShiftModalOpen: false,
    isCloseShiftConfirmationOpen: false,
    isClosingShift: false,
})

onMounted(() => { fetchPosData() })

const openShifts = computed(() => state.shifts.filter((shift: any) => {
    const belongsToUser = !userStore.getUser?.uuid || shift.user?.uuid === userStore.getUser.uuid
    return shift.is_open && belongsToUser
}))
const currentShift = computed(() => openShifts.value.find((shift: any) => shift.uuid === state.shift_uuid))

const customerOptions = computed(() => state.customers.map((customer: any) => ({
    label: customer.name,
    value: customer.uuid,
})))

const discountOptions = computed(() => [
    { label: 'No discount', value: noDiscountValue },
    ...state.discounts.map((discount: any) => ({
        label: `${discount.name} (${discountLabel(discount)})`,
        value: discount.uuid,
    })),
])

const paymentMethodOptions = [
    { label: 'Cash', value: 'cash' },
    { label: 'Card', value: 'card' },
    { label: 'GCash', value: 'gcash' },
    { label: 'GoTyme', value: 'gotyme' },
]

const hasOpenShift = computed(() => Boolean(state.shift_uuid && openShifts.value.some(
    (shift: any) => shift.uuid === state.shift_uuid
)))

const filteredProducts = computed(() => {
    const search = state.productSearch.trim().toLowerCase()
    return state.products.map((product: any) => ({
        ...product,
        variants: state.productVariants.filter((variant: any) => variant.is_active && variant.product?.uuid === product.uuid),
    })).filter((product: any) => {
        if (!search) return true
        const variants = product.variants.map((variant: any) => variant.name).join(' ')
        return `${product.name} ${product.sku} ${product.barcode} ${variants}`.toLowerCase().includes(search)
    })
})

const groupedProducts = computed(() => {
    const groups = new Map<string, { uuid: string, name: string, color: string, products: any[] }>()

    filteredProducts.value.forEach((product: any) => {
        const category = product.category
        const uuid = category?.uuid ?? 'uncategorized'
        if (!groups.has(uuid)) {
            groups.set(uuid, {
                uuid,
                name: category?.name ?? 'Uncategorized',
                color: category?.color || '#e5e7eb',
                products: [],
            })
        }
        groups.get(uuid)?.products.push(product)
    })

    return Array.from(groups.values())
        .map(category => ({ ...category, products: category.products.sort((a, b) => a.name.localeCompare(b.name)) }))
        .sort((a, b) => a.name.localeCompare(b.name))
})
const cartQuantity = computed(() => state.cart.reduce((total, line) => total + line.quantity, 0))
const subtotal = computed(() => state.cart.reduce((total, line) => total + line.price * line.quantity, 0))
const discountTotal = computed(() => state.cart.reduce((total, line) => total + lineDiscount(line), 0))
const taxTotal = computed(() => state.cart.reduce((total, line) => {
    const taxable = Math.max(0, line.price * line.quantity - lineDiscount(line))
    return total + taxable * (line.tax_percentage / 100)
}, 0))
const grandTotal = computed(() => subtotal.value - discountTotal.value + taxTotal.value)
const cashChange = computed(() => Math.max(0, Number(state.cash_tender || 0) - grandTotal.value))
const cashShortfall = computed(() => Math.max(0, grandTotal.value - Number(state.cash_tender || 0)))
const hasSufficientPayment = computed(() => state.payment_method !== 'cash' || Number(state.cash_tender || 0) >= grandTotal.value)
const canCheckout = computed(() => Boolean(
    hasOpenShift.value && state.cart.length && hasSufficientPayment.value
))

async function fetchPosData() {
    state.error = {}
    state.isPageLoading = true
    const params = { page: 1, page_length: 500, sortField: 'name', sortOrder: 'ascend', search: [] }
    try {
        const [shifts, customers, discounts, products, productVariants] = await Promise.all([
            shiftService.getShifts({ ...params, sortField: 'date', sortOrder: 'descend' }),
            customerService.getCustomers(params),
            discountService.getDiscounts(params),
            productService.getProducts(params),
            productVariantService.getProductVariants(params),
        ])
        state.shifts = shifts?.data ?? []
        state.customers = customers?.data ?? []
        state.discounts = discounts?.data ?? []
        state.products = products?.data ?? []
        state.productVariants = productVariants?.data ?? []
        initializeProductVariants()
        selectLatestOpenShift()
        state.isShiftModalOpen = !hasOpenShift.value
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function selectLatestOpenShift() {
    state.shift_uuid = openShifts.value[0]?.uuid ?? ''
}

function handleShiftCreated(shift: any) {
    const createdShift = {
        ...shift,
        user: shift.user || userStore.getUser,
    }
    state.shifts.unshift(createdShift)
    state.shift_uuid = createdShift.uuid
    state.isShiftModalOpen = false
}

async function closeShift() {
    if (!currentShift.value || state.isClosingShift) return
    state.error = {}
    state.isClosingShift = true
    try {
        await shiftService.updateShift(currentShift.value.uuid, { is_open: false })
        currentShift.value.is_open = false
        state.shift_uuid = ''
        state.cart = []
        state.isShiftModalOpen = true
    } catch (error: any) {
        state.error = error
    } finally {
        state.isClosingShift = false
    }
}

function addToCart(variant: any) {
    const existing = state.cart.find(line => line.product_variant_uuid === variant.uuid)
    if (existing) { existing.quantity++; return }
    state.cart.push({
        product_variant_uuid: variant.uuid,
        product_name: variant.product?.name ?? 'Product', variant_name: variant.name,
        price: Number(variant.price), tax_percentage: Number(variant.product?.tax_rate?.percentage ?? 0),
        quantity: 1, discount_uuid: noDiscountValue,
    })
}

function initializeProductVariants() {
    state.products.forEach((product: any) => {
        const firstVariant = state.productVariants.find((variant: any) => variant.is_active && variant.product?.uuid === product.uuid)
        state.selectedVariantByProduct[product.uuid] = firstVariant?.uuid ?? ''
    })
}

function selectedVariant(product: any) {
    return product.variants.find((variant: any) => variant.uuid === state.selectedVariantByProduct[product.uuid])
}

function isColdVariant(variant: any) {
    return /iced|cold|frozen|chilled/i.test(variant.name)
}

function isHotVariant(variant: any) {
    return /hot|warm|heated/i.test(variant.name)
}

function variantIcon(variant: any) {
    if (isColdVariant(variant)) return 'ph:snowflake'
    if (isHotVariant(variant)) return 'ph:coffee'
    return 'ph:plus-circle'
}

function variantIconClass(variant: any) {
    if (isColdVariant(variant)) return 'bg-sky-100 text-sky-600'
    if (isHotVariant(variant)) return 'bg-orange-100 text-orange-600'
    return 'bg-emerald-100 text-emerald-600'
}

function variantSize(variant: any) {
    return variant.name.match(/\b\d+(?:\.\d+)?\s*(?:oz|ml|l)\b/i)?.[0] ?? ''
}

function variantDisplayName(variant: any) {
    const size = variantSize(variant)
    return size ? variant.name.replace(size, '').trim() : variant.name
}

function addSelectedProduct(product: any) {
    const variant = selectedVariant(product)
    if (variant) {
        addToCart({ ...variant, product })
    }
}

function decreaseQuantity(line: CartLine) {
    if (line.quantity > 1) line.quantity--
    else removeLine(line.product_variant_uuid)
}

function removeLine(uuid: string) {
    state.cart = state.cart.filter(line => line.product_variant_uuid !== uuid)
}

function clearCart() {
    state.cart = []
}

function selectedDiscount(line: CartLine) {
    return state.discounts.find(discount => discount.uuid === line.discount_uuid)
}

function lineDiscount(line: CartLine) {
    const discount = selectedDiscount(line)
    if (!discount) return 0
    const gross = line.price * line.quantity
    return discount.type === 'percentage' ? gross * Number(discount.value) / 100 : Math.min(gross, Number(discount.value))
}

function lineTotal(line: CartLine) {
    const taxable = Math.max(0, line.price * line.quantity - lineDiscount(line))
    return taxable + taxable * (line.tax_percentage / 100)
}

function discountLabel(discount: any) {
    return discount.type === 'percentage' ? `${discount.value}%` : money(discount.value)
}

function money(value: number | string) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))
}

async function checkout() {
    if (!canCheckout.value || state.isSubmitting) return
    state.error = {}
    state.isSubmitting = true
    try {
        const params = {
            shift_uuid: state.shift_uuid,
            customer_uuid: state.customer_uuid || null,
            lines: state.cart.map(line => ({
                product_variant_uuid: line.product_variant_uuid, quantity: line.quantity,
                discount_uuid: line.discount_uuid === noDiscountValue ? null : line.discount_uuid,
            })),
            payments: [{ payment_method: state.payment_method, reference: state.reference || null }],
        }
        const response = await orderService.saveOrder(params)
        if (response?.data) {
            state.completedOrder = response.data
            state.completedPaymentMethod = state.payment_method
            state.completedChange = state.payment_method === 'cash' ? cashChange.value : 0
            state.cart = []
            state.customer_uuid = ''
            state.reference = ''
            state.cash_tender = ''
            state.isSuccessOpen = true
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSubmitting = false
}
</script>

<style scoped>
.pos-select {
    height: 2.75rem;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid rgb(229 231 235);
    background: white;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    font-size: 0.875rem;
    outline: none;
}

.pos-select:focus {
    border-color: var(--color-primary, #437dfb);
}
</style>
