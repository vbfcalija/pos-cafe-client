<template>
    {{ props.data.links.next }}
    <div class="mt-8 flex flex-col-reverse md:grid md:grid-cols-3 items-center gap-y-3"
        v-if="props.data && props.data.links">
        <div class="grow flex flex-row gap-x-3">
            <button class="w-28 bg-tertiary text-white rounded-full text-sm px-4 py-3 hover:bg-tertiary/90"
                v-if="props.data.links && props.data.links.prev !== null"
                @click="!(props.data.links && props.data.links.prev === null) && $emit('previous')">
                Previous
            </button>
            <button class="w-28 bg-tertiary text-white rounded-full text-sm px-4 py-3 hover:bg-tertiary/90"
                v-if="props.data.links && props.data.links.next !== null"
                @click="!(props.data.links && props.data.links.next === null) && $emit('next')">
                Next
            </button>
        </div>
        <div class="text-sm flex items-center justify-center">
            <p v-if="props.data?.meta?.total > 0">
                Showing from
                {{ props.data?.meta && props.data?.meta?.from ? props.data?.meta?.from : 0 }}
                to
                {{ props.data?.meta && props.data?.meta?.to ? props.data?.meta?.to : 0 }}
                of
                {{ props.data?.meta && props.data?.meta?.total ? props.data?.meta?.total : 0 }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    data: {
        type: Object,
        default: null,
    },
})
</script>