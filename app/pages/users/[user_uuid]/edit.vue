<template>
    <div>

        <Head>
            <Title>Edit user - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template><template #header>Edit user</template>
            <div>
                <NuxtLink class="text-gray-700 flex items-center gap-x-2 mb-3" to="/users">
                    <Icon name="ph:arrow-left" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserForm formType="update" :selectedUser="state.formUser" :error="state.error"
                        @submitForm="updateUser" />
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
const { successAlert } = useAlert()
const router = useRouter()
const userUuid = router.currentRoute.value.params.user_uuid

const breadcrumbLinks = [
    {
        name: 'Users',
        href: '/users'
    },
    {
        name: 'Edit user',
        href: `/users/${userUuid}/edit`
    }
]
const state = reactive({
    error: {} as Error,
    formUser: {
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        is_active: false
    },
    isPageLoading: false
})

onMounted(() => {
    fetchUser()
})

async function fetchUser() {
    state.isPageLoading = true
    try {
        const response = await userService.getUser(userUuid)
        if (response) {
            state.formUser = {
                email: response.data.email,
                password: '',
                firstname: response.data.firstname,
                lastname: response.data.lastname,
                is_active: response.data.is_active
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateUser(userDetails: any) {
    state.error = {}
    try {
        const params: any = {
            email: userDetails.email,
            firstname: userDetails.firstname,
            lastname: userDetails.lastname,
            is_active: userDetails.is_active
        }
        if (userDetails.password) {
            params.password = userDetails.password
        }
        const response = await userService.updateUser(userUuid, params)
        if (response.data) {
            successAlert('Success', 'User successfully updated.')
            navigateTo('/users')
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>
