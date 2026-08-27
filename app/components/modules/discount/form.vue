<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="name" label="Name" />
                    <FormTextField id="name" name="name" placeholder="Name" v-model="state.formDiscount.name" />
                    <FormError :error="v$?.formDiscount?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="type" label="Type" />
                    <FormSelect :options="discountTypes" :searchable="false" :canClear="false"
                        v-model="state.formDiscount.type" />
                    <FormError :error="v$?.formDiscount?.type?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.type?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="value" label="Value" />
                    <FormNumberField name="value" placeholder="Value" :min="0"
                        v-model="state.formDiscount.value" />
                    <FormError :error="v$?.formDiscount?.value?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.value?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                        @click="navigateTo('/discounts')">
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
import { required, helpers, minValue } from '@vuelidate/validators'
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedDiscount: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const discountTypes = [
    { label: 'Percentage', value: 'percentage' },
    { label: 'Amount', value: 'amount' },
]

const state = reactive({
    error: {} as Error,
    formDiscount: {
        name: '',
        type: 'percentage',
        value: '',
    } as any,
    isPageLoading: false,
})

watch(() => props.selectedDiscount, (newValue: any) => {
    if (newValue != null) {
        state.formDiscount = {
            name: newValue.name,
            type: newValue.type,
            value: newValue.value,
        }
    }
})

const rules = computed(() => {
    return {
        formDiscount: {
            name: {
                required: helpers.withMessage('This field is required.', required),
            },
            type: {
                required: helpers.withMessage('This field is required.', required),
            },
            value: {
                required: helpers.withMessage('This field is required.', required),
                minValue: helpers.withMessage('Value must be at least 0.', minValue(0)),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formDiscount)
    }
}
</script>
