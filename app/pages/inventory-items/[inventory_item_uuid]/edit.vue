<template>
    <div>

        <Head>
            <Title>Edit inventory item - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>Edit inventory item</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/inventory-items">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesInventoryItemForm formType="update" :selectedItem="state.formItem" :error="state.error"
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
const route = useRoute()
const itemUuid = route.params.inventory_item_uuid as string
const breadcrumbLinks = [
    { name: 'Inventory items', href: '/inventory-items' },
    { name: 'Edit inventory item', href: `/inventory-items/${itemUuid}/edit` },
]

const state = reactive({
    error: {} as Error,
    formItem: { name: '', unit: '', low_stock_threshold: '' as any, is_active: true },
    isPageLoading: false,
})

onMounted(async () => {
    state.isPageLoading = true
    try {
        const response = await inventoryItemService.getInventoryItem(itemUuid)
        if (response?.data) {
            state.formItem = {
                name: response.data.name ?? '',
                unit: response.data.unit ?? '',
                low_stock_threshold: response.data.low_stock_threshold ?? '',
                is_active: Boolean(response.data.is_active),
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
})

async function saveItem(itemDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await inventoryItemService.updateInventoryItem(itemUuid, {
            name: itemDetails.name,
            unit: itemDetails.unit,
            low_stock_threshold: itemDetails.low_stock_threshold === '' || itemDetails.low_stock_threshold === null
                ? null
                : Number(itemDetails.low_stock_threshold),
            is_active: itemDetails.is_active,
        })
        if (response.data) {
            successAlert('Success', 'Inventory item successfully updated.')
            navigateTo('/inventory-items')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
