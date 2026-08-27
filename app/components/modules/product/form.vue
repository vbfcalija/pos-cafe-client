<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="sku" label="SKU" />
                    <FormTextField id="sku" name="sku" placeholder="SKU" v-model="state.formProduct.sku" />
                    <FormError :error="v$?.formProduct?.sku?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.sku?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="barcode" label="Barcode" />
                    <FormTextField id="barcode" name="barcode" placeholder="Barcode"
                        v-model="state.formProduct.barcode" />
                    <FormError :error="props?.error?.errors?.barcode?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="name" label="Name" />
                    <FormTextField id="name" name="name" placeholder="Name" v-model="state.formProduct.name" />
                    <FormError :error="v$?.formProduct?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="price" label="Price" />
                    <FormNumberField name="price" placeholder="Price" :min="0" v-model="state.formProduct.price" />
                    <FormError :error="v$?.formProduct?.price?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.price?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="cost" label="Cost" />
                    <FormNumberField name="cost" placeholder="Cost" :min="0" v-model="state.formProduct.cost" />
                    <FormError :error="v$?.formProduct?.cost?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.cost?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="color" label="Color" />
                    <FormColorPicker id="color" v-model="state.formProduct.color" />
                    <FormError :error="props?.error?.errors?.color?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="category_uuid" label="Category" />
                    <FormSelect :options="state.categoryOptions" v-model="state.formProduct.category_uuid" />
                    <FormError :error="v$?.formProduct?.category_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.category_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="tax_rate_uuid" label="Tax rate" />
                    <FormSelect :options="state.taxRateOptions" v-model="state.formProduct.tax_rate_uuid" />
                    <FormError :error="v$?.formProduct?.tax_rate_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.tax_rate_uuid?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/products')">
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
import { categoryService } from '@/components/api/user/CategoryService'
import { taxRateService } from '@/components/api/user/TaxRateService'
import type { Error } from '@/types'

const props = defineProps({
    error: { type: Object, required: false },
    formType: { type: String, required: true },
    selectedProduct: { type: Object, required: false },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])
const state = reactive({
    error: {} as Error,
    formProduct: {
        sku: '',
        barcode: '',
        name: '',
        price: '',
        cost: '',
        color: '#000000',
        category_uuid: '',
        tax_rate_uuid: '',
    } as any,
    isPageLoading: false,
    categoryOptions: [] as any[],
    taxRateOptions: [] as any[],
})

onMounted(() => {
    fetchOptions()
})

watch(() => props.selectedProduct, (newValue: any) => {
    if (newValue != null) {
        state.formProduct = {
            sku: newValue.sku,
            barcode: newValue.barcode,
            name: newValue.name,
            price: newValue.price,
            cost: newValue.cost,
            color: newValue.color || '#000000',
            category_uuid: newValue.category_uuid,
            tax_rate_uuid: newValue.tax_rate_uuid,
        }
    }
})

const requiredField = helpers.withMessage('This field is required.', required)
const rules = computed(() => ({
    formProduct: {
        sku: { required: requiredField },
        name: { required: requiredField },
        price: { required: requiredField, minValue: helpers.withMessage('Price must be at least 0.', minValue(0)) },
        cost: { required: requiredField, minValue: helpers.withMessage('Cost must be at least 0.', minValue(0)) },
        category_uuid: { required: requiredField },
        tax_rate_uuid: { required: requiredField },
    },
}))
const v$ = useVuelidate(rules, state)

async function fetchOptions() {
    try {
        const [categories, taxRates] = await Promise.all([
            categoryService.getCategories({ page: 1, page_length: 500 }),
            taxRateService.getTaxRates({ page: 1, page_length: 500 }),
        ])
        state.categoryOptions = categories?.data?.map((category: any) => ({ label: category.name, value: category.uuid })) ?? []
        state.taxRateOptions = taxRates?.data?.map((taxRate: any) => ({
            label: `${taxRate.name} (${taxRate.percentage}%)`, value: taxRate.uuid,
        })) ?? []
    } catch (error: any) {
        state.error = error
    }
}

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formProduct)
    }
}
</script>
