<template>
    <div>

        <Head>
            <Title>Edit shift - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>Edit shift</template>
            <div>
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/shifts">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesShiftForm formType="update" :selectedShift="state.formShift" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateShift" />
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
const { successAlert } = useAlert()
const router = useRouter()
const shiftUuid = router?.currentRoute?.value?.params?.shift_uuid
const breadcrumbLinks = [
    {
        name: 'Shifts',
        href: '/shifts'
    },
    {
        name: 'Edit shift',
        href: `/shifts/${shiftUuid}/edit`
    }
]

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

onMounted(() => {
    fetchShift()

})

async function fetchShift() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await shiftService.getShift(shiftUuid)
        if (response) {
            state.formShift = {
                branch_uuid: response?.data?.branch?.uuid ?? '',
                date: response?.data?.date ?? '',
                name: response?.data?.name ?? '',
                starting_cash: response?.data?.starting_cash?.toString() ?? '',
                is_open: response?.data?.is_open ? true : false,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateShift(shiftDetails: any) {
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
        const response = await shiftService.updateShift(shiftUuid, params)
        if (response.data) {
            successAlert('Success', 'Shift successfully updated.')
            navigateTo('/shifts')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
