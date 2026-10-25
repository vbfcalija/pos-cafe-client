<template>
    <div>

        <Head>
            <Title>Edit checklist task - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>Edit checklist task</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/checklist-tasks">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesTaskForm formType="update" :selectedTask="state.formTask" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateTask" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { taskService } from '@/components/api/user/TaskService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const router = useRouter()
const taskUuid = router?.currentRoute?.value?.params?.task_uuid
const breadcrumbLinks = [
    { name: 'Checklist tasks', href: '/checklist-tasks' },
    { name: 'Edit checklist task', href: `/checklist-tasks/${taskUuid}/edit` },
]

const state = reactive({
    error: {} as Error,
    formTask: {
        name: '',
        description: '',
        type: 'opener',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchTask()
})

async function fetchTask() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await taskService.getTask(taskUuid)
        if (response) {
            state.formTask = {
                name: response?.data?.name ?? '',
                description: response?.data?.description ?? '',
                type: response?.data?.type ?? 'opener',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateTask(taskDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: taskDetails.name,
            description: taskDetails.description,
            type: taskDetails.type,
        }
        const response = await taskService.updateTask(taskUuid, params)
        if (response.data) {
            successAlert('Success', 'Checklist task successfully updated.')
            navigateTo('/checklist-tasks')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
