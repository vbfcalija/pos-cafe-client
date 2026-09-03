<template>
    <div>

        <Head>
            <Title>Reports - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Reports</template>
            <div class="space-y-5">
                <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">
                            Report center
                        </h2>
                        <p class="mt-1 text-sm text-gray-500">
                            Review performance, transactions, and cash activity.
                        </p>
                    </div>
                    <FormButton buttonStyle="primary" :disabled="!filteredOrders.length" @click="exportReport">
                        <Icon name="ph:download-simple" class="size-4" /> Export report
                    </FormButton>
                </section>

                <section
                    class="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_auto] xl:items-end">
                    <div class="grid gap-1">
                        <FormLabel for="report-period" label="Date range" />
                        <FormDateRangeField id="report-period" name="report_period" placeholder="Select date range"
                            v-model="state.dateRange" />
                    </div>
                    <div class="grid gap-1">
                        <p class="text-sm text-gray-600">
                            Branch
                        </p>
                        <FormSelect id="report-branch" :options="branchOptions" :searchable="true" :canClear="false"
                            v-model="state.branch" />
                    </div>
                    <div class="grid gap-1">
                        <p class="text-sm text-gray-600">
                            Report
                        </p>
                        <FormSelect id="report-type" :options="reportOptions" :searchable="false" :canClear="false"
                            v-model="state.report" />
                    </div>
                    <FormButton buttonStyle="secondary" class="h-[42px]" :disabled="state.isLoading"
                        @click="fetchReportData">
                        Apply filters
                    </FormButton>
                </section>

                <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <article v-for="metric in metrics" :key="metric.label"
                        class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm text-gray-500">
                                    {{ metric.label }}
                                </p>
                                <p class="mt-2 text-2xl font-bold text-gray-900">
                                    {{ metric.value }}
                                </p>
                            </div>
                            <span class="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-primary">
                                <Icon :name="metric.icon" class="size-5" />
                            </span>
                        </div>
                        <p class="mt-3 text-xs text-gray-500">
                            {{ metric.helper }}
                        </p>
                    </article>
                </section>

                <section class="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
                    <article class="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h3 class="font-semibold text-gray-900">
                                    {{ selectedReportLabel }}
                                </h3>
                                <p class="text-xs text-gray-500">
                                    Daily net sales within the selected period
                                </p>
                            </div>
                            <span class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-primary">
                                {{ filteredOrders.length }} orders
                            </span>
                        </div>
                        <div class="flex h-64 items-end gap-3 px-5 pb-5 pt-10">
                            <div v-for="day in salesTrend" :key="day.label"
                                class="flex h-full flex-1 flex-col justify-end gap-2">
                                <div class="flex flex-1 items-end">
                                    <div class="w-full rounded-t-md bg-primary/85 transition hover:bg-primary"
                                        :style="{ height: `${day.height}%` }" />
                                </div>
                                <span class="text-center text-[11px] text-gray-500">
                                    {{ day.label }}
                                </span>
                            </div>
                        </div>
                    </article>
                    <article class="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div class="border-b border-gray-100 px-5 py-4">
                            <h3 class="font-semibold text-gray-900">
                                Top-selling products
                            </h3>
                            <p class="text-xs text-gray-500">
                                Ranked by net sales
                            </p>
                        </div>
                        <div v-if="topProducts.length" class="divide-y divide-gray-100 px-5">
                            <div v-for="(product, index) in topProducts" :key="product.uuid"
                                class="flex items-center gap-3 py-4">
                                <span
                                    class="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                                    {{ index + 1 }}
                                </span>
                                <div class="min-w-0 flex-1">
                                    <p class="truncate text-sm font-medium text-gray-900">
                                        {{ product.name }}
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        {{ product.quantity }} items sold
                                    </p>
                                </div>
                                <p class="text-sm font-semibold text-gray-900">
                                    {{ money(product.sales) }}
                                </p>
                            </div>
                        </div>
                        <div v-else class="py-16 text-center">
                            <Icon name="ph:package" class="mx-auto size-8 text-gray-300" />
                            <p class="mt-2 text-sm text-gray-500">
                                No product sales for this period.
                            </p>
                        </div>
                    </article>
                </section>

                <section>
                    <div class="mb-3">
                        <h3 class="font-semibold text-gray-900">
                            All reports
                        </h3>
                        <p class="text-sm text-gray-500">
                            Choose a report to view its complete breakdown.
                        </p>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <button v-for="report in reports" :key="report.value" type="button"
                            class="group flex items-start gap-4 rounded-xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                            :class="state.report === report.value ? 'border-primary ring-1 ring-primary/20' : 'border-gray-200'"
                            @click="selectReport(report.value)">
                            <span
                                class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                                <Icon :name="report.icon" class="size-5" />
                            </span>
                            <span class="min-w-0 flex-1">
                                <span class="flex items-center justify-between gap-2">
                                    <span class="font-semibold text-gray-900">
                                        {{ report.title }}
                                    </span>
                                    <Icon
                                        :name="state.report === report.value ? 'ph:check-circle-fill' : 'ph:arrow-right'"
                                        class="size-4 text-primary transition group-hover:translate-x-1" />
                                </span>
                                <span class="mt-1 block text-sm leading-5 text-gray-500">
                                    {{ report.description }}
                                </span>
                            </span>
                        </button>
                    </div>
                </section>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { branchService } from '@/components/api/user/BranchService'
