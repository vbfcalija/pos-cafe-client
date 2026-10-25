<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">Checklist</p>
                    <FormSelect :options="typeOptions" :canClear="false" :searchable="false"
                        v-model="state.formTask.type" />
                    <FormError :error="v$?.formTask?.type?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.type?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="name" label="Task" />
                    <FormTextField id="name" name="name" placeholder="e.g. Turn on espresso machine & grinder"
                        v-model="state.formTask.name" />
                    <FormError :error="v$?.formTask?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="description" label="Description (optional)" />
                    <FormTextArea name="description" placeholder="Any detail the barista should know" :rows="3"
                        v-model="state.formTask.description" />
                    <FormError :error="props?.error?.errors?.description?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                        @click="navigateTo('/checklist-tasks')">
                        Cancel
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                        {{ props.formType === 'create' ? 'Save' : 'Update' }}
                    </FormButton>
                </div>
            </div>
        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'

const props = defineProps({
    error: {
        type: Object,
        required: false
    },
    formType: {
        type: String,
        required: true
    },
    selectedTask: {
        type: Object,
        required: false
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const typeOptions = [
    { label: 'Opening checklist', value: 'opener' },
    { label: 'Closing checklist', value: 'closer' },
]

const state = reactive({
    formTask: {
        name: '',
        description: '',
        type: 'opener',
    } as any,
    isPageLoading: false,
})

watch(() => props.selectedTask, (newValue: any) => {
    if (newValue != null) {
        state.formTask = {
            name: newValue.name ?? '',
            description: newValue.description ?? '',
            type: newValue.type || 'opener',
        }
    }
}, { immediate: true })

const requiredField = helpers.withMessage('This field is required.', required)
const rules = computed(() => ({
    formTask: {
        name: { required: requiredField },
        type: { required: requiredField },
    },
}))
const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formTask)
    }
}
</script>
