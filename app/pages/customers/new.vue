<template>
    <div>

        <Head>
            <Title>New customer - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>New customer</template>
            <div class="rounded-md bg-white p-5">
                <NuxtLink class="mb-3 flex max-w-fit items-center gap-x-2 text-gray-700 hover:text-gray-900"
                    to="/customers">
                    <Icon name="ph:arrow-left" size="20" />
                    <span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCustomerForm formType="create" :selectedCustomer="state.formCustomer" :error="state.error"
                        @submitForm="saveCustomer" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { customerService } from '@/components/api/user/CustomerService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const breadcrumbLinks = [
    { name: 'Customers', href: '/customers' },
    { name: 'New customer', href: '/customers/new' },
]
const state = reactive({
    error: {} as Error,
    formCustomer: {
        name: '',
        tin: '',
        address: '',
        contact_number: ''
    },
    isPageLoading: false,
})

async function saveCustomer(customer: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await customerService.saveCustomer(customer)
        if (response?.data) {
            successAlert('Success', 'Customer successfully saved.')
            await navigateTo('/customers')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
