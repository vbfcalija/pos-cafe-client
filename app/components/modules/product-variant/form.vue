<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="product_uuid" label="Product" />
                    <FormSelect :options="state.productOptions" v-model="state.formProductVariant.product_uuid" />
                    <FormError :error="v$?.formProductVariant?.product_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.product_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="name" label="Name" />
                    <FormTextField id="name" name="name" placeholder="Name" v-model="state.formProductVariant.name" />
                    <FormError :error="v$?.formProductVariant?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="price" label="Price" />
                    <FormNumberField name="price" placeholder="Price" :min="0"
                        v-model="state.formProductVariant.price" />
                    <FormError :error="v$?.formProductVariant?.price?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.price?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="cost" label="Cost" />
                    <FormNumberField name="cost" placeholder="Cost" :min="0" v-model="state.formProductVariant.cost" />
                    <FormError :error="v$?.formProductVariant?.cost?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.cost?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer" @click="changeIsActive">
                        <FormCheckbox :value="state.formProductVariant.is_active" /> Active
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                        @click="navigateTo('/product-variants')">
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
import { productService } from '@/components/api/user/ProductService'
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
    selectedProductVariant: {
        type: Object,
        required: false
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const state = reactive({
    error: {} as Error,
    formProductVariant: {
        product_uuid: '',
        name: '',
        price: '',
        cost: '',
        is_active: false
    } as any,
    isPageLoading: false,
    productOptions: [] as any[],
})

onMounted(() => {
    fetchProducts()
})

watch(() => props.selectedProductVariant, (newValue: any) => {
    if (newValue != null) {
        state.formProductVariant = {
            product_uuid: newValue.product_uuid,
            name: newValue.name,
            price: newValue.price,
            cost: newValue.cost,
            is_active: newValue.is_active,
        }
    }
})

const requiredField = helpers.withMessage('This field is required.', required)
const rules = computed(() => ({
    formProductVariant: {
        product_uuid: { required: requiredField },
        name: { required: requiredField },
        price: { required: requiredField, minValue: helpers.withMessage('Price must be at least 0.', minValue(0)) },
        cost: { required: requiredField, minValue: helpers.withMessage('Cost must be at least 0.', minValue(0)) },
    },
}))
const v$ = useVuelidate(rules, state)

async function fetchProducts() {
    try {
        const response = await productService.getProducts({ page: 1, page_length: 500 })
        state.productOptions = response?.data?.map((product: any) => ({
            label: product.name,
            value: product.uuid,
        })) ?? []
    } catch (error: any) {
        state.error = error
    }
}
function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formProductVariant)
    }
}

function changeIsActive() {
    state.formProductVariant.is_active = !state.formProductVariant.is_active
}
</script>
