<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="name" label="Item" />
                <FormTextField id="name" name="name" placeholder="e.g. Beans (Opened)" v-model="state.formItem.name" />
                <FormError :error="v$?.formItem?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="unit" label="Unit" />
                <FormTextField id="unit" name="unit" placeholder="e.g. grams, pcs, pack (1kg)"
                    v-model="state.formItem.unit" />
                <FormError :error="v$?.formItem?.unit?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.unit?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formItem.is_active = !state.formItem.is_active">
                    <FormCheckbox :value="state.formItem.is_active" /> Count this item each day
                </div>
                <p class="text-xs text-gray-500">Untick to stop listing it on new inventory sheets. Past sheets keep it.
                </p>
            </div>
        </div>
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/inventory-items')">
                Cancel
            </FormButton>
            <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                {{ props.formType === 'create' ? 'Save' : 'Update' }}
            </FormButton>
        </div>
    </form>
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
    selectedItem: {
        type: Object,
        required: false
    },
})

const emit = defineEmits(['submitForm'])

const state = reactive({
    formItem: {
        name: '',
        unit: '',
        is_active: true,
    } as any,
})

watch(() => props.selectedItem, (newValue: any) => {
    if (newValue != null) {
        state.formItem = {
            name: newValue.name ?? '',
            unit: newValue.unit ?? '',
            is_active: newValue.is_active ?? true,
        }
    }
}, { immediate: true })

const requiredField = helpers.withMessage('This field is required.', required)
const rules = computed(() => ({
    formItem: {
        name: { required: requiredField },
        unit: { required: requiredField },
    },
}))
const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formItem)
    }
}
</script>
