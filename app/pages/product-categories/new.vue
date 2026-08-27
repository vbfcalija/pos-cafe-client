<template>
    <div>

        <Head>
            <Title>New product category - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>New product category</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/product-categories">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesProductCategoryForm formType="create" :selectedProductCategory="state.formProductCategory"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveProductCategory" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { categoryService } from '@/components/api/user/CategoryService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const breadcrumbLinks = [
    { name: 'Product categories', href: '/product-categories' },
    { name: 'New product category', href: '/product-categories/new' },
]
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    formProductCategory: {
        name: '',
        description: '',
        color: '#000000'
    },
    isPageLoading: false,
})

async function saveProductCategory(productCategoryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: productCategoryDetails.name,
            description: productCategoryDetails.description,
            color: productCategoryDetails.color,
        }
        const response = await categoryService.saveCategory(params)
        if (response.data) {
            successAlert('Success', 'Product category successfully saved.')
            navigateTo('/product-categories')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
