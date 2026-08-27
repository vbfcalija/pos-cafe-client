<template>
    <div>

        <Head>
            <Title>Edit branch - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>
                Edit branch
            </template>

            <div>
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/branches">
                    <Icon name="ph:arrow-left" size="20" />
                    <span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesBranchForm formType="update" :selectedBranch="state.formBranch" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateBranch" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { branchService } from '@/components/api/user/BranchService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const router = useRouter()
const branchUuid = router?.currentRoute?.value?.params?.branch_uuid
const breadcrumbLinks = [
    {
        name: 'Branches',
        href: '/branches',
    },
    {
        name: 'Edit branch',
        href: `/branches/${branchUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formBranch: {
        name: '',
        address: '',
        phone: '',
        alternate_phone: '',
        email: '',
        is_active: false,
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchBranch()
})

async function fetchBranch() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await branchService.getBranch(branchUuid)
        if (response) {
            state.formBranch = {
                name: response?.data?.name ?? '',
                address: response?.data?.address ?? '',
                phone: response?.data?.phone ?? '',
                alternate_phone: response?.data?.alternate_phone ?? '',
                email: response?.data?.email ?? '',
                is_active: response?.data?.is_active ? true : false,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateBranch(branchDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: branchDetails.name,
            address: branchDetails.address,
            phone: branchDetails.phone,
            alternate_phone: branchDetails.alternate_phone,
            email: branchDetails.email,
            is_active: branchDetails.is_active,
        }
        const response = await branchService.updateBranch(branchUuid, params)
        if (response.data) {
            successAlert('Success', 'Branch successfully updated.')
            navigateTo('/branches')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>