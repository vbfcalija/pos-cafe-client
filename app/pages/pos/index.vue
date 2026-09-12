<template>
    <div>

        <Head>
            <Title>POS - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Point of sale</template>

            <Alert v-if="state.error?.message" type="danger" :text="state.error.message" class="mb-4" />

            <LoadingSpinner :isActive="state.isPageLoading">
                <div
                    class="pos-workspace grid gap-5 rounded-2xl bg-primary-25 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_420px]">
                    <section class="min-w-0 rounded-2xl border border-primary-100 bg-white p-4 shadow-sm sm:p-5">
                        <div v-if="hasOpenShift"
                            class="mb-6 rounded-xl border border-primary-100 bg-white p-3 shadow-sm sm:p-4">
                            <div class="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                                <div class="flex items-center gap-2">
                                    <span class="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                                    <p class="text-xs font-bold uppercase tracking-wider text-primary-700">Active shift
                                    </p>
                                    <span class="text-[11px] font-medium text-gray-400">
                                        {{ openShiftOptions.length }}
                                        open
                                    </span>
                                </div>
                                <p class="truncate text-xs text-gray-500">
                                    <Icon name="ph:user-circle" class="mr-1 inline size-4 text-primary-400" />
                                    {{ fullName(userStore.getUser) }}
                                </p>
                            </div>
                            <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                <div class="min-w-0">
                                    <FormLabel for="active-shift" label="Transact on shift" class="sr-only" />
                                    <FormSelect id="active-shift" :options="openShiftOptions" :searchable="false"
                                        :canClear="false" v-model="state.shift_uuid" />
                                </div>
                                <div class="grid grid-cols-2 gap-2">
                                    <FormButton buttonStyle="action" buttonSize="xs" class="min-h-9"
                                        @click="state.isShiftModalOpen = true">
                                        <Icon name="ph:plus" class="size-4" />
                                        New shift
                                    </FormButton>
                                    <FormButton v-if="canManageCurrentShift" buttonStyle="danger" buttonSize="xs"
                                        class="min-h-9" :disabled="state.isClosingShift"
                                        @click="state.isCloseShiftConfirmationOpen = true">
                                        <Icon name="ph:stop-circle" class="size-4" />
                                        {{ state.isClosingShift ? 'Closing…' : 'Close shift' }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>

                        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">Menu</p>
                                <h2 class="mt-1 text-xl font-bold text-gray-900">Choose products</h2>
                                <p class="text-sm text-gray-500">
                                    Choose a product, select its variant, then add it to the order.
                                </p>
                            </div>
                            <div class="relative w-full sm:max-w-sm">
                                <Icon name="ph:magnifying-glass" class="absolute left-3 top-3 size-5 text-gray-400" />
                                <input v-model="state.productSearch" type="search"
                                    placeholder="Search product or variant"
                                    class="h-11 w-full rounded-xl border border-primary-100 bg-primary-25 pl-10 pr-4 text-sm shadow-sm transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100" />
                            </div>
                        </div>

                        <div v-if="categoryFilters.length" class="mb-5 overflow-visible pb-1">
                            <div class="flex min-w-0 flex-wrap items-center gap-1.5" role="group"
                                aria-label="Filter products by category">
                                <button v-for="category in categoryFilters" :key="category.uuid" type="button"
                                    class="inline-flex min-h-8 items-center gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition active:scale-[0.98] sm:min-h-9 sm:gap-1.5 sm:px-3 sm:text-xs"
                                    :class="[
                                        category.uuid === 'all'
                                            ? (state.selectedCategory === category.uuid
                                                ? 'border-primary bg-primary text-white shadow-sm'
                                                : 'border-primary-100 bg-primary-25 text-gray-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700')
                                            : 'border-transparent hover:opacity-90',
                                        state.selectedCategory === category.uuid && category.uuid !== 'all'
                                            ? 'shadow-sm ring-2 ring-primary-200 ring-offset-1'
                                            : ''
                                    ]" :style="category.uuid === 'all' ? undefined : {
                                        backgroundColor: category.color,
                                        borderColor: category.color,
                                        color: categoryTextColor(category.color),
                                    }" :aria-pressed="state.selectedCategory === category.uuid"
                                    @click="state.selectedCategory = category.uuid">
                                    {{ category.name }}
                                    <span class="rounded-full px-1.5 py-0.5 text-[10px] sm:text-[11px]" :class="category.uuid !== 'all'
                                        ? 'bg-white/70 text-gray-700'
                                        : (state.selectedCategory === category.uuid
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-100 text-gray-500')">
                                        {{ category.count }}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div v-if="groupedProducts.length" class="space-y-8">
                            <section v-for="category in groupedProducts" :key="category.uuid"
                                class="rounded-2xl bg-primary-25/70 p-3 sm:p-4">
                                <div class="mb-3 flex items-center gap-2">
                                    <span class="size-3 rounded-full border border-gray-200"
                                        :style="{ backgroundColor: category.color }" />
                                    <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
                                    <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                        {{
                                            category.products.length }} product
                                        {{ category.products.length === 1 ? '' : 's' }}
                                    </span>
                                </div>
                                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    <article v-for="product in category.products" :key="product.uuid"
                                        class="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md">
                                        <div class="h-1.5" :style="{ backgroundColor: category.color || '#c99d7e' }" />
                                        <div class="p-4">
                                            <div class="mb-4 flex items-start justify-between gap-3">
                                                <div class="flex min-w-0 items-center gap-3">
                                                    <div
                                                        class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
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
                                                    <p
                                                        class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Choose a variant
                                                    </p>
                                                    <div class="grid gap-2"
                                                        :class="product.variants.length === 1 ? 'grid-cols-1' : 'grid-cols-2'"
                                                        role="group" :aria-label="`${product.name} variants`">
                                                        <button v-for="variant in product.variants" :key="variant.uuid"
                                                            type="button"
                                                            class="group flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99]"
                                                            :class="state.selectedVariantByProduct[product.uuid] === variant.uuid
                                                                ? 'shadow-sm ring-1'
                                                                : 'bg-white text-gray-600 hover:opacity-90'"
                                                            :style="variantCategoryStyle(category.color,
                                                                state.selectedVariantByProduct[product.uuid] === variant.uuid)"
                                                            :aria-pressed="state.selectedVariantByProduct[product.uuid] === variant.uuid"
                                                            @click="state.selectedVariantByProduct[product.uuid] = variant.uuid">
                                                            <span
                                                                class="flex size-9 shrink-0 items-center justify-center rounded-full"
                                                                :style="variantCategoryIconStyle(category.color)">
                                                                <Icon :name="variantIcon(category)"
                                                                    class="size-[18px]" />
                                                            </span>
                                                            <span class="min-w-0 flex-1">
                                                                <span
                                                                    class="block truncate text-sm font-semibold text-gray-900">
                                                                    {{ variantDisplayName(variant) }}
                                                                </span>
                                                                <span
                                                                    class="mt-0.5 block truncate text-[11px] font-medium text-gray-500">
                                                                    {{ variantSize(variant) || 'Regular' }}
                                                                </span>
                                                            </span>
                                                            <span class="flex shrink-0 flex-col items-end gap-1">
                                                                <span class="text-sm font-bold text-primary-800">
                                                                    {{ money(variant.price) }}
                                                                </span>
                                                                <Icon
                                                                    v-if="state.selectedVariantByProduct[product.uuid] === variant.uuid"
                                                                    name="ph:check-circle-fill" class="size-4"
                                                                    :style="{ color: category.color || '#6e4430' }" />
                                                                <span v-else class="size-4 rounded-full border"
                                                                    :style="{ borderColor: categoryColorRgba(category.color, 0.45) }" />
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div
                                                    class="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 border-t border-primary-100 pt-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                                                    <div class="min-w-0">
                                                        <p class="text-[11px] text-gray-500">Selected variant</p>
                                                        <p class="truncate text-sm font-semibold text-gray-900">
                                                            {{ selectedVariant(product)?.name || 'Select a variant' }}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p class="text-[11px] text-gray-500">Price</p>
                                                        <p class="text-lg font-bold text-gray-900">
                                                            {{
                                                                money(selectedVariant(product)?.price || product.price)
                                                            }}
                                                        </p>
                                                    </div>
                                                    <FormButton buttonStyle="primary" buttonSize="xs"
                                                        class="col-span-2 min-h-10 shrink-0 sm:col-span-1"
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

                    <aside
                        class="overflow-hidden rounded-2xl border border-primary-200 bg-white shadow-lg shadow-primary-900/5 lg:sticky lg:top-20 lg:flex lg:h-[calc(100dvh-9rem)] lg:flex-col lg:self-start">
                        <div class="min-h-0 flex-1 overflow-y-auto p-5 lg:p-4 xl:p-5">
                            <div class="mb-4 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <span
                                        class="flex size-11 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                                        <Icon name="ph:shopping-cart-simple" class="size-5" />
                                    </span>
                                    <div>
                                        <h2 class="text-lg font-semibold text-gray-900">
                                            Current order
                                        </h2>
                                        <p class="text-xs text-gray-500">
                                            {{ cartQuantity }} item{{ cartQuantity === 1 ? '' : 's' }} selected
                                        </p>
                                    </div>
                                </div>
                                <button v-if="posStore.cart.length" type="button"
                                    class="min-h-9 rounded-lg px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                                    @click="clearCart">
                                    Clear
                                </button>
                            </div>

                            <div class="space-y-3">
                                <div v-for="line in posStore.cart" :key="line.product_variant_uuid"
                                    class="rounded-xl border border-primary-100 bg-primary-25/60 p-3">
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
                                            :appendToBody="true" :closeOnScroll="true" v-model="line.discount_uuid" />
                                    </div>
                                </div>
                                <div v-if="!posStore.cart.length"
                                    class="rounded-2xl border border-dashed border-primary-200 bg-primary-25 px-4 py-8 text-center">
                                    <span
                                        class="mx-auto flex size-12 items-center justify-center rounded-full bg-white text-primary-300 shadow-sm">
                                        <Icon name="ph:shopping-cart-simple" class="size-6" />
                                    </span>
                                    <p class="mt-2 text-sm font-medium text-gray-600">Your cart is empty</p>
                                    <p class="mt-1 text-xs text-gray-400">Select a product variant to get started.</p>
                                </div>
                            </div>

                            <div class="mt-4 space-y-3 rounded-xl border border-primary-100 bg-primary-25 p-3">
                                <p class="text-xs font-bold uppercase tracking-[0.14em] text-primary-600">Order details
                                </p>
                                <div class="space-y-1">
                                    <p class="text-sm text-gray-600">
                                        Customer (optional)
                                    </p>
                                    <FormSelect :options="customerOptions" v-model="state.customer_uuid" />
                                </div>
                                <div class="grid gap-2"
                                    :class="state.payment_method === 'cash' ? 'grid-cols-1' : 'grid-cols-2'">
                                    <div class="space-y-1">
                                        <p class="text-sm text-gray-600">Payment</p>
                                        <FormSelect :options="paymentMethodOptions" :searchable="false"
                                            :canClear="false" v-model="state.payment_method" />
                                    </div>
                                    <div v-if="state.payment_method !== 'cash'" class="space-y-1">
                                        <FormLabel for="reference" label="Reference" />
                                        <input id="reference" v-model="state.reference" type="text"
                                            placeholder="Optional" class="pos-select px-3" />
                                    </div>
                                </div>
                                <div v-if="state.payment_method === 'cash'" class="space-y-1">
                                    <FormLabel for="cash_tender" label="Cash tender" />
                                    <FormNumberField id="cash_tender" name="cash_tender"
                                        placeholder="Enter amount received" :min="0" v-model="state.cash_tender" />
                                    <div v-if="cashTenderSuggestions.length" class="pt-2">
                                        <p class="mb-2 text-xs font-medium text-gray-500">Quick cash</p>
                                        <div class="grid grid-cols-4 gap-2">
                                            <button v-for="amount in cashTenderSuggestions" :key="amount" type="button"
                                                class="min-h-10 rounded-lg border px-2 text-xs font-semibold transition active:scale-[0.97]"
                                                :class="Number(state.cash_tender) === amount
                                                    ? 'border-primary bg-primary text-white shadow-sm'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-primary-50 hover:text-primary-700'"
                                                :aria-pressed="Number(state.cash_tender) === amount"
                                                @click="selectCashTender(amount)">
                                                {{ money(amount) }}
                                            </button>
                                        </div>
                                    </div>
                                    <p v-if="cashShortfall > 0 && Number(state.cash_tender) > 0"
                                        class="text-xs text-red-600">
                                        Additional {{ money(cashShortfall) }} is required.
                                    </p>
                                </div>
                            </div>

                            <div
                                class="mt-4 space-y-2 rounded-xl border border-primary-200 bg-white p-4 text-sm shadow-sm">
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
                                <div
                                    class="flex justify-between border-t border-primary-100 pt-3 text-xl font-bold text-primary-900">
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
                        </div>

                        <div
                            class="sticky bottom-0 shrink-0 border-t border-primary-100 bg-white/95 p-4 shadow-[0_-8px_24px_rgba(53,39,31,0.06)] backdrop-blur lg:static lg:p-3 xl:p-4">
                            <FormButton buttonStyle="primary"
                                class="min-h-12 w-full text-sm shadow-md shadow-primary-900/15"
                                :disabled="!canCheckout || state.isSubmitting" @click="checkout">
                                <Icon name="ph:check-circle" class="size-5" />
                                {{ state.isSubmitting ? 'Processing…' : `Charge ${money(grandTotal)}` }}
                            </FormButton>
                        </div>
                    </aside>
                </div>
            </LoadingSpinner>

            <ModulesShiftStartModal :show="state.isShiftModalOpen" :computerId="state.computer_id"
                :canClose="hasOpenShift" @close="state.isShiftModalOpen = false" @created="handleShiftCreated" />

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
                        <Alert type="danger" :text="state.printError" class="mt-4 text-left"
                            v-if="state.printError && state.printError.length > 0" />
                        <FormButton buttonStyle="action" class="mt-5 w-full" :disabled="state.isPrinting"
                            @click="printReceipt">
                            <Icon name="ph:printer" class="size-5" />
                            {{ state.isPrinting ? 'Printing…' : 'Print receipt' }}
                        </FormButton>
                        <FormButton buttonStyle="primary" class="mt-3 w-full" @click="state.isSuccessOpen = false">
                            New order
                        </FormButton>
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
import FormSelect from '@/components/form/Select.vue'
import { useAlert } from '@/composables/alert'
import { usePosStore } from '@/store/pos'
import { useUserStore } from '@/store/user'
import type { CartLine, Error } from '@/types'

