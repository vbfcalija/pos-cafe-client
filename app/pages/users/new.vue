<template>
    <div>

        <Head>
            <Title>New user - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template><template #header>New user</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink class="text-gray-700 flex items-center gap-x-2 mb-3" to="/users">
                    <Icon name="ph:arrow-left" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserForm formType="create" :selectedUser="state.formUser" :error="state.error"
                        @submitForm="saveUser" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>
<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const breadcrumbLinks = [
    {
        name: 'Users',
        href: '/users'
    },
    {
        name: 'New user',
        href: '/users/new'
    }
]
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    formUser: {
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        is_active: false
    },
    isPageLoading: false,
})

async function saveUser(userDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            email: userDetails.email,
            password: userDetails.password,
            firstname: userDetails.firstname,
            lastname: userDetails.lastname,
            is_active: userDetails.is_active
        }
        const response = await userService.saveUser(params)
        if (response.data) {
            successAlert('Success', 'User successfully saved.')
            navigateTo('/users')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
