<template>
    <div>

        <Head>
            <Title>New tax rate - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>New tax rate</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/tax-rates">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesTaxRateForm formType="create" :selectedTaxRate="state.formTaxRate" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveTaxRate" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>
<script setup lang="ts">
import { taxRateService } from '@/components/api/user/TaxRateService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const breadcrumbLinks = [
    {
        name: 'Tax rates',
        href: '/tax-rates'
    },
    {
        name: 'New tax rate',
        href: '/tax-rates/new'
    }
]
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    formTaxRate: {
        name: '',
        percentage: ''
    },
    isPageLoading: false,
})

async function saveTaxRate(taxRateDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = { name: taxRateDetails.name, percentage: taxRateDetails.percentage }
        const response = await taxRateService.saveTaxRate(params)
        if (response.data) {
            successAlert('Success', 'Tax rate successfully saved.')
            navigateTo('/tax-rates')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
