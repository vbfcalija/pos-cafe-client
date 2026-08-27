<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="date" label="Date" />
                    <FormDateField id="date" name="date" placeholder="Date" v-model="state.formShift.date" />
                    <FormError :error="v$?.formShift?.date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="name" label="Name" />
                    <FormTextField id="name" name="name" placeholder="Name" v-model="state.formShift.name" />
                    <FormError :error="v$?.formShift?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="starting_cash" label="Starting cash" />
                    <FormNumberField name="starting_cash" placeholder="Starting cash" :min="0"
                        v-model="state.formShift.starting_cash" />
                    <FormError :error="v$?.formShift?.starting_cash?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.starting_cash?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/shifts')">
                        Cancel</FormButton>
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
import { required, helpers, minValue } from '@vuelidate/validators'
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
    selectedShift: {
        type: Object,
        required: false
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const state = reactive({
    error: {} as Error,
    formShift: {
        date: '',
        name: '',
        starting_cash: ''
    } as any,
    isPageLoading: false,
})

watch(() => props.selectedShift, (newValue: any) => {
    if (newValue != null) {
        state.formShift = {
            date: newValue.date,
            name: newValue.name,
            starting_cash: newValue.starting_cash
        }
    }
})

const requiredField = helpers.withMessage('This field is required.', required)
const rules = computed(() => ({
    formShift: {
        date: { required: requiredField },
        name: { required: requiredField },
        starting_cash: {
            required: requiredField,
            minValue: helpers.withMessage('Starting cash must be at least 0.', minValue(0)),
        },
    },
}))
const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) emit('submitForm', state.formShift)
}
</script>
