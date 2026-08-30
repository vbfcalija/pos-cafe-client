<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="name" label="Name" />
                    <FormTextField id="name" name="name" placeholder="Name" v-model="state.formTaxRate.name" />
                    <FormError :error="v$?.formTaxRate?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="percentage" label="Percentage" />
                    <FormNumberField name="percentage" placeholder="Percentage" :min="0"
                        v-model="state.formTaxRate.percentage" />
                    <FormError :error="v$?.formTaxRate?.percentage?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.percentage?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/tax-rates')">
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
import { required, helpers, minValue, maxValue } from '@vuelidate/validators'
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
    selectedTaxRate: {
        type: Object,
        required: false
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const state = reactive({
    error: {} as Error,
    formTaxRate: {
        name: '',
        percentage: ''
    } as any,
    isPageLoading: false,
})

watch(() => props.selectedTaxRate, (newValue: any) => {
    if (newValue != null) {
        state.formTaxRate = {
            name: newValue.name,
            percentage: newValue.percentage
        }
    }
})

const requiredField = helpers.withMessage('This field is required.', required)
const rules = computed(() => ({
    formTaxRate: {
        name: { required: requiredField },
        percentage: {
            required: requiredField,
            minValue: helpers.withMessage('Percentage must be at least 0.', minValue(0)),
            maxValue: helpers.withMessage('Percentage must not exceed 100.', maxValue(100)),
        },
    },
}))
const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) emit('submitForm', state.formTaxRate)
}
</script>
