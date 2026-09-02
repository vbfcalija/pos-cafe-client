<template>
    <Modal size="sm" title="Create new product" :show="props.show" @close="$emit('close')">
        <template #modal-body>
            <ModulesProductForm formType="create" :selectedProduct="state.formProduct" :error="state.error"
                :showCancel="false" submitLabel="Create product" @submitForm="saveProduct" />
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { productService } from '@/components/api/user/ProductService'
import type { Error } from '@/types'

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'created'])

const emptyProduct = () => ({
    sku: '', barcode: '', name: '', color: '#000000',
    category_uuid: '', tax_rate_uuid: '',
})
const state = reactive({
    error: {} as Error,
    formProduct: emptyProduct(),
    isSubmitting: false,
})

async function saveProduct(productDetails: any) {
    if (state.isSubmitting) return
    state.error = {}
    state.isSubmitting = true
    try {
        const response = await productService.saveProduct({ ...productDetails })
        if (response?.data) {
            emit('created', response.data)
            state.formProduct = emptyProduct()
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isSubmitting = false
    }
}
</script>
