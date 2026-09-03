<template>
    <Multiselect :close-on-select="true" :searchable="props.searchable" :options="props.options"
        :canClear="props.canClear" :appendToBody="props.appendToBody" :closeOnScroll="props.closeOnScroll"
        no-options-text="This list is empty" noResultsText="No result found" :modelValue="props.modelValue"
        @update:modelValue="$emit('update:modelValue', $event)" />
</template>

<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const props = defineProps({
    appendToBody: {
        type: Boolean,
        default: false
    },
    canClear: {
        type: Boolean,
        default: true
    },
    closeOnScroll: {
        type: Boolean,
        default: false
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
