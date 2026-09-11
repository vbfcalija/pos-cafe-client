<template>
    <Modal size="sm" title="Start a new shift" :show="props.show" :canClose="props.canClose" @close="$emit('close')">
        <template #modal-body>
            <p class="text-sm text-gray-600">
                {{
                    props.canClose ?
                        'Create another shift and switch to it.' :
                        'Create a shift before starting a POS transaction.'
                }}
            </p>
            <ModulesShiftForm formType="create" :selectedShift="state.formShift" :error="state.error"
                :showCancel="false" submitLabel="Start shift"
                @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveShift" />
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { shiftService } from '@/components/api/user/ShiftService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useBranchStore } from '@/store/branch'
import { useUserStore } from '@/store/user'
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
    canClose: {
        type: Boolean,
        default: false,
    },
})
const emit = defineEmits(['created', 'close'])

const branchStore = useBranchStore() as any
const userStore = useUserStore() as any
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    error: {} as Error,
    formShift: {
        branch_uuid: branchStore.getSelectedBranch?.uuid ?? '',
        date: currentDate(),
        name: defaultShiftName(),
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
        if (response?.data) {
            branchStore.setSelectedBranch({ uuid: shiftDetails.branch_uuid })
            emit('created', response.data)
            state.formShift = {
                branch_uuid: shiftDetails.branch_uuid,
                date: currentDate(),
                name: defaultShiftName(),
                starting_cash: '',
                is_open: true,
            }
        }
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

function defaultShiftName() {
    const user = userStore.getUser
    const userName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'User'

    return `${userName} - ${formatDateToReadable(currentDate())} - Shift`
}
</script>
