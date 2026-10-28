<template>
    <div>

        <Head>
            <Title>New inventory item - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>New inventory item</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/inventory-items">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesInventoryItemForm formType="create" :selectedItem="state.formItem" :error="state.error"
                        @submitForm="saveItem" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { inventoryItemService } from '@/components/api/user/InventoryItemService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const breadcrumbLinks = [
    { name: 'Inventory items', href: '/inventory-items' },
    { name: 'New inventory item', href: '/inventory-items/new' },
]

const state = reactive({
    error: {} as Error,
    formItem: { name: '', unit: '', is_active: true },
    isPageLoading: false,
})

async function saveItem(itemDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await inventoryItemService.saveInventoryItem({
            name: itemDetails.name,
            unit: itemDetails.unit,
            is_active: itemDetails.is_active,
        })
        if (response.data) {
            successAlert('Success', 'Inventory item successfully saved.')
            navigateTo('/inventory-items')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
