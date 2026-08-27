<template>
    <Multiselect :close-on-select="true" :searchable="props.searchable" :options="props.options"
        :canClear="props.canClear" no-options-text="This list is empty" noResultsText="No result found"
        :modelValue="props.modelValue" @update:modelValue="$emit('update:modelValue', $event)" />
</template>

<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const props = defineProps({
    canClear: {
        type: Boolean,
        default: true
    },
    modelValue: {
        default: null
    },
    options: {
        type: [Array, Object],
        required: true,
    },
    searchable: {
        type: Boolean,
        default: true
    },
})

defineEmits(['update:modelValue'])
</script>
