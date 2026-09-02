<template>
    <Modal size="sm" title="Start a new shift" :show="props.show" :canClose="false">
        <template #modal-body>
            <p class="text-sm text-gray-600">Create a shift before starting a POS transaction.</p>
            <ModulesShiftForm formType="create" :selectedShift="state.formShift" :error="state.error"
                :showCancel="false" submitLabel="Start shift"
                @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveShift" />
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { shiftService } from '@/components/api/user/ShiftService'
import type { Error } from '@/types'

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    computerId: {
        type: String,
        required: true,
    },
})
const emit = defineEmits(['created'])

const state = reactive({
    error: {} as Error,
    formShift: {
        branch_uuid: '',
        date: currentDate(),
        name: '',
        starting_cash: '',
        is_open: true,
    },
    isPageLoading: false,
})

async function saveShift(shiftDetails: any) {
    if (state.isPageLoading) return
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await shiftService.saveShift({
            branch_uuid: shiftDetails.branch_uuid,
            date: shiftDetails.date,
            name: shiftDetails.name,
            starting_cash: shiftDetails.starting_cash,
            computer_id: props.computerId,
            is_open: true,
        })
        if (response?.data) emit('created', response.data)
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}

function currentDate() {
    const date = new Date()
    const offset = date.getTimezoneOffset()
    return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 10)
}
</script>
