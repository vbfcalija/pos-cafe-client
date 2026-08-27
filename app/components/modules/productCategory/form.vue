<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="name" label="Name" />
                    <FormTextField id="name" name="name" placeholder="Name" v-model="state.formProductCategory.name" />
                    <FormError :error="v$?.formProductCategory?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="description" label="Description" />
                    <FormTextArea id="description" name="description" placeholder="Description"
                        v-model="state.formProductCategory.description" />
                    <FormError :error="props?.error?.errors?.description?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="color" label="Color" />
                    <FormColorPicker id="color" v-model="state.formProductCategory.color" />
                    <FormError :error="props?.error?.errors?.color?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                        @click="navigateTo('/product-categories')">Cancel</FormButton>
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
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false
    },
    formType: {
        type: String,
        required: true
    },
    selectedProductCategory: {
        type: Object,
        required: false
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const state = reactive({
    error: {} as Error,
    formProductCategory: {
        name: '',
        description: '',
        color: '#000000'
    } as any,
    isPageLoading: false,
})

watch(() => props.selectedProductCategory, (newValue: any) => {
    if (newValue != null) {
        state.formProductCategory = {
            name: newValue.name,
            description: newValue.description,
            color: newValue.color || '#000000',
        }
    }
})

const requiredField = helpers.withMessage('This field is required.', required)
const rules = computed(() => ({
    formProductCategory: {
        name: { required: requiredField },
    },
}))
const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formProductCategory)
    }
}
</script>
