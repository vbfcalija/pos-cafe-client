<template>
    <div class="flex min-w-0 items-center gap-3">
        <span
            class="flex size-11 shrink-0 overflow-hidden rounded-xl border border-primary-700 bg-primary-900 shadow-lg shadow-black/15 ring-1 ring-primary-300/40">
            <img src="/images/brthrs-cafe-logo.jpeg" alt="Brthrs Café logo" class="size-full scale-110 object-cover"
                width="44" height="44" />
        </span>
        <div class="min-w-0 leading-tight">
            <p class="truncate text-base font-bold tracking-tight text-white">
                {{ appName }}
            </p>
            <p class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-200">
                Point of Sale
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const appName = computed(() => runtimeConfig.public.appName || 'Cafe POS')
</script>
