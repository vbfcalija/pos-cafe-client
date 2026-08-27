<template>
    <div>

        <Head>
            <Title>Edit product category - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>Edit product category</template>
            <div>
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/product-categories">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesProductCategoryForm formType="update" :selectedProductCategory="state.formProductCategory"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateProductCategory" />
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
const { successAlert } = useAlert()
const router = useRouter()
const productCategoryUuid = router?.currentRoute?.value?.params?.product_category_uuid
const breadcrumbLinks = [
    { name: 'Product categories', href: '/product-categories' },
    { name: 'Edit product category', href: `/product-categories/${productCategoryUuid}/edit` },
]

const state = reactive({
    error: {} as Error,
    formProductCategory: {
        name: '',
        description: '',
        color: '#000000'
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchProductCategory()
})

async function fetchProductCategory() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await categoryService.getCategory(productCategoryUuid)
        if (response) {
            state.formProductCategory = {
                name: response?.data?.name ?? '',
                description: response?.data?.description ?? '',
                color: response?.data?.color || '#000000',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateProductCategory(productCategoryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: productCategoryDetails.name,
            description: productCategoryDetails.description,
            color: productCategoryDetails.color,
        }
        const response = await categoryService.updateCategory(productCategoryUuid, params)
        if (response.data) {
            successAlert('Success', 'Product category successfully updated.')
            navigateTo('/product-categories')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
