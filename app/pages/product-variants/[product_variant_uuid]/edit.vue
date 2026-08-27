<template>
    <div>

        <Head>
            <Title>Edit product variant - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>Edit product variant</template>
            <div>
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/product-variants">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesProductVariantForm formType="update" :selectedProductVariant="state.formProductVariant"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateProductVariant" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { productVariantService } from '@/components/api/user/ProductVariantService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const router = useRouter()
const productVariantUuid = router?.currentRoute?.value?.params?.product_variant_uuid
const breadcrumbLinks = [
    { name: 'Product variants', href: '/product-variants' },
    { name: 'Edit product variant', href: `/product-variants/${productVariantUuid}/edit` },
]

const state = reactive({
    error: {} as Error,
    formProductVariant: {
        product_uuid: '',
        name: '',
        price: '',
        cost: '',
        is_active: false
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchProductVariant()
})

async function fetchProductVariant() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await productVariantService.getProductVariant(productVariantUuid)
        if (response) {
            state.formProductVariant = {
                product_uuid: response?.data?.product?.uuid ?? '',
                name: response?.data?.name ?? '',
                price: response?.data?.price?.toString() ?? '',
                cost: response?.data?.cost?.toString() ?? '',
                is_active: response?.data?.is_active ? true : false,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateProductVariant(productVariantDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            product_uuid: productVariantDetails.product_uuid,
            name: productVariantDetails.name,
            price: productVariantDetails.price,
            cost: productVariantDetails.cost,
            is_active: productVariantDetails.is_active,
        }
        const response = await productVariantService.updateProductVariant(productVariantUuid, params)
        if (response.data) {
            successAlert('Success', 'Product variant successfully updated.')
            navigateTo('/product-variants')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
