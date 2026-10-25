<template>
    <div>

        <Head>
            <Title>New checklist task - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>New checklist task</template>
            <div class="bg-white rounded-md p-5">
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/checklist-tasks">
                    <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesTaskForm formType="create" :selectedTask="state.formTask" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveTask" />
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
const route = useRoute()
const breadcrumbLinks = [
    { name: 'Checklist tasks', href: '/checklist-tasks' },
    { name: 'New checklist task', href: '/checklist-tasks/new' },
]
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    formTask: {
        name: '',
        description: '',
        // ?type=closer preselects the closing checklist.
        type: route.query.type === 'closer' ? 'closer' : 'opener',
    },
    isPageLoading: false,
})

async function saveTask(taskDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: taskDetails.name,
            description: taskDetails.description,
            type: taskDetails.type,
        }
        const response = await taskService.saveTask(params)
        if (response.data) {
            successAlert('Success', 'Checklist task successfully saved.')
            navigateTo('/checklist-tasks')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
