<template>
    <div>

        <Head>
            <Title>Edit tax rate - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>Edit tax rate</template>
            <div>
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/tax-rates">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesTaxRateForm formType="update" :selectedTaxRate="state.formTaxRate" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateTaxRate" />
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
const { successAlert } = useAlert()
const router = useRouter()
const taxRateUuid = router?.currentRoute?.value?.params?.tax_rate_uuid
const breadcrumbLinks = [
    {
        name: 'Tax rates',
        href: '/tax-rates'
    },
    {
        name: 'Edit tax rate',
        href: `/tax-rates/${taxRateUuid}/edit`
    }
]

const state = reactive({
    error: {} as Error,
    formTaxRate: {
        name: '',
        percentage: ''
    },
    isPageLoading: false
})

onMounted(() => {
    fetchTaxRate()
})

async function fetchTaxRate() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await taxRateService.getTaxRate(taxRateUuid)
        if (response) {
            state.formTaxRate = {
                name: response?.data?.name ?? '',
                percentage: response?.data?.percentage?.toString() ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateTaxRate(taxRateDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: taxRateDetails.name,
            percentage: taxRateDetails.percentage
        }
        const response = await taxRateService.updateTaxRate(taxRateUuid, params)
        if (response.data) {
            successAlert('Success', 'Tax rate successfully updated.')
            navigateTo('/tax-rates')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
