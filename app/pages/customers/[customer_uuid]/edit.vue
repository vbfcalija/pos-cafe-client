<template>
    <div>

        <Head>
            <Title>Edit customer - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>Edit customer</template>
            <div class="rounded-md bg-white p-5">
                <NuxtLink class="mb-3 flex max-w-fit items-center gap-x-2 text-gray-700 hover:text-gray-900"
                    to="/customers">
                    <Icon name="ph:arrow-left" size="20" />
                    <span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCustomerForm formType="update" :selectedCustomer="state.formCustomer" :error="state.error"
                        @submitForm="updateCustomer" />
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
const route = useRoute()
const customerUuid = route.params.customer_uuid as string
const breadcrumbLinks = [
    { name: 'Customers', href: '/customers' },
    { name: 'Edit customer', href: `/customers/${customerUuid}/edit` },
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

onMounted(() => {
    fetchCustomer()
})

async function fetchCustomer() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await customerService.getCustomer(customerUuid)
        if (response?.data) {
            state.formCustomer = {
                name: response.data.name ?? '',
                tin: response.data.tin ?? '',
                address: response.data.address ?? '',
                contact_number: response.data.contact_number ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}

async function updateCustomer(customer: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await customerService.updateCustomer(customerUuid, customer)
        if (response?.data) {
            successAlert('Success', 'Customer successfully updated.')
            await navigateTo('/customers')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
