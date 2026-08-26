<template>
    <div>
        <Modal size="xs" :title="props.title ? props.title : 'Confirmation'" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <p>
                    {{ props.message }}
                </p>
                <slot name="extra" />
                <div class="mt-5 flex gap-x-3">
                    <FormButton buttonStyle="cancel" @click="closeModal" class="w-full">
                        Cancel
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="handleConfirmation" class="w-full">
                        Confirm
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    message: {
        type: String,
        required: false,
    },
    title: {
        type: String,
        required: false,
    },
})

const emit = defineEmits(['close', 'confirm'])

function closeModal() {
    emit('close')
}

function handleConfirmation() {
    emit('confirm')
    emit('close')
}
</script>