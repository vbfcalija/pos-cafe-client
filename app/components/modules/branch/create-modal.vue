<template>
    <Modal size="sm" title="Create new branch" :show="props.show" @close="$emit('close')">
        <template #modal-body>
            <ModulesBranchForm formType="create" :selectedBranch="state.formBranch" :error="state.error"
                :showCancel="false" submitLabel="Create branch" @submitForm="saveBranch" />
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { branchService } from '@/components/api/user/BranchService'
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
    formBranch: {
        name: '',
        address: '',
        phone: '',
        alternate_phone: '',
        email: '',
        is_active: true,
    },
    isSubmitting: false,
})

async function saveBranch(branchDetails: any) {
    if (state.isSubmitting) return
    state.error = {}
    state.isSubmitting = true
    try {
        const response = await branchService.saveBranch({
            name: branchDetails.name,
            address: branchDetails.address,
            phone: branchDetails.phone,
            alternate_phone: branchDetails.alternate_phone,
            email: branchDetails.email,
            is_active: branchDetails.is_active,
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
    state.formBranch = {
        name: '',
        address: '',
        phone: '',
        alternate_phone: '',
        email: '',
        is_active: true,
    }
    state.error = {}
}
</script>
