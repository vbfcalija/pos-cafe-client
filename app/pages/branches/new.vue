<template>
    <div>

        <Head>
            <Title>New branch - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>New branch</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/branches">
                    <Icon name="ph:arrow-left" size="20" />
                    <span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesBranchForm formType="create" :selectedBranch="state.formBranch" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveBranch" />
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
const breadcrumbLinks = [
    {
        name: 'Branches',
        href: '/branches',
    },
    {
        name: 'New branch',
        href: '/branches/new',
    },
]
const { successAlert } = useAlert()

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

async function saveBranch(branchDetails: any) {
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
        const response = await branchService.saveBranch(params)
        if (response.data) {
            successAlert('Success', 'Branch successfully saved.')
            navigateTo('/branches')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>