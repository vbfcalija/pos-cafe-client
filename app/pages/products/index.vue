<template>
    <div>

        <Head>
            <Title>Products - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Products</template>
            <div class="bg-white rounded-md p-5">
                <div>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                        <div class="flex items-center gap-x-1">
                            <span>Entriers per page:</span>
                            <select id="pageLength" class="bg-transparent focus:outline-none"
                                :value="productStore.getCurrentPageLength" @change="changePageLength">
                                <option v-for="length in pageLengths" :key="length" :value="length">{{ length }}
                                </option>
                            </select>
                        </div>
                        <div class="flex flex-wrap items-center gap-3">
                            <FormButton buttonStyle="action" @click="navigateTo('/products/new')">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" /> New product
                            </FormButton>
                        </div>
                    </div>
                    <div class="space-y-5">
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.products"
                                :isLoading="state.isTableLoading" :sortData="productStore.getSortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.products?.data?.length === 0))">
                                    <tr v-for="(product, index) in state.products?.data" :key="index">
                                        <td>
                                            <p>{{ product?.sku }}</p>
                                        </td>
                                        <td>
                                            <p>{{ product?.barcode || '-' }}</p>
                                        </td>
                                        <td>
                                            <p>{{ product?.name }}</p>
                                        </td>
                                        <td><span class="inline-block size-6 rounded border"
                                                :style="{ backgroundColor: product?.color }" /></td>
                                        <td>
                                            <p>{{ product?.category?.name }}</p>
                                        </td>
                                        <td>
                                            <p>{{ product?.tax_rate?.name }}</p>
                                        </td>
                                        <td>
                                            <div class="flex items-end gap-2">
                                                <Tooltip text="Edit">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="navigateTo(`/products/${product.uuid}/edit`)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip text="Delete">
                                                    <FormButton type="button" buttonStyle="danger"
                                                        @click="deleteProductConfirmation(product)">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.products" @previous="previous" @next="next" />
                    </div>
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteProductOpen"
                message="Are you sure you want to delete this product?" @close="state.modal.isDeleteProductOpen = false"
                @confirm="deleteProduct" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { productService } from '@/components/api/user/ProductService'
import { useAlert } from '@/composables/alert'
import { useProductStore } from '@/store/product'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const productStore = useProductStore() as any
const pageLengths = [10, 20, 30, 40, 50, 100, 500]
const { successAlert } = useAlert()

const state = reactive({
    products: [] as any,
    columnHeaders: [
        { name: 'SKU', sorter: true, key: 'sku' },
        { name: 'Barcode', sorter: true, key: 'barcode' },
        { name: 'Name', sorter: true, key: 'name' },
        { name: 'Color', sorter: true, key: 'color' },
        { name: 'Category', sorter: true, key: 'category_id' },
        { name: 'Tax rate', sorter: true, key: 'tax_rate_id' },
        { name: '' },
    ],
    dataFilter: { search: [] as string[] },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteProductOpen: false
    },
    selectedProduct: {} as any,
})

onMounted(() => {
    fetchProducts()
})

async function fetchProducts() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: productStore.getCurrentPageNumber,
            page_length: productStore.getCurrentPageLength,
            sortField: productStore.getSortData.sortField,
            sortOrder: productStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await productService.getProducts(params)
        if (response) {
            state.products = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = productStore.getCurrentPageNumber - 1
    productStore.setCurrentPageNumber(currentTablePage)
    fetchProducts()
}

function next() {
    const currentTablePage = productStore.getCurrentPageNumber + 1
    productStore.setCurrentPageNumber(currentTablePage)
    fetchProducts()
}

function sort(sortingData: any) {
    productStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    productStore.setSortData(sortField, sortOrder)
    fetchProducts()
}

function handleSearch(value: any) {
    productStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchProducts()
}

function changePageLength(event: any) {
    productStore.setCurrentPageNumber(1)
    productStore.setCurrentPageLength(event.target.value)
    fetchProducts()
}

function deleteProductConfirmation(product: any) {
    state.selectedProduct = product
    state.modal.isDeleteProductOpen = true
}

async function deleteProduct() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await productService.deleteProduct(state.selectedProduct.uuid)
        if (response?.message) {
            successAlert('Success!', 'Product successfully deleted.')
            fetchProducts()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
