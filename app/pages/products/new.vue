<template>
    <div>

        <Head>
            <Title>New product - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>New product</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/products">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesProductForm formType="create" :selectedProduct="state.formProduct" :error="state.error"
                        :showCreateCategory="true" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveProduct" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { productService } from '@/components/api/user/ProductService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const breadcrumbLinks = [
    {
        name: 'Products',
        href: '/products'
    },
    {
        name: 'New product',
        href: '/products/new'
    }
]
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    formProduct: {
        sku: '',
        barcode: '',
        name: '',
        price: '',
        cost: '',
        color: '#000000',
        category_uuid: '',
        tax_rate_uuid: ''
    },
    isPageLoading: false,
})
async function saveProduct(productDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            sku: productDetails.sku,
            barcode: productDetails.barcode,
            name: productDetails.name,
            price: productDetails.price,
            cost: productDetails.cost,
            color: productDetails.color,
            category_uuid: productDetails.category_uuid,
            tax_rate_uuid: productDetails.tax_rate_uuid,
        }
        const response = await productService.saveProduct(params)
        if (response.data) {
            successAlert('Success', 'Product successfully saved.')
            navigateTo('/products')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
