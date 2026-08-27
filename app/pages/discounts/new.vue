<template>
    <div>

        <Head>
            <Title>New discount - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>New discount</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/discounts">
                    <Icon name="ph:arrow-left" size="20" />
                    <span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesDiscountForm formType="create" :selectedDiscount="state.formDiscount" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveDiscount" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { discountService } from '@/components/api/user/DiscountService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const breadcrumbLinks = [
    {
        name: 'Discounts',
        href: '/discounts',
    },
    {
        name: 'New discount',
        href: '/discounts/new',
    },
]
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    formDiscount: {
        name: '',
        type: 'percentage',
        value: '',
    },
    isPageLoading: false,
})

async function saveDiscount(discountDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: discountDetails.name,
            type: discountDetails.type,
            value: discountDetails.value,
        }
        const response = await discountService.saveDiscount(params)
        if (response.data) {
            successAlert('Success', 'Discount successfully saved.')
            navigateTo('/discounts')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