import { orderService } from '@/components/api/user/OrderService'

const runtimeConfig = useRuntimeConfig()
const today = new Date()
const weekAgo = new Date(today)
weekAgo.setDate(today.getDate() - 6)

const state = reactive({
    dateRange: [localDate(weekAgo), localDate(today)],
    branch: 'all',
    report: 'sales-summary',
    branches: [] as any[],
    orders: [] as any[],
    isLoading: false,
})

const branchOptions = computed(() => [
    { value: 'all', label: 'All branches' },
    ...state.branches.map(branch => ({ value: branch.uuid, label: branch.name })),
])
const reportOptions = [
    { value: 'sales-summary', label: 'Sales summary' }, { value: 'product-sales', label: 'Product sales' },
    { value: 'transactions', label: 'Transactions' }, { value: 'payment-methods', label: 'Payment methods' },
    { value: 'shift-reconciliation', label: 'Shift reconciliation' }, { value: 'branch-performance', label: 'Branch performance' },
]
const selectedReportLabel = computed(() => reportOptions.find(report => report.value === state.report)?.label || 'Sales summary')
const filteredOrders = computed(() => state.orders.filter(order => {
    const orderDate = String(order.date || '').slice(0, 10)
    const [start, end] = state.dateRange
    return (!start || orderDate >= start)
        && (!end || orderDate <= end)
        && (state.branch === 'all' || order.shift?.branch?.uuid === state.branch)
}))
const netSales = computed(() => filteredOrders.value.reduce((total, order) => total + orderTotal(order), 0))
const itemsSold = computed(() => filteredOrders.value.reduce((total, order) => total + (order.details?.reduce((sum: number, line: any) => sum + Number(line.quantity), 0) || 0), 0))
const metrics = computed(() => [
    {
        label: 'Net sales',
        value: money(netSales.value),
        helper: 'After discounts and tax',
        icon: 'ph:trend-up'
    },
    {
        label: 'Orders',
        value: String(filteredOrders.value.length),
        helper: 'Completed transactions',
        icon: 'ph:receipt'
    },
    {
        label: 'Items sold',
        value: String(itemsSold.value),
        helper: 'Across all categories',
        icon: 'ph:package'
    },
    {
        label: 'Average order',
        value: money(filteredOrders.value.length ? netSales.value / filteredOrders.value.length : 0),
        helper: 'Per transaction',
        icon: 'ph:shopping-bag'
    },
])
const salesTrend = computed(() => {
    const [start, end] = state.dateRange
    if (!start || !end) return []
    const days: any[] = []
    const cursor = new Date(`${start}T00:00:00`)
    const finish = new Date(`${end}T00:00:00`)
    while (cursor <= finish && days.length < 62) {
        const date = localDate(cursor)
        const sales = filteredOrders.value.filter(order => String(order.date || '').slice(0, 10) === date).reduce((total, order) => total + orderTotal(order), 0)
        days.push({ date, label: new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' }).format(cursor), sales })
        cursor.setDate(cursor.getDate() + 1)
    }
    const maximum = Math.max(...days.map(day => day.sales), 1)
    return days.map(day => ({ ...day, height: day.sales ? Math.max(8, day.sales / maximum * 100) : 2 }))
})
const topProducts = computed(() => {
    const products = new Map<string, any>()
    filteredOrders.value.forEach(order => order.details?.forEach((line: any) => {
        const product = line.product_variant?.product
        const uuid = product?.uuid || 'unknown'
        const current = products.get(uuid) || { uuid, name: product?.name || 'Product', quantity: 0, sales: 0 }
        current.quantity += Number(line.quantity)
        current.sales += lineTotal(line)
        products.set(uuid, current)
    }))
    return Array.from(products.values()).sort((a, b) => b.sales - a.sales).slice(0, 5)
})

const reports = [
    {
        value: 'sales-summary',
        title: 'Sales summary',
        description: 'Gross sales, discounts, tax, net sales, orders, and average order value.',
        icon: 'ph:chart-line-up'
    },
    {
        value: 'product-sales',
        title: 'Product sales',
        description: 'Category, product, and variant performance with quantities and sales.',
        icon: 'ph:package'
    },
    {
        value: 'transactions',
        title: 'Transactions',
        description: 'Complete order history with customers, cashiers, payments, and totals.',
        icon: 'ph:receipt'
    },
    {
        value: 'payment-methods',
        title: 'Payment methods',
        description: 'Cash and card totals, tendered amounts, references, and change issued.',
        icon: 'ph:credit-card'
    },
    {
        value: 'shift-reconciliation',
        title: 'Shift reconciliation',
        description: 'Starting cash, expected cash, shift activity, and closing variance.',
        icon: 'ph:cash-register'
    },
    {
        value: 'branch-performance',
        title: 'Branch performance',
        description: 'Compare sales, orders, average order value, and top products by branch.',
        icon: 'ph:storefront'
    },
]

onMounted(fetchReportData)

async function fetchReportData() {
    state.isLoading = true
    const params = {
        page: 1,
        page_length: 500,
        sortField: 'created_at',
        sortOrder: 'descend',
        search: [],
    }
    try {
        const [branches, orders] = await Promise.all([
            branchService.getBranches({ ...params, sortField: 'name', sortOrder: 'ascend' }),
            orderService.getOrders(params),
        ])
        state.branches = branches?.data ?? []
        state.orders = orders?.data ?? []
    } finally {
        state.isLoading = false
    }
}

function lineDiscount(line: any) {
    const discount = line.discount
    if (!discount) return 0
    const gross = Number(line.price) * Number(line.quantity)
    return discount.type === 'percentage' ? gross * Number(discount.value) / 100 : Math.min(gross, Number(discount.value))
}

// Prices are tax-inclusive, so a line's total is just its post-discount
// amount — tax is backed out of that (see lineTax below), never added on top.
function lineTotal(line: any) {
    return Math.max(0, Number(line.price) * Number(line.quantity) - lineDiscount(line))
}

function orderTotal(order: any) {
    return order.details?.reduce((total: number, line: any) => total + lineTotal(line), 0) ?? 0
}

function money(value: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0)
}

function localDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function selectReport(report: string) {
    state.report = report
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function exportReport() {
    const rows = exportRows()
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${state.report}-${state.dateRange[0]}-${state.dateRange[1]}.csv`
    link.click()
    URL.revokeObjectURL(url)
}

function exportRows(): any[][] {
    const rows: any[][] = [
        [selectedReportLabel.value],
        ['Date range', state.dateRange[0], state.dateRange[1]],
        ['Branch', selectedBranchName()],
        ['Generated at', new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())],
        [],
    ]

    if (state.report === 'sales-summary') {
        rows.push(['Date', 'Orders', 'Items sold', 'Gross sales', 'Discounts', 'Tax', 'Net sales', 'Cost', 'Gross profit', 'Average order'])
        const dates = new Map<string, any>()
        filteredOrders.value.forEach(order => {
            const date = String(order.date || '').slice(0, 10); const item = dates.get(date) || { orders: 0, items: 0, gross: 0, discount: 0, tax: 0, net: 0, cost: 0 }
            item.orders += 1
            order.details?.forEach((line: any) => { item.items += Number(line.quantity); item.gross += lineGross(line); item.discount += lineDiscount(line); item.tax += lineTax(line); item.net += lineTotal(line); item.cost += lineCost(line) })
            dates.set(date, item)
        })
        Array.from(dates.entries()).sort(([a], [b]) => a.localeCompare(b)).forEach(([date, item]) => rows.push([date, item.orders, item.items, decimal(item.gross), decimal(item.discount), decimal(item.tax), decimal(item.net), decimal(item.cost), decimal(item.net - item.tax - item.cost), decimal(item.net / item.orders)]))
        const totals = reportTotals()
        rows.push([], ['TOTAL', totals.orders, totals.items, decimal(totals.gross), decimal(totals.discount), decimal(totals.tax), decimal(totals.net), decimal(totals.cost), decimal(totals.profit), decimal(totals.orders ? totals.net / totals.orders : 0)])
        return rows
    }

    if (state.report === 'product-sales') {
        rows.push(['Category', 'Product', 'SKU', 'Variant', 'Orders', 'Quantity', 'Gross sales', 'Discounts', 'Tax', 'Net sales', 'Cost', 'Gross profit'])
        const variants = new Map<string, any>()
        filteredOrders.value.forEach(order => order.details?.forEach((line: any) => {
            const variant = line.product_variant
            const key = variant?.uuid || `${variant?.product?.name}-${variant?.name}`
            const item = variants.get(key) || { category: variant?.product?.category?.name || 'Uncategorized', product: variant?.product?.name || 'Product', sku: variant?.product?.sku || '', variant: variant?.name || 'Default', orders: new Set(), quantity: 0, gross: 0, discount: 0, tax: 0, net: 0, cost: 0 }
            item.orders.add(order.uuid); item.quantity += Number(line.quantity); item.gross += lineGross(line); item.discount += lineDiscount(line); item.tax += lineTax(line); item.net += lineTotal(line); item.cost += lineCost(line); variants.set(key, item)
        }))
        Array.from(variants.values()).sort((a, b) => b.net - a.net).forEach(item => rows.push([item.category, item.product, item.sku, item.variant, item.orders.size, item.quantity, decimal(item.gross), decimal(item.discount), decimal(item.tax), decimal(item.net), decimal(item.cost), decimal(item.net - item.tax - item.cost)]))
        return rows
    }

    if (state.report === 'payment-methods') {
        rows.push(['Date', 'Order no.', 'Branch', 'Shift', 'Payment method', 'Reference', 'Cashier', 'Order total'])
        filteredOrders.value.forEach(order => {
            const payments = order.payments?.length ? order.payments : [{ payment_method: 'Unpaid' }]
            payments.forEach((payment: any) => rows.push([String(payment.date || order.date || '').slice(0, 10), order.order_no, order.shift?.branch?.name || '', order.shift?.name || '', payment.payment_method || 'Unpaid', payment.reference || '', personName(payment.user || order.user), decimal(orderTotal(order))]))
        })
        rows.push([], ['SUMMARY'], ['Payment method', 'Transactions', 'Total'])
        paymentSummaries().forEach(item => rows.push([item.name, item.count, decimal(item.total)]))
        return rows
    }

    if (state.report === 'branch-performance') {
        rows.push(['Branch', 'Orders', 'Items', 'Gross sales', 'Discounts', 'Tax', 'Net sales', 'Cost', 'Gross profit', 'Average order'])
        const branches = new Map<string, any>()
        filteredOrders.value.forEach(order => {
            const name = order.shift?.branch?.name || 'No branch'; const item = branches.get(name) || { orders: 0, items: 0, gross: 0, discount: 0, tax: 0, net: 0, cost: 0 }
            item.orders += 1; order.details?.forEach((line: any) => { item.items += Number(line.quantity); item.gross += lineGross(line); item.discount += lineDiscount(line); item.tax += lineTax(line); item.net += lineTotal(line); item.cost += lineCost(line) }); branches.set(name, item)
        })
        Array.from(branches.entries()).sort(([, a], [, b]) => b.net - a.net).forEach(([name, item]) => rows.push([name, item.orders, item.items, decimal(item.gross), decimal(item.discount), decimal(item.tax), decimal(item.net), decimal(item.cost), decimal(item.net - item.tax - item.cost), decimal(item.net / item.orders)]))
        return rows
    }

    if (state.report === 'shift-reconciliation') {
        rows.push(['Date', 'Shift', 'Branch', 'Cashier', 'Status', 'Orders', 'Items', 'Starting cash', 'Cash sales', 'Non-cash sales', 'Expected cash'])
        const shifts = new Map<string, any>()
        filteredOrders.value.forEach(order => {
            const shift = order.shift; const key = shift?.uuid || 'unknown'; const item = shifts.get(key) || { date: String(shift?.date || '').slice(0, 10), name: shift?.name || 'Shift', branch: shift?.branch?.name || '', cashier: personName(shift?.user), status: shift?.is_open ? 'Open' : 'Closed', orders: 0, items: 0, startingCash: Number(shift?.starting_cash || 0), cashSales: 0, nonCashSales: 0 }
            const total = orderTotal(order); item.orders += 1; item.items += order.details?.reduce((sum: number, line: any) => sum + Number(line.quantity), 0) || 0
            if (order.payments?.some((payment: any) => payment.payment_method === 'cash')) item.cashSales += total; else item.nonCashSales += total
            shifts.set(key, item)
        })
        shifts.forEach(item => rows.push([item.date, item.name, item.branch, item.cashier, item.status, item.orders, item.items, decimal(item.startingCash), decimal(item.cashSales), decimal(item.nonCashSales), decimal(item.startingCash + item.cashSales)]))
        return rows
    }

    rows.push(['Order no.', 'Date', 'Branch', 'Shift', 'Cashier', 'Customer', 'Category', 'Product', 'Variant', 'Quantity', 'Unit price', 'Gross', 'Discount', 'Tax', 'Line total', 'Payment method', 'Reference'])
    filteredOrders.value.forEach(order => order.details?.forEach((line: any) => rows.push([order.order_no, String(order.date || '').slice(0, 10), order.shift?.branch?.name || '', order.shift?.name || '', personName(order.user), order.customer?.name || 'Walk-in', line.product_variant?.product?.category?.name || 'Uncategorized', line.product_variant?.product?.name || 'Product', line.product_variant?.name || 'Default', line.quantity, decimal(line.price), decimal(lineGross(line)), decimal(lineDiscount(line)), decimal(lineTax(line)), decimal(lineTotal(line)), order.payments?.[0]?.payment_method || 'Unpaid', order.payments?.[0]?.reference || ''])))
    return rows
}

function lineGross(line: any) {
    return Number(line.price) * Number(line.quantity)
}

function lineTax(line: any) {
    const rate = Number(line.tax_percentage || 0) / 100
    return lineTotal(line) * rate / (1 + rate)
}

function lineCost(line: any) {
    return Number(line.cost || 0) * Number(line.quantity)
}

function decimal(value: number) {
    return Number(value || 0).toFixed(2)
}

function personName(user: any) {
    return [user?.firstname, user?.lastname].filter(Boolean).join(' ') || ''
}

function reportTotals() {
    const totals = { orders: filteredOrders.value.length, items: 0, gross: 0, discount: 0, tax: 0, net: 0, cost: 0, profit: 0 }
    filteredOrders.value.forEach(order => order.details?.forEach((line: any) => { totals.items += Number(line.quantity); totals.gross += lineGross(line); totals.discount += lineDiscount(line); totals.tax += lineTax(line); totals.net += lineTotal(line); totals.cost += lineCost(line) }))
    totals.profit = totals.net - totals.tax - totals.cost
    return totals
}

function paymentSummaries() {
    const methods = new Map<string, any>()
    filteredOrders.value.forEach(order => { const name = order.payments?.[0]?.payment_method || 'Unpaid'; const item = methods.get(name) || { name, count: 0, total: 0 }; item.count += 1; item.total += orderTotal(order); methods.set(name, item) })
    return Array.from(methods.values()).sort((a, b) => b.total - a.total)
}

function selectedBranchName() {
    return state.branch === 'all' ? 'All branches' : state.branches.find(branch => branch.uuid === state.branch)?.name || ''
}
</script>
