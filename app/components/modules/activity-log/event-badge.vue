<template>
    <span
        class="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset"
        :class="meta.class">
        <Icon :name="meta.icon" class="size-3.5" />
        {{ meta.label }}
    </span>
</template>

<script setup lang="ts">
const props = defineProps({
    event: {
        type: String,
        required: true,
    },
})

const events: Record<string, { label: string, icon: string, class: string }> = {
    login: { label: 'Signed in', icon: 'ph:sign-in', class: 'bg-green-50 text-green-800 ring-green-600/20' },
    login_failed: { label: 'Failed sign-in', icon: 'ph:warning-circle', class: 'bg-red-50 text-red-700 ring-red-600/20' },
    logout: { label: 'Signed out', icon: 'ph:sign-out', class: 'bg-gray-50 text-gray-700 ring-gray-500/20' },
    created: { label: 'Created', icon: 'ph:plus-circle', class: 'bg-sky-50 text-sky-800 ring-sky-600/20' },
    updated: { label: 'Updated', icon: 'ph:pencil-simple', class: 'bg-amber-50 text-amber-800 ring-amber-600/20' },
    deleted: { label: 'Deleted', icon: 'ph:trash', class: 'bg-red-50 text-red-700 ring-red-600/20' },
    refunded: { label: 'Refunded', icon: 'ph:arrow-u-up-left', class: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
    verified: { label: 'Verified', icon: 'ph:seal-check', class: 'bg-green-50 text-green-800 ring-green-600/20' },
    reopened: { label: 'Reopened', icon: 'ph:lock-open', class: 'bg-amber-50 text-amber-800 ring-amber-600/20' },
    task_done: { label: 'Task ticked', icon: 'ph:check-square', class: 'bg-green-50 text-green-800 ring-green-600/20' },
    task_undone: { label: 'Task unticked', icon: 'ph:square', class: 'bg-gray-50 text-gray-700 ring-gray-500/20' },
}

const meta = computed(() => events[props.event] ?? {
    label: props.event.replace(/_/g, ' '),
    icon: 'ph:dot-outline',
    class: 'bg-gray-50 text-gray-700 ring-gray-500/20',
})
</script>
