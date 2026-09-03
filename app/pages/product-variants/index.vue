<template>
    <div>

        <Head>
            <Title>Product variants - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Product variants</template>
            <div class="bg-white rounded-md p-5">
                <div>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                        <div class="flex items-center gap-x-1">
                            <span>Entriers per page:</span>
                            <select id="pageLength" class="bg-transparent focus:outline-none"
                                :value="productVariantStore.getCurrentPageLength" @change="changePageLength">
                                <option v-for="length in pageLengths" :key="length" :value="length">{{ length }}
                                </option>
                            </select>
                        </div>
                        <div class="flex flex-wrap items-center gap-3">
                            <FormButton buttonStyle="action" @click="navigateTo('/product-variants/new')">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                New product variant
                            </FormButton>
                        </div>
                    </div>
                    <div class="space-y-5">
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.productVariants"
                                :isLoading="state.isTableLoading" :sortData="productVariantStore.getSortData"
                                @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.productVariants?.data?.length === 0))">
                                    <tr v-for="(productVariant, index) in state.productVariants?.data" :key="index">
                                        <td width="20%">
                                            <p>{{ productVariant?.product?.name }}</p>
                                        </td>
                                        <td width="20%">
                                            <p>{{ productVariant?.name }}</p>
                                        </td>
                                        <td width="15%">
                                            <p>{{ money(productVariant?.price) }}</p>
                                        </td>
                                        <td width="15%">
                                            <p>{{ money(productVariant?.cost) }}</p>
                                        </td>
                                        <td width="10%">
                                            <Badge class="w-fit"
                                                :type="productVariant?.is_active ? 'active' : 'inactive'">
                                                <p class="text-xs">
                                                    {{
                                                        productVariant?.is_active ? 'Active' : 'Inactive'
                                                    }}
                                                </p>
                                            </Badge>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <Tooltip text="Edit">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="navigateTo(`/product-variants/${productVariant.uuid}/edit`)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip text="Delete">
                                                    <FormButton type="button" buttonStyle="danger"
                                                        @click="deleteProductVariantConfirmation(productVariant)">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.productVariants" @previous="previous" @next="next" />
                    </div>
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteProductVariantOpen"
                message="Are you sure you want to delete this product variant?"
                @close="state.modal.isDeleteProductVariantOpen = false" @confirm="deleteProductVariant" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { productVariantService } from '@/components/api/user/ProductVariantService'
import { useAlert } from '@/composables/alert'
import { useProductVariantStore } from '@/store/productVariant'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const productVariantStore = useProductVariantStore() as any
const pageLengths = [10, 20, 30, 40, 50, 100, 500]
const { successAlert } = useAlert()

function money(value: number | string) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(Number(value || 0))
}

const state = reactive({
    productVariants: [] as any,
    columnHeaders: [
        { name: 'Product', sorter: true, key: 'product_id' },
        { name: 'Name', sorter: true, key: 'name' },
        { name: 'Price', sorter: true, key: 'price' },
        { name: 'Cost', sorter: true, key: 'cost' },
        { name: 'Status', sorter: true, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: { search: [] as string[] },
    error: {} as Error,
    isTableLoading: false,
    modal: { isDeleteProductVariantOpen: false },
    selectedProductVariant: {} as any,
})

onMounted(() => {
    fetchProductVariants()
})

async function fetchProductVariants() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: productVariantStore.getCurrentPageNumber,
            page_length: productVariantStore.getCurrentPageLength,
            sortField: productVariantStore.getSortData.sortField,
            sortOrder: productVariantStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await productVariantService.getProductVariants(params)
        if (response) state.productVariants = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = productVariantStore.getCurrentPageNumber - 1
    productVariantStore.setCurrentPageNumber(currentTablePage)
    fetchProductVariants()
}

function next() {
    const currentTablePage = productVariantStore.getCurrentPageNumber + 1
    productVariantStore.setCurrentPageNumber(currentTablePage)
    fetchProductVariants()
}

function sort(sortingData: any) {
    productVariantStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    productVariantStore.setSortData(sortField, sortOrder)
    fetchProductVariants()
}

function handleSearch(value: any) {
    productVariantStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchProductVariants()
}

function changePageLength(event: any) {
    productVariantStore.setCurrentPageNumber(1)
    productVariantStore.setCurrentPageLength(event.target.value)
    fetchProductVariants()
}

function deleteProductVariantConfirmation(productVariant: any) {
    state.selectedProductVariant = productVariant
    state.modal.isDeleteProductVariantOpen = true
}

async function deleteProductVariant() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await productVariantService.deleteProductVariant(state.selectedProductVariant.uuid)
        if (response?.message) {
            successAlert('Success!', 'Product variant successfully deleted.')
            fetchProductVariants()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