const noDiscountValue = '__none__'

const runtimeConfig = useRuntimeConfig()
const posStore = usePosStore() as any
const userStore = useUserStore() as any
const { successAlert } = useAlert()

const state = reactive({
    shifts: [] as any[],
    customers: [] as any[],
    discounts: [] as any[],
    products: [] as any[],
    productVariants: [] as any[],
    selectedVariantByProduct: {} as Record<string, string>,
    computer_id: '',
    shift_uuid: '',
    customer_uuid: '',
    payment_method: 'cash',
    reference: '',
    cash_tender: '',
    productSearch: '',
    selectedCategory: 'all',
    error: {} as Error,
    isPageLoading: false,
    isSubmitting: false,
    isSuccessOpen: false,
    completedOrder: null as any,
    completedChange: 0,
    completedPaymentMethod: '',
    isPrinting: false,
    printError: '',
    isShiftModalOpen: false,
    isCloseShiftConfirmationOpen: false,
    isClosingShift: false,
})

onMounted(() => {
    state.computer_id = getComputerId()
    fetchPosData()
})

const openShifts = computed(() => state.shifts.filter((shift: any) => shift.is_open))
const currentShift = computed(() => openShifts.value.find((shift: any) => shift.uuid === state.shift_uuid))
const canManageCurrentShift = computed(() => !userStore.getUser?.uuid || currentShift.value?.user?.uuid === userStore.getUser.uuid)
const openShiftOptions = computed(() => openShifts.value.map((shift: any) => ({
    value: shift.uuid,
    label: `${shift.name} · ${shift.branch?.name || 'No branch'} · ${fullName(shift.user)}`,
})))

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

