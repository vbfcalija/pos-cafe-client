<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <div class="flex items-center justify-between">
                        <p class="text-sm text-gray-600">Branch</p>
                        <button type="button"
                            class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            @click="state.isCreateBranchOpen = true">
                            <Icon name="ph:plus" class="size-4" /> Create new branch
                        </button>
                    </div>
                    <FormSelect :options="state.branchOptions" :canClear="false"
                        v-model="state.formShift.branch_uuid" />
                    <FormError :error="v$?.formShift?.branch_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.branch_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date" label="Date" />
                    <FormDateField id="date" name="date" placeholder="Date" v-model="state.formShift.date" />
                    <FormError :error="v$?.formShift?.date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="name" label="Name" />
                    <FormTextField id="name" name="name" placeholder="Name" v-model="state.formShift.name" />
                    <FormError :error="v$?.formShift?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="starting_cash" label="Starting cash" />
                    <FormNumberField id="starting_cash" name="starting_cash" placeholder="Starting cash" :min="0"
                        v-model="state.formShift.starting_cash" />
                    <FormError :error="v$?.formShift?.starting_cash?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.starting_cash?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer" @click="changeIsOpen">
                        <FormCheckbox :value="state.formShift.is_open" /> Open
                    </div>
                    <FormError :error="props?.error?.errors?.is_open?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 gap-3" :class="props.showCancel && 'md:grid-cols-2'">
                    <FormButton v-if="props.showCancel" type="button" buttonStyle="cancel" class="rounded-md"
                        @click="navigateTo('/shifts')">
                        Cancel</FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                        {{ props.submitLabel || (props.formType === 'create' ? 'Save' : 'Update') }}
                    </FormButton>
                </div>
            </div>
        </form>
        <ModulesBranchCreateModal :show="state.isCreateBranchOpen" @close="state.isCreateBranchOpen = false"
            @created="handleBranchCreated" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers, minValue } from '@vuelidate/validators'
import { branchService } from '@/components/api/user/BranchService'
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
    selectedShift: {
        type: Object,
        required: false
    },
    showCancel: {
        type: Boolean,
        required: false,
        default: true,
    },
    submitLabel: {
        type: String,
        required: false,
        default: '',
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const state = reactive({
    error: {} as Error,
    formShift: {
        branch_uuid: '',
        date: '',
        name: '',
        starting_cash: '',
        is_open: true,
    } as any,
    isPageLoading: false,
    branchOptions: [] as any[],
    isCreateBranchOpen: false,
})

onMounted(() => {
    fetchBranches()
})

watch(() => props.selectedShift, (newValue: any) => {
    if (newValue != null) {
        state.formShift = {
            branch_uuid: newValue.branch_uuid,
            date: newValue.date,
            name: newValue.name,
            starting_cash: newValue.starting_cash,
            is_open: newValue.is_open,
        }
    }
}, { immediate: true })

const requiredField = helpers.withMessage('This field is required.', required)
const rules = computed(() => ({
    formShift: {
        branch_uuid: { required: requiredField },
        date: { required: requiredField },
        name: { required: requiredField },
        starting_cash: {
            required: requiredField,
            minValue: helpers.withMessage('Starting cash must be at least 0.', minValue(0)),
        },
    },
}))
const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) emit('submitForm', state.formShift)
}

async function fetchBranches() {
    try {
        const response = await branchService.getBranches({
            page: 1,
            page_length: 500,
            sortField: 'created_at',
            sortOrder: 'descend',
            search: [],
        })
        state.branchOptions = response?.data?.filter((branch: any) => branch.is_active).map((branch: any) => ({
            label: branch.name,
            value: branch.uuid,
        })) ?? []
        if (!state.formShift.branch_uuid && state.branchOptions.length > 0) {
            state.formShift.branch_uuid = state.branchOptions[0].value
        }
    } catch (error: any) {
        state.error = error
    }
}

function changeIsOpen() {
    state.formShift.is_open = !state.formShift.is_open
}

function handleBranchCreated(branch: any) {
    if (!state.branchOptions.some((option: any) => option.value === branch.uuid)) {
        state.branchOptions.unshift({ label: branch.name, value: branch.uuid })
    }
    state.formShift.branch_uuid = branch.uuid
    state.isCreateBranchOpen = false
}
</script>
