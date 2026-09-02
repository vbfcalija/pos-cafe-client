<template>
    <div>

        <Head>
            <Title>Edit product - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>Edit product</template>
            <div>
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/products">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesProductForm formType="update" :selectedProduct="state.formProduct" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateProduct" />
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
const { successAlert } = useAlert()
const router = useRouter()
const productUuid = router?.currentRoute?.value?.params?.product_uuid
const breadcrumbLinks = [{ name: 'Products', href: '/products' }, { name: 'Edit product', href: `/products/${productUuid}/edit` }]
const state = reactive({
    error: {} as Error,
    formProduct: { sku: '', barcode: '', name: '', color: '#000000', category_uuid: '', tax_rate_uuid: '' },
    isPageLoading: false,
})
onMounted(() => { fetchProduct() })
async function fetchProduct() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await productService.getProduct(productUuid)
        if (response) {
            state.formProduct = {
                sku: response?.data?.sku ?? '', barcode: response?.data?.barcode ?? '', name: response?.data?.name ?? '',
                color: response?.data?.color || '#000000', category_uuid: response?.data?.category?.uuid ?? '',
                tax_rate_uuid: response?.data?.tax_rate?.uuid ?? '',
            }
        }
    } catch (error: any) { state.error = error }
    state.isPageLoading = false
}
async function updateProduct(productDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            sku: productDetails.sku,
            barcode: productDetails.barcode,
            name: productDetails.name,
            color: productDetails.color,
            category_uuid: productDetails.category_uuid,
            tax_rate_uuid: productDetails.tax_rate_uuid,
        }
        const response = await productService.updateProduct(productUuid, params)
        if (response.data) {
            successAlert('Success', 'Product successfully updated.')
            navigateTo('/products')
        }
    } catch (error: any) { state.error = error }
    state.isPageLoading = false
}
</script>
