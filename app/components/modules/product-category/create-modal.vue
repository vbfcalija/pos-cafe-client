<template>
    <Modal size="sm" title="Create new category" :show="props.show" @close="$emit('close')">
        <template #modal-body>
            <ModulesProductCategoryForm formType="create" :selectedProductCategory="state.formProductCategory"
                :error="state.error" :showCancel="false" submitLabel="Create category"
                @submitForm="saveProductCategory" />
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { categoryService } from '@/components/api/user/CategoryService'
import type { Error } from '@/types'

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'created'])

const state = reactive({
    error: {} as Error,
    formProductCategory: {
        name: '',
        description: '',
        color: '#000000',
    },
    isSubmitting: false,
})

async function saveProductCategory(productCategoryDetails: any) {
    if (state.isSubmitting) return
    state.error = {}
    state.isSubmitting = true
    try {
        const response = await categoryService.saveCategory({
            name: productCategoryDetails.name,
            description: productCategoryDetails.description,
            color: productCategoryDetails.color,
        })
        if (response?.data) {
            emit('created', response.data)
            resetForm()
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isSubmitting = false
    }
}

function resetForm() {
    state.formProductCategory = {
        name: '',
        description: '',
        color: '#000000',
    }
    state.error = {}
}
</script>
