<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form class="mt-6 max-w-2xl" @submit.prevent="submitForm">
            <Alert v-if="props.error?.message" type="danger" :text="props.error.message" />

            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="name" label="Name" />
                    <FormTextField id="name" name="name" placeholder="Name" v-model="state.formCustomer.name" />
                    <FormError :error="v$.formCustomer.name.$errors[0]?.$message.toString()" />
                    <FormError :error="props.error?.errors?.name?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="tin" label="TIN" />
                    <FormTextField id="tin" name="tin" placeholder="TIN" :maxLength="50"
                        v-model="state.formCustomer.tin" />
                    <FormError :error="props.error?.errors?.tin?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="address" label="Address" />
                    <FormTextArea id="address" name="address" placeholder="Address"
                        v-model="state.formCustomer.address" />
                    <FormError :error="props.error?.errors?.address?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="contact_number" label="Contact number" />
                    <FormTextField id="contact_number" name="contact_number" placeholder="Contact number"
                        :maxLength="50" v-model="state.formCustomer.contact_number" />
                    <FormError :error="props.error?.errors?.contact_number?.[0]" />
                </div>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormButton buttonStyle="cancel" class="rounded-md" @click="navigateTo('/customers')">
                    Cancel
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? 'Save' : 'Update' }}
                </FormButton>
            </div>
        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'

const props = defineProps({
    error: { type: Object, required: false },
    formType: { type: String, required: true },
    selectedCustomer: { type: Object, required: false },
})

const emit = defineEmits(['submitForm'])
const state = reactive({
    isPageLoading: false,
    formCustomer: {
        name: '',
        tin: '',
        address: '',
        contact_number: '',
    },
})

watch(() => props.selectedCustomer, (customer: any) => {
    if (!customer) return
    state.formCustomer = {
        name: customer.name ?? '',
        tin: customer.tin ?? '',
        address: customer.address ?? '',
        contact_number: customer.contact_number ?? '',
    }
}, { immediate: true })

const rules = computed(() => ({
    formCustomer: {
        name: {
            required: helpers.withMessage('This field is required.', required),
        },
    },
}))
const v$ = useVuelidate(rules, state)

async function submitForm() {
    const isValid = await v$.value.$validate()
    if (isValid) emit('submitForm', state.formCustomer)
}
</script>
