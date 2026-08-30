<template>
    <div>

        <Head>
            <Title>New shift - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>New shift</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/shifts">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesShiftForm formType="create" :selectedShift="state.formShift" :error="state.error"
                        :showCreateBranch="true" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveShift" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { shiftService } from '@/components/api/user/ShiftService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const breadcrumbLinks = [
    {
        name: 'Shifts',
        href: '/shifts'
    },
    {
        name: 'New shift',
        href: '/shifts/new'
    }
]
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    formShift: {
        branch_uuid: '',
        date: '',
        name: '',
        starting_cash: '',
        is_open: true,
    },
    isPageLoading: false,
})

async function saveShift(shiftDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            branch_uuid: shiftDetails.branch_uuid,
            date: shiftDetails.date,
            name: shiftDetails.name,
            starting_cash: shiftDetails.starting_cash,
            is_open: shiftDetails.is_open,
        }
        const response = await shiftService.saveShift(params)
        if (response.data) {
            successAlert('Success', 'Shift successfully saved.')
            navigateTo('/shifts')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
