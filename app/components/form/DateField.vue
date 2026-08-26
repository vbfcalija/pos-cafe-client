<template>
    <flat-pickr v-model="state.dateValue" :id="props.id" :name="props.name" @on-change="updateValue"
        :placeholder="props.placeholder" :class="[
            props.dateType === 'duty-schedule' && 'h-11 text-center rounded-none border-l-0 border-r-0 border border-gray-300 focus:outline-none',
            props.dateType === 'calendar' && 'h-11 text-center rounded-none border-0 focus:outline-none bg-transparent',
            !props.dateType && 'rounded-lg border border-gray-200 focus:outline-none focus:ring-primary focus:border-primary',
            'appearance-none block w-full px-5 py-3 placeholder-gray-500 text-gray-900 focus:z-10 sm:text-sm'
        ]" />
</template>

<script setup lang="ts">
import moment from 'moment'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'

const props = defineProps({
    id: {
        type: String,
        required: false,
    },
    dateType: {
        type: String,
        required: false,
    },
    disablePreviousWeeks: {
        type: Boolean,
        required: false,
        default: false,
    },
    name: {
        type: String,
        required: true,
    },
    modelValue: String,
    placeholder: {
        type: String,
        required: true,
    },
})

const state = reactive({
    dateValue: props.modelValue ? new Date(props.modelValue) : '',
})

watch(() => props.modelValue, (newValue: any) => {
    if (newValue != null && newValue !== '') {
        state.dateValue = new Date(newValue)  // use Date object here
    }
})

const emit = defineEmits(['update:modelValue'])

function updateValue(selectedDates: any) {
    const date = selectedDates?.[0]
    if (date) {
        const formattedDate = moment(date).format('YYYY-MM-DD')
        emit('update:modelValue', formattedDate)
    } else {
        emit('update:modelValue', '')
    }
}
</script>
