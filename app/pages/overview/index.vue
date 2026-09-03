<template>
    <div>

        <Head>
            <Title>Overview - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Overview</template>
            <Alert v-if="state.error?.message" type="danger" :text="state.error.message" />
            <LoadingSpinner :isActive="state.isLoading">
                <div class="space-y-5">
                    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900">Operations Pulse</h2>
                            <p class="mt-1 text-sm text-gray-500">{{ dashboardTimestamp }} · Asia/Manila</p>
                        </div>
                        <div class="grid gap-3 sm:grid-cols-2">
                            <div class="grid gap-1">
                                <FormLabel for="overview-date" label="Business date" />
                                <FormDateField id="overview-date" name="overview_date" placeholder="Business date"
                                    class="h-11 min-w-48 !py-0" v-model="state.selectedDate" />
                            </div>
                            <div class="grid min-w-56 gap-1">
                                <p class="text-sm text-gray-600">
                                    Branch
                                </p>
                                <FormSelect id="overview-branch" :options="branchOptions" :searchable="false"
                                    :canClear="false" v-model="state.branchUuid" />
                            </div>
                        </div>
                    </section>

                    <div class="overview-primary-grid grid gap-4">
                        <section
                            class="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div class="absolute inset-y-0 left-0 w-1 bg-primary" />
                            <div v-if="currentShift" class="space-y-5">
                                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <span class="size-2.5 rounded-full bg-green-500" />
                                            <h3 class="font-semibold text-gray-900">
                                                Open shift
                                            </h3>
                                            <span
                                                class="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-green-700">Active</span>
                                        </div>
                                        <p class="mt-1 text-sm text-gray-500">
                                            {{ currentShift.name }} · {{ currentShift.branch?.name || 'No branch' }}
                                        </p>
                                    </div>
                                    <FormButton buttonStyle="primary" buttonSize="sm" @click="navigateTo('/pos')">
                                        <Icon name="ph:cash-register" class="size-4" /> Go to POS
                                    </FormButton>
                                </div>
                                <div
                                    class="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-gray-100 pt-4 lg:grid-cols-4">
                                    <div v-for="datum in shiftData" :key="datum.label" class="flex gap-3">
                                        <span
                                            class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                                            <Icon :name="datum.icon" class="size-4" />
                                        </span>
                                        <div class="min-w-0">
                                            <p class="text-xs text-gray-500">
                                                {{ datum.label }}
                                            </p>
                                            <p class="truncate text-sm font-semibold text-gray-900">
                                                {{ datum.value }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                                    <div>
                                        <p class="text-xs text-gray-500">
                                            Live sales
                                        </p>
                                        <p class="mt-1 text-xl font-bold text-primary">
                                            {{ money(currentShiftSales) }}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500">
                                            Orders this shift
                                        </p>
                                        <p class="mt-1 text-xl font-bold text-gray-900">
                                            {{ currentShiftOrders.length }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="flex min-h-52 flex-col items-center justify-center text-center">
                                <span
                                    class="flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                                    <Icon name="ph:clock-countdown" class="size-6" />
                                </span>
                                <h3 class="mt-3 font-semibold text-gray-900">
                                    No open shift
                                </h3>
                                <p class="mt-1 max-w-sm text-sm text-gray-500">
                                    Start a shift before accepting transactions at this branch.
                                </p>
                                <FormButton class="mt-4" buttonStyle="primary" buttonSize="sm"
                                    @click="navigateTo('/pos')">
                                    Start shift
                                </FormButton>
                            </div>
                        </section>

                        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div class="grid h-full grid-cols-2 content-center gap-y-8 lg:grid-cols-4">
                                <div v-for="metric in metrics" :key="metric.label"
                                    class="px-3 text-center first:pl-0 last:pr-0">
                                    <span
                                        class="mx-auto flex size-11 items-center justify-center rounded-full bg-blue-50 text-primary">
                                        <Icon :name="metric.icon" class="size-5" />
                                    </span>
                                    <p class="mt-3 text-xs text-gray-500">
                                        {{ metric.label }}
                                    </p>
                                    <p class="mt-1 text-lg font-bold text-gray-900">
                                        {{ metric.value }}
                                    </p>
                                    <p class="mt-1 text-[11px] text-green-600">
                                        {{ metric.helper }}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div class="overview-insights-grid grid gap-4">
                        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div class="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 class="font-semibold text-gray-900">
                                        Sales today
                                    </h3>
                                    <p class="text-xs text-gray-500">
                                        Revenue by hour
                                    </p>
                                </div>
                                <span class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-primary">
                                    By hour
                                </span>
                            </div>
                            <div v-if="filteredOrders.length" class="h-64"><canvas ref="salesCanvas"
                                    class="dashboard-canvas" aria-label="Hourly sales chart" /></div>
                            <div v-else class="flex h-64 flex-col items-center justify-center text-center">
                                <Icon name="ph:chart-line" class="size-9 text-gray-300" />
                                <p class="mt-2 text-sm text-gray-500">
                                    No sales recorded for this date.
                                </p>
                            </div>
                            <div v-if="filteredOrders.length"
                                class="mt-3 flex items-center justify-center gap-5 text-xs text-gray-500">
                                <span class="flex items-center gap-2">
                                    <span class="h-0.5 w-5 bg-primary" />
                                    Selected day
                                </span>
                                <span>{{ money(netSales) }} total</span>
                            </div>
                        </section>

                        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div class="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 class="font-semibold text-gray-900">
                                        Top product variants
                                    </h3>
                                    <p class="text-xs text-gray-500">
                                        Ranked by sales
                                    </p>
                                </div>
                                <NuxtLink to="/product-variants"
                                    class="text-xs font-medium text-primary hover:underline">
                                    View product variants
                                </NuxtLink>
                            </div>
                            <div v-if="topVariants.length" class="divide-y divide-gray-100">
                                <div v-for="(variant, index) in topVariants" :key="variant.uuid"
                                    class="flex items-center gap-3 py-3">
                                    <span
                                        class="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-primary">
                                        {{ index + 1 }}
                                    </span>
                                    <span
                                        class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                        <Icon :name="variantIcon(variant.name)" class="size-4" />
                                    </span>
                                    <div class="min-w-0 flex-1">
                                        <p class="truncate text-sm font-medium text-gray-900">
                                            {{ variant.productName }}
                                        </p>
                                        <p class="truncate text-xs text-gray-500">
                                            {{ variant.name }} · {{ variant.quantity }} sold
                                        </p>
                                    </div>
                                    <p class="text-sm font-semibold text-gray-900">
                                        {{ money(variant.sales) }}
                                    </p>
                                </div>
                            </div>
                            <div v-else class="py-16 text-center">
                                <Icon name="ph:coffee" class="mx-auto size-8 text-gray-300" />
                                <p class="mt-2 text-sm text-gray-500">
                                    No product sales for this date.
                                </p>
                            </div>
                        </section>

                        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div class="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 class="font-semibold text-gray-900">
                                        Payment mix
                                    </h3>
                                    <p class="text-xs text-gray-500">
                                        Share of net sales
                                    </p>
                                </div>
                                <span class="text-xs font-medium text-gray-500">
                                    By sales
                                </span>
                            </div>
                            <div v-if="paymentMix.length" class="grid items-center gap-5 sm:grid-cols-[140px_1fr]">
                                <div class="payment-chart relative mx-auto">
                                    <canvas ref="paymentCanvas" class="dashboard-canvas"
                                        aria-label="Payment method chart" />
                                    <div
                                        class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                        <p class="text-base font-bold text-gray-900">
                                            {{ money(netSales) }}
                                        </p>
                                        <p class="text-[10px] text-gray-500">
                                            Total sales
                                        </p>
                                    </div>
                                </div>
                                <div class="space-y-3">
                                    <div v-for="method in paymentMix" :key="method.name"
                                        class="flex items-center gap-2 text-xs">
                                        <span class="size-2.5 rounded-full"
                                            :style="{ backgroundColor: method.color }" />
                                        <span class="min-w-0 flex-1 truncate capitalize text-gray-600">
                                            {{ method.name }}
                                        </span>
                                        <span class="font-medium text-gray-900">
                                            {{ method.percentage.toFixed(0) }}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="py-16 text-center">
                                <Icon name="ph:credit-card" class="mx-auto size-8 text-gray-300" />
                                <p class="mt-2 text-sm text-gray-500">
                                    No payments for this date.
                                </p>
                            </div>
                        </section>
                    </div>

                    <section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div class="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 class="font-semibold text-gray-900">
                                    Sales by product category
                                </h3>
                                <p class="text-xs text-gray-500">
                                    Products and variants sold for the selected filters
                                </p>
                            </div>
                            <div class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                                <div>
                                    <span class="text-gray-500">
                                        Items sold
                                    </span>
                                    <span class="ml-2 font-semibold text-gray-900">
                                        {{ totalQuantitySold }}
                                    </span>
                                </div>
                                <div>
                                    <span class="text-gray-500">
                                        Total sales
                                    </span>
                                    <span class="ml-2 font-semibold text-gray-900">
                                        {{ money(netSales) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div v-if="categorySummaries.length" class="divide-y divide-gray-200 border-t border-gray-100">
                            <div v-for="category in categorySummaries" :key="category.uuid">
                                <div
                                    class="flex flex-col gap-2 bg-gray-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div class="flex items-center gap-2">
                                        <span class="size-2.5 rounded-full border border-gray-200"
                                            :style="{ backgroundColor: category.color }" />
                                        <span class="font-semibold text-gray-900">
                                            {{ category.name }}
                                        </span>
                                        <span class="text-xs text-gray-500">
                                            {{ category.variants.length }}
                                            {{ category.variants.length === 1 ? 'variant' : 'variants' }}
                                        </span>
                                    </div>
                                    <div class="flex gap-5 text-sm">
                                        <span class="text-gray-600">
                                            <strong class="text-gray-900">
                                                {{ category.quantity }}
                                            </strong>
                                            sold
                                        </span>
                                        <strong class="text-gray-900">
                                            {{ money(category.sales) }}
                                        </strong>
                                    </div>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left text-sm">
                                        <thead
                                            class="border-y border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th class="px-5 py-2.5 font-medium">
                                                    Product
                                                </th>
                                                <th class="px-5 py-2.5 font-medium">
                                                    Variant
                                                </th>
                                                <th class="px-5 py-2.5 text-right font-medium">
                                                    Quantity sold
                                                </th>
                                                <th class="px-5 py-2.5 text-right font-medium">
                                                    Sales
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-100">
                                            <tr v-for="variant in category.variants" :key="variant.uuid"
                                                class="hover:bg-gray-50">
                                                <td class="px-5 py-3 font-medium text-gray-900">
                                                    {{ variant.productName }}
                                                </td>
                                                <td class="px-5 py-3 text-gray-600">
                                                    {{ variant.variantName }}
                                                </td>
                                                <td class="px-5 py-3 text-right text-gray-600">
                                                    {{ variant.quantity }}
                                                </td>
                                                <td class="px-5 py-3 text-right font-semibold text-gray-900">
                                                    {{ money(variant.sales) }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div v-else class="py-10 text-center">
                            <Icon name="ph:squares-four" class="mx-auto size-8 text-gray-300" />
                            <p class="mt-2 text-sm text-gray-500">
                                No category sales for this date.
                            </p>
                        </div>
                    </section>

                    <section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div class="flex items-center justify-between px-5 py-4">
                            <div>
                                <h3 class="font-semibold text-gray-900">
                                    Recent transactions
                                </h3>
                                <p class="text-xs text-gray-500">
                                    Latest orders for the selected date
                                </p>
                            </div>
                            <NuxtLink to="/orders" class="text-sm font-medium text-primary hover:underline">
                                View all
                            </NuxtLink>
                        </div>
                        <div v-if="recentOrders.length" class="overflow-x-auto">
                            <table class="w-full text-left text-sm">
                                <thead
                                    class="border-y border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th class="px-5 py-3 font-medium">Order</th>
                                        <th class="px-5 py-3 font-medium">Customer</th>
                                        <th class="px-5 py-3 font-medium">Items</th>
                                        <th class="px-5 py-3 font-medium">Payment</th>
                                        <th class="px-5 py-3 text-right font-medium">Amount</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="order in recentOrders" :key="order.uuid" class="hover:bg-gray-50">
                                        <td class="px-5 py-3 font-medium text-primary">
                                            #{{ order.order_no }}
                                        </td>
                                        <td class="px-5 py-3 text-gray-600">
                                            {{ order.customer?.name || 'Walk-in' }}
                                        </td>
                                        <td class="max-w-md px-5 py-3 text-gray-600">
                                            {{ orderItems(order) }}
                                        </td>
                                        <td class="px-5 py-3">
                                            <span class="inline-flex items-center gap-1.5 capitalize text-gray-600">
                                                <Icon :name="paymentIcon(paymentMethod(order))" class="size-4" />
                                                {{ paymentMethod(order) }}
                                            </span>
                                        </td>
                                        <td class="px-5 py-3 text-right font-semibold text-gray-900">
                                            {{ money(orderTotal(order)) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-else class="py-12 text-center">
                            <Icon name="ph:receipt" class="mx-auto size-8 text-gray-300" />
                            <p class="mt-2 text-sm text-gray-500">
                                No transactions for this date.
                            </p>
                        </div>
                    </section>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { orderService } from '@/components/api/user/OrderService'
import { shiftService } from '@/components/api/user/ShiftService'
import { branchService } from '@/components/api/user/BranchService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const salesCanvas = ref<HTMLCanvasElement | null>(null)
const paymentCanvas = ref<HTMLCanvasElement | null>(null)

const state = reactive({
    orders: [] as any[],
    shifts: [] as any[],
    branches: [] as any[],
    selectedDate: localDate(new Date()),
    branchUuid: 'all',
    error: {} as Error,
    isLoading: false
})

const branchOptions = computed(() => {
    return [
        { label: 'All branches', value: 'all' },
        ...state.branches.map((branch: any) => ({ label: branch.name, value: branch.uuid })),
    ]
})
const filteredOrders = computed(() => state.orders.filter((order: any) => {
    const businessDate = String(order.date || '').slice(0, 10)
    return businessDate === state.selectedDate
        && (state.branchUuid === 'all' || order.shift?.branch?.uuid === state.branchUuid)
}))

const openShifts = computed(() => state.shifts.filter((shift: any) => shift.is_open && (state.branchUuid === 'all' || shift.branch?.uuid === state.branchUuid)))
const currentShift = computed(() => openShifts.value[0] || null)
const currentShiftOrders = computed(() => currentShift.value
    ? filteredOrders.value.filter((order: any) => order.shift?.uuid === currentShift.value.uuid)
    : [])
const currentShiftSales = computed(() => currentShiftOrders.value.reduce((total: number, order: any) => total + orderTotal(order), 0))
const netSales = computed(() => filteredOrders.value.reduce((total, order) => total + orderTotal(order), 0))
const averageOrderValue = computed(() => filteredOrders.value.length ? netSales.value / filteredOrders.value.length : 0)
const customerCount = computed(() => new Set(filteredOrders.value.map((order: any) => order.customer?.uuid).filter(Boolean)).size)
const recentOrders = computed(() => filteredOrders.value.slice(0, 5))
const shiftData = computed(() => currentShift.value ? [
    { icon: 'ph:storefront', label: 'Branch', value: currentShift.value.branch?.name || '-' },
    { icon: 'ph:user', label: 'Cashier', value: fullName(currentShift.value.user) },
    { icon: 'ph:wallet', label: 'Starting cash', value: money(currentShift.value.starting_cash) },
    { icon: 'ph:calendar-check', label: 'Shift date', value: formatShortDate(currentShift.value.date) },
] : [])
const metrics = computed(() => [
    { icon: 'ph:trend-up', label: 'Net sales', value: money(netSales.value), helper: 'After discounts' },
    { icon: 'ph:shopping-bag', label: 'Orders', value: String(filteredOrders.value.length), helper: 'Completed' },
    { icon: 'ph:receipt', label: 'Avg. order', value: money(averageOrderValue.value), helper: 'Per transaction' },
    { icon: 'ph:users', label: 'Customers', value: String(customerCount.value), helper: 'Registered' },
])
const hourlySales = computed(() => {
    const hours = Array.from({ length: 24 }, () => 0)
    filteredOrders.value.forEach((order: any) => { hours[new Date(order.created_at || order.date).getHours()] += orderTotal(order) })
    return hours
})
const topVariants = computed(() => {
    const variants = new Map<string, any>()
    filteredOrders.value.forEach((order: any) => order.details?.forEach((line: any) => {
        const variant = line.product_variant
        if (!variant?.uuid) return
        const current = variants.get(variant.uuid) || { uuid: variant.uuid, name: variant.name, productName: variant.product?.name || 'Product', quantity: 0, sales: 0 }
        current.quantity += Number(line.quantity); current.sales += lineTotal(line); variants.set(variant.uuid, current)
    }))
    return Array.from(variants.values()).sort((a, b) => b.sales - a.sales).slice(0, 5)
})
const categorySummaries = computed(() => {
    const categories = new Map<string, any>()
    filteredOrders.value.forEach((order: any) => order.details?.forEach((line: any) => {
        const variant = line.product_variant
        const product = variant?.product
        const category = product?.category
        const uuid = category?.uuid || 'uncategorized'
        const current = categories.get(uuid) || {
            uuid,
            name: category?.name || 'Uncategorized',
            color: category?.color || '#e5e7eb',
            quantity: 0,
            sales: 0,
            variants: new Map<string, any>(),
        }
        const quantity = Number(line.quantity)
        const sales = lineTotal(line)
        const variantUuid = variant?.uuid || `${product?.uuid || 'product'}-${variant?.name || 'default'}`
        const variantSummary = current.variants.get(variantUuid) || {
            uuid: variantUuid,
            productName: product?.name || 'Product',
            variantName: variant?.name || 'Default',
            quantity: 0,
            sales: 0,
        }
        current.quantity += quantity
        current.sales += sales
        variantSummary.quantity += quantity
        variantSummary.sales += sales
        current.variants.set(variantUuid, variantSummary)
        categories.set(uuid, current)
    }))
    return Array.from(categories.values())
        .map(category => ({
            ...category,
            variants: Array.from(category.variants.values()).sort((a: any, b: any) => b.sales - a.sales),
        }))
        .sort((a, b) => b.sales - a.sales)
})
const totalQuantitySold = computed(() => categorySummaries.value.reduce((total, category) => total + category.quantity, 0))
const paymentMix = computed(() => {
    const colors = ['#437dfb', '#60a5fa', '#22c55e', '#8b5cf6', '#94a3b8']; const methods = new Map<string, number>()
    filteredOrders.value.forEach((order: any) => { const method = paymentMethod(order); methods.set(method, (methods.get(method) || 0) + orderTotal(order)) })
    return Array.from(methods, ([name, amount], index) => ({ name, amount, color: colors[index % colors.length], percentage: netSales.value ? amount / netSales.value * 100 : 0 }))
})
const dashboardTimestamp = computed(() => new Intl.DateTimeFormat('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit', hour: 'numeric', minute: '2-digit' }).format(new Date()))

onMounted(fetchDashboard)
watch([filteredOrders, paymentMix], () => nextTick(drawCharts), { deep: true })

async function fetchDashboard() {
    state.isLoading = true; state.error = {}
    const params = {
        page: 1,
        page_length: 500,
        sortField: 'created_at',
        sortOrder: 'descend',
        search: []
    }
    try {
        const [orders, shifts, branches] = await Promise.all([
            orderService.getOrders(params),
            shiftService.getShifts({ ...params, sortField: 'date' }),
            branchService.getBranches({ ...params, sortField: 'name', sortOrder: 'ascend' }),
        ])
        state.orders = orders?.data ?? []
        state.shifts = shifts?.data ?? []
        state.branches = branches?.data ?? []
        await nextTick()
        drawCharts()
    } catch (error: any) {
        state.error = error
    } finally {
        state.isLoading = false
    }
}

function lineDiscount(line: any) {
    const discount = line.discount
    if (!discount) {
        return 0
    }
    const gross = Number(line.price) * Number(line.quantity)
    return discount.type === 'percentage' ? gross * Number(discount.value) / 100 : Math.min(gross, Number(discount.value))
}

// Prices are tax-inclusive, so a line's total is just its post-discount
// amount — tax is backed out of that, never added on top.
function lineTotal(line: any) {
    return Math.max(0, Number(line.price) * Number(line.quantity) - lineDiscount(line))
}

function orderTotal(order: any) {
    return order.details?.reduce((total: number, line: any) => total + lineTotal(line), 0) ?? 0
}

function orderItems(order: any) {
    return order.details?.map((line: any) => `${line.product_variant?.product?.name || 'Product'} × ${line.quantity}`).join(', ') || '-'
}

function paymentMethod(order: any) {
    return String(order.payments?.[0]?.payment_method || 'unpaid').replace('_', ' ')
}

function paymentIcon(method: string) {
    if (method === 'cash') {
        return 'ph:money'
    }
    if (method === 'gcash') {
        return 'ph:device-mobile'
    }
    return 'ph:credit-card'
}

function variantIcon(name: string) {
    if (/iced|cold|frozen|chilled/i.test(name)) {
        return 'ph:snowflake'
    }
    if (/hot|warm|heated/i.test(name)) {
        return 'ph:coffee'
    }
    return 'ph:plus-circle'
}

function fullName(user: any) {
    return user ? [user.firstname, user.lastname].filter(Boolean).join(' ') || '-' : '-'
}

function money(value: number | string) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value || 0))
}

function formatShortDate(value: string) {
    return new Intl.DateTimeFormat('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(value))
}

function localDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function setupCanvas(canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.max(1, rect.width * ratio)
    canvas.height = Math.max(1, rect.height * ratio)
    const context = canvas.getContext('2d')!
    context.scale(ratio, ratio)
    return { context, width: rect.width, height: rect.height }
}

function drawCharts() {
    drawSalesChart()
    drawPaymentChart()
}

function drawSalesChart() {
    if (!salesCanvas.value) return
    const { context, width, height } = setupCanvas(salesCanvas.value)
    context.clearRect(0, 0, width, height)

    const padding = { top: 14, right: 8, bottom: 28, left: 44 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    const max = Math.max(...hourlySales.value, 1)

    context.font = '11px sans-serif'
    context.fillStyle = '#94a3b8'
    context.strokeStyle = '#e5e7eb'
    context.lineWidth = 1
    for (let index = 0; index <= 4; index++) {
        const y = padding.top + chartHeight * index / 4
        context.beginPath()
        context.moveTo(padding.left, y)
        context.lineTo(width - padding.right, y)
        context.stroke()
        const value = max * (1 - index / 4)
        context.fillText(value >= 1000 ? `₱${(value / 1000).toFixed(1)}K` : `₱${Math.round(value)}`, 0, y + 4)
    }
    const points = hourlySales.value.map((value, hour) => ({
        x: padding.left + chartWidth * hour / 23, y: padding.top + chartHeight - value / max * chartHeight
    }))
    context.strokeStyle = '#437dfb'
    context.lineWidth = 2.5
    context.lineJoin = 'round'
    context.beginPath()
    points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y))
    context.stroke()
    context.fillStyle = '#64748b'
        ;[0, 6, 12, 18, 23].forEach(hour => { const x = padding.left + chartWidth * hour / 23; context.fillText(hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : hour === 23 ? '11 PM' : `${hour - 12} PM`, x - 14, height - 5) })
}

function drawPaymentChart() {
    if (!paymentCanvas.value || !paymentMix.value.length) return
    const { context, width, height } = setupCanvas(paymentCanvas.value)
    context.clearRect(0, 0, width, height)
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 5; let start = -Math.PI / 2
    paymentMix.value.forEach(method => {
        const end = start + Math.PI * 2 * method.percentage / 100
        context.beginPath()
        context.strokeStyle = method.color
        context.lineWidth = 18
        context.arc(centerX, centerY, radius - 10, start, end)
        context.stroke()
        start = end
    })
}
</script>

<style scoped>
@media (min-width: 1024px) {
    .overview-primary-grid {
        grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    }

    .overview-insights-grid {
        grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr) minmax(0, .9fr);
    }
}

.dashboard-canvas {
    display: block;
    width: 100%;
    height: 100%;
}

.payment-chart {
    width: 9rem;
    height: 9rem;
}
</style>