const categoryFilters = computed(() => {
    const categories = new Map<string, { uuid: string, name: string, color: string, count: number }>()

    state.products.forEach((product: any) => {
        const category = product.category
        const uuid = category?.uuid ?? 'uncategorized'
        const current = categories.get(uuid) ?? {
            uuid,
            name: category?.name ?? 'Uncategorized',
            color: category?.color || '#e5e7eb',
            count: 0,
        }
        current.count++
        categories.set(uuid, current)
    })

    return [
        { uuid: 'all', name: 'All products', color: '', count: state.products.length },
        ...Array.from(categories.values()).sort((a, b) => a.name.localeCompare(b.name)),
    ]
})

const filteredProducts = computed(() => {
    const search = state.productSearch.trim().toLowerCase()
    return state.products.map((product: any) => ({
        ...product,
        variants: state.productVariants.filter((variant: any) => variant.is_active && variant.product?.uuid === product.uuid),
    })).filter((product: any) => {
        const categoryUuid = product.category?.uuid ?? 'uncategorized'
        if (state.selectedCategory !== 'all' && categoryUuid !== state.selectedCategory) return false
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
const cartQuantity = computed(() => posStore.cart.reduce((total, line) => total + line.quantity, 0))
// Prices are tax-inclusive: the listed price is what the customer pays, so
// tax is backed out of it rather than added on top. grandTotal is simply the
// sum of each line's post-discount (already tax-inclusive) amount; subtotal
// and taxTotal are just that amount split into its net/tax parts for display.
const discountTotal = computed(() => posStore.cart.reduce((total, line) => total + lineDiscount(line), 0))
const grandTotal = computed(() => posStore.cart.reduce((total, line) => total + lineTotal(line), 0))
const taxTotal = computed(() => posStore.cart.reduce((total, line) => {
    const afterDiscount = lineTotal(line)
    const rate = line.tax_percentage / 100
    return total + afterDiscount * rate / (1 + rate)
}, 0))
const subtotal = computed(() => grandTotal.value - taxTotal.value)
const cashTenderSuggestions = computed(() => {
    const total = Math.ceil(grandTotal.value * 100) / 100
    if (total <= 0) return []

    return [...new Set([
        total,
        Math.ceil(total / 50) * 50,
        Math.ceil(total / 100) * 100,
        Math.ceil(total / 500) * 500,
        Math.ceil(total / 1000) * 1000,
    ])].filter(amount => amount >= total).slice(0, 4)
})
const cashChange = computed(() => Math.max(0, Number(state.cash_tender || 0) - grandTotal.value))
const cashShortfall = computed(() => Math.max(0, grandTotal.value - Number(state.cash_tender || 0)))
const hasSufficientPayment = computed(() => state.payment_method !== 'cash' || Number(state.cash_tender || 0) >= grandTotal.value)
const canCheckout = computed(() => Boolean(
    hasOpenShift.value && posStore.cart.length && hasSufficientPayment.value
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
        syncCartWithLatestVariants()
        initializeProductVariants()
        selectLatestOpenShift()
        state.isShiftModalOpen = !hasOpenShift.value
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function selectLatestOpenShift() {
    if (!openShifts.value.some((shift: any) => shift.uuid === state.shift_uuid)) {
        state.shift_uuid = openShifts.value[0]?.uuid ?? ''
    }
}

function getComputerId() {
    const storageKey = 'cafe_pos_computer_id'
    let computerId = localStorage.getItem(storageKey)
    if (!computerId) {
        computerId = crypto.randomUUID()
        localStorage.setItem(storageKey, computerId)
    }
    return computerId
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
        posStore.clearCart()
        selectLatestOpenShift()
        state.isShiftModalOpen = !hasOpenShift.value
    } catch (error: any) {
        state.error = error
    } finally {
        state.isClosingShift = false
    }
}

function addToCart(variant: any) {
    const existing = posStore.cart.find(line => line.product_variant_uuid === variant.uuid)
    if (existing) { existing.quantity++; return }
    posStore.cart.push({
        product_variant_uuid: variant.uuid,
        product_name: variant.product?.name ?? 'Product', variant_name: variant.name,
        price: Number(variant.price), tax_percentage: Number(variant.product?.tax_rate?.percentage ?? 0),
        quantity: 1, discount_uuid: noDiscountValue,
    })
}

function syncCartWithLatestVariants() {
    posStore.cart = posStore.cart.flatMap((line: CartLine) => {
        const variant = state.productVariants.find((item: any) => item.uuid === line.product_variant_uuid)

        if (!variant?.is_active) {
            return []
        }

        return [{
            ...line,
            product_name: variant.product?.name ?? line.product_name,
            variant_name: variant.name,
            price: Number(variant.price),
            tax_percentage: Number(variant.product?.tax_rate?.percentage ?? 0),
        }]
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

function variantIcon(category: any) {
    const categoryName = category?.name || ''
    if (/hot/i.test(categoryName)) return 'ph:coffee'
    if (/iced/i.test(categoryName)) return 'ph:snowflake'
    return 'ph:plus-circle'
}

function categoryTextColor(color: string) {
    const hex = color?.replace('#', '')
    if (!hex || !/^[0-9a-f]{6}$/i.test(hex)) return '#35271f'
    const [red, green, blue] = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16))
    return (red * 299 + green * 587 + blue * 114) / 1000 > 150 ? '#35271f' : '#ffffff'
}

function categoryColorRgba(color: string, opacity: number) {
    const hex = color?.replace('#', '')
    if (!hex || !/^[0-9a-f]{6}$/i.test(hex)) return `rgba(110, 68, 48, ${opacity})`
    const red = parseInt(hex.slice(0, 2), 16)
    const green = parseInt(hex.slice(2, 4), 16)
    const blue = parseInt(hex.slice(4, 6), 16)
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`
}

function variantCategoryStyle(color: string, selected: boolean) {
    return {
        backgroundColor: selected ? categoryColorRgba(color, 0.09) : '#ffffff',
        borderColor: categoryColorRgba(color, selected ? 0.75 : 0.25),
        '--tw-ring-color': categoryColorRgba(color, 0.28),
    }
}

function variantCategoryIconStyle(color: string) {
    return {
        backgroundColor: categoryColorRgba(color, 0.14),
        color: color || '#6e4430',
    }
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
    posStore.cart = posStore.cart.filter(line => line.product_variant_uuid !== uuid)
}

function clearCart() {
    posStore.clearCart()
}

function fullName(user: any) {
    return user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unknown user' : 'Unknown user'
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
    return Math.max(0, line.price * line.quantity - lineDiscount(line))
}

function discountLabel(discount: any) {
    return discount.type === 'percentage' ? `${discount.value}%` : money(discount.value)
}

function money(value: number | string) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))
}

function selectCashTender(amount: number) {
    state.cash_tender = amount.toFixed(2)
}

async function printReceipt() {
    if (state.isPrinting || !state.completedOrder?.uuid) return
    state.isPrinting = true
    state.printError = ''
    try {
        await orderService.printReceipt(state.completedOrder.uuid)
        successAlert('Success', 'Receipt sent to printer.')
    } catch (error: any) {
        state.printError = error?.message || 'Printer not detected. Make sure a Bluetooth thermal printer is paired and try again.'
    } finally {
        state.isPrinting = false
    }
}

async function checkout() {
    if (!canCheckout.value || state.isSubmitting) return
    state.error = {}
    state.isSubmitting = true
    try {
        const params = {
            shift_uuid: state.shift_uuid,
            customer_uuid: state.customer_uuid || null,
            lines: posStore.cart.map(line => ({
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
            state.printError = ''
            posStore.clearCart()
            state.customer_uuid = ''
            state.payment_method = 'cash'
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
.pos-workspace {
    background-color: #fdfbf9;
    background-image: url('/images/sidebar-grid.png');
    background-position: top left;
    background-size: 760px 760px;
    background-blend-mode: soft-light;
}

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
    border-color: var(--color-primary, #6e4430);
    box-shadow: 0 0 0 4px rgb(240 226 215 / 0.8);
}

@media (max-width: 639px) {
    .pos-workspace {
        margin-inline: -0.5rem;
        padding: 0.5rem;
        border-radius: 0;
    }
}
</style>
