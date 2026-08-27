<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
            <Alert type="danger" :text="props?.error?.message" v-if="props.error?.message" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="email" label="Email" />
                    <FormTextField id="email" name="email" placeholder="Email" v-model="state.formUser.email" />
                    <FormError :error="v$?.formUser?.email?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.email?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="password" :label="props.formType === 'create' ? 'Password' : 'New password'" />
                    <FormPasswordField id="password" name="password" placeholder="Password"
                        v-model="state.formUser.password" />
                    <FormError :error="v$?.formUser?.password?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.password?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="firstname" label="First name" />
                    <FormTextField id="firstname" name="firstname" placeholder="First name"
                        v-model="state.formUser.firstname" />
                    <FormError :error="v$?.formUser?.firstname?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.firstname?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="lastname" label="Last name" />
                    <FormTextField id="lastname" name="lastname" placeholder="Last name"
                        v-model="state.formUser.lastname" />
                    <FormError :error="v$?.formUser?.lastname?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.lastname?.[0]" />
                </div>
                <div class="w-fit flex items-center cursor-pointer" @click="changeIsActive">
                    <FormCheckbox :value="state.formUser.is_active" /> Active
                </div>
            </div>
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="navigateTo('/users')">Cancel</FormButton>
                <FormButton type="submit" buttonStyle="primary">{{ props.formType === 'create' ? 'Save' : 'Update' }}
                </FormButton>
            </div>
        </form>
    </LoadingSpinner>
</template>
<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { email, helpers, minLength, required, requiredIf } from '@vuelidate/validators'

const props = defineProps({
    error: Object,
    formType: {
        type: String,
        required: true
    },
    selectedUser: Object
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const state = reactive({
    formUser: {
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        is_active: false
    } as any,
    isPageLoading: false
})

watch(() => props.selectedUser, (newValue: any) => {
    if (newValue != null) {
        state.formUser = {
            email: newValue.email,
            password: '',
            firstname: newValue.firstname,
            lastname: newValue.lastname,
            is_active: newValue.is_active
        }
    }
})

const requiredField = helpers.withMessage('This field is required.', required)
const rules = computed(() => ({
    formUser: {
        email: { required: requiredField, email: helpers.withMessage('Enter a valid email.', email) },
        password: {
            required: helpers.withMessage('This field is required.', requiredIf(() => props.formType === 'create')),
            minLength: helpers.withMessage('Password must have at least 8 characters.', minLength(8)),
        },
        firstname: { required: requiredField },
        lastname: { required: requiredField },
    }
}))
const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formUser)
    }
}

function changeIsActive() {
    state.formUser.is_active = !state.formUser.is_active
}
</script>
