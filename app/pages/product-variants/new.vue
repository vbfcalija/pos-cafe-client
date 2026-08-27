<template>
    <div>

        <Head>
            <Title>New product variant - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>New product variant</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/product-variants">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesProductVariantForm formType="create" :selectedProductVariant="state.formProductVariant"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveProductVariant" />
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
const breadcrumbLinks = [
    { name: 'Product variants', href: '/product-variants' },
    { name: 'New product variant', href: '/product-variants/new' },
]
const { successAlert } = useAlert()

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

async function saveProductVariant(productVariantDetails: any) {
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
        const response = await productVariantService.saveProductVariant(params)
        if (response.data) {
            successAlert('Success', 'Product variant successfully saved.')
            navigateTo('/product-variants')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
