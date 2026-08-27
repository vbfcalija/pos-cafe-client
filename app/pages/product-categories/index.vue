<template>
    <div>

        <Head>
            <Title>Product categories - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #header>Product categories</template>
            <div class="bg-white rounded-md p-5">
                <div>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                        <div class="flex items-center gap-x-1">
                            <span>Entriers per page:</span>
                            <select id="pageLength" class="bg-transparent focus:outline-none"
                                :value="productCategoryStore.getCurrentPageLength" @change="changePageLength">
                                <option v-for="length in pageLengths" :key="length" :value="length">{{ length }}
                                </option>
                            </select>
                        </div>
                        <div class="flex flex-wrap items-center gap-3">
                            <FormButton buttonStyle="action" @click="navigateTo('/product-categories/new')">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" /> New product category
                            </FormButton>
                        </div>
                    </div>
                    <div class="space-y-5">
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.productCategories"
                                :isLoading="state.isTableLoading" :sortData="productCategoryStore.getSortData"
                                @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.productCategories?.data?.length === 0))">
                                    <tr v-for="(productCategory, index) in state.productCategories?.data" :key="index">
                                        <td width="30%">
                                            <p>{{ productCategory?.name }}</p>
                                        </td>
                                        <td width="35%">
                                            <p>{{ productCategory?.description || '-' }}</p>
                                        </td>
                                        <td width="15%">
                                            <span class="inline-block size-6 rounded border"
                                                :style="{ backgroundColor: productCategory?.color }" />
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <Tooltip text="Edit">
                                                    <FormButton type="button" buttonStyle="action"
                                                        @click="navigateTo(`/product-categories/${productCategory.uuid}/edit`)">
                                                        <Icon name="ph:pencil-simple" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                                <Tooltip text="Delete">
                                                    <FormButton type="button" buttonStyle="danger"
                                                        @click="deleteProductCategoryConfirmation(productCategory)">
                                                        <Icon name="ph:trash" class="size-4" />
                                                    </FormButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.productCategories" @previous="previous" @next="next" />
                    </div>
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteProductCategoryOpen"
                message="Are you sure you want to delete this product category?"
                @close="state.modal.isDeleteProductCategoryOpen = false" @confirm="deleteProductCategory" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { categoryService } from '@/components/api/user/CategoryService'
import { useAlert } from '@/composables/alert'
import { useProductCategoryStore } from '@/store/productCategory'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const productCategoryStore = useProductCategoryStore() as any
const pageLengths = [10, 20, 30, 40, 50, 100, 500]
const { successAlert } = useAlert()

const state = reactive({
    productCategories: [] as any,
    columnHeaders: [
        { name: 'Name', sorter: true, key: 'name' },
        { name: 'Description', sorter: true, key: 'description' },
        { name: 'Color', sorter: true, key: 'color' },
        { name: '' },
    ],
    dataFilter: { search: [] as string[] },
    error: {} as Error,
    isTableLoading: false,
    modal: { isDeleteProductCategoryOpen: false },
    selectedProductCategory: {} as any,
})

onMounted(() => {
    fetchProductCategories()
})

async function fetchProductCategories() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: productCategoryStore.getCurrentPageNumber,
            page_length: productCategoryStore.getCurrentPageLength,
            sortField: productCategoryStore.getSortData.sortField,
            sortOrder: productCategoryStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await categoryService.getCategories(params)
        if (response) {
            state.productCategories = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    const currentTablePage = productCategoryStore.getCurrentPageNumber - 1
    productCategoryStore.setCurrentPageNumber(currentTablePage)
    fetchProductCategories()
}

function next() {
    const currentTablePage = productCategoryStore.getCurrentPageNumber + 1
    productCategoryStore.setCurrentPageNumber(currentTablePage)
    fetchProductCategories()
}

function sort(sortingData: any) {
    productCategoryStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    productCategoryStore.setSortData(sortField, sortOrder)
    fetchProductCategories()
}

function handleSearch(value: any) {
    productCategoryStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchProductCategories()
}

function changePageLength(event: any) {
    productCategoryStore.setCurrentPageNumber(1)
    productCategoryStore.setCurrentPageLength(event.target.value)
    fetchProductCategories()
}

function deleteProductCategoryConfirmation(productCategory: any) {
    state.selectedProductCategory = productCategory
    state.modal.isDeleteProductCategoryOpen = true
}

async function deleteProductCategory() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await categoryService.deleteCategory(state.selectedProductCategory.uuid)
        if (response?.message) {
            successAlert('Success!', 'Product category successfully deleted.')
            fetchProductCategories()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
