<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="name" label="Name" />
                    <FormTextField id="name" name="name" placeholder="Name" v-model="state.formBranch.name" />
                    <FormError :error="v$?.formBranch?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="address" label="Address" />
                    <FormTextArea id="address" name="address" placeholder="Address"
                        v-model="state.formBranch.address" />
                    <FormError :error="v$?.formBranch?.address?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.address?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="phone" label="Phone" />
                    <FormTextField id="phone" name="name" placeholder="Phone" v-model="state.formBranch.phone" />
                    <FormError :error="v$?.formBranch?.phone?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.phone?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="alternate_phone" label="Alternate phone" />
                    <FormTextField id="alternate_phone" name="alternate_phone" placeholder="Alternate phone"
                        v-model="state.formBranch.alternate_phone" />
                    <FormError :error="v$?.formBranch?.alternate_phone?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.alternate_phone?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="email" label="Email address" />
                    <FormTextField id="email" name="email" placeholder="Email address"
                        v-model="state.formBranch.email" />
                    <FormError :error="v$?.formBranch?.email?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.email?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer" @click="changeIsActive">
                        <FormCheckbox :value="state.formBranch.is_active" />
                        Active
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/branches')">
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
    selectedBranch: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const state = reactive({
    error: {} as Error,
    formBranch: {
        name: '',
        address: '',
        phone: '',
        alternate_phone: '',
        email: '',
        is_active: false,
    } as any,
    isPageLoading: false,
})

watch(() => props.selectedBranch, (newValue: any) => {
    if (newValue != null) {
        state.formBranch = {
            name: newValue.name,
            address: newValue.address,
            phone: newValue.phone,
            alternate_phone: newValue.alternate_phone,
            email: newValue.email,
            is_active: newValue.is_active,
        }
    }
})

const requiredField = helpers.withMessage('This field is required.', required)
const rules = computed(() => ({
    formBranch: {
        name: { required: requiredField },
        address: { required: requiredField },
        phone: { required: requiredField },
        email: { required: requiredField },
    },
}))
const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formBranch)
    }
}

function changeIsActive() {
    state.formBranch.is_active = !state.formBranch.is_active
}
</script>
