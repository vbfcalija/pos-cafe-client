<template>
    <Modal size="sm" title="Arrange items" titleIcon="ph:arrows-down-up" titleIconColor="6e4430" :show="props.show"
        @close="$emit('close')">
        <template #modal-body>
            <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
            <p class="text-sm text-gray-600">
                Drag the
                <Icon name="ph:dots-six-vertical-bold" class="size-4 align-text-bottom" />
                handle, or use the arrows, to set the order items are listed on each day's inventory. Top of the list
                is shown first.
            </p>

            <div ref="scroller" class="relative mt-4 -mx-2 px-2 max-h-[55vh] overflow-y-auto overscroll-contain">
                <div v-if="state.isLoading" class="py-10 text-center text-sm text-gray-500">Loading items…</div>
                <ul v-else class="space-y-2 pb-2">
                    <li v-for="(item, index) in state.list" :key="item.uuid" :ref="(el) => setRow(item.uuid, el)"
                        class="relative flex items-center gap-2 rounded-xl border bg-white pl-1 pr-2 py-1.5 select-none"
                        :class="[
                            state.dragIndex === index
                                ? 'z-10 border-primary-700 shadow-lg ring-2 ring-primary-200'
                                : 'border-gray-200 shadow-sm',
                            (state.dragIndex === index ? state.settling : state.animate) ? 'transition-transform duration-200 ease-out' : '',
                        ]" :style="rowStyle(index)">
                        <button type="button" aria-label="Drag to reorder"
                            class="touch-none flex items-center justify-center size-9 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
                            :class="state.dragIndex === index ? 'cursor-grabbing text-primary-700' : 'cursor-grab'"
                            @pointerdown.prevent="startDrag($event, index)" @keydown.up.prevent="move(index, -1)"
                            @keydown.down.prevent="move(index, 1)">
                            <Icon name="ph:dots-six-vertical-bold" class="size-5" />
                        </button>
                        <span
                            class="flex-none w-8 text-center text-xs font-semibold tabular-nums rounded-md py-1 bg-gray-100 text-gray-500">
                            {{ index + 1 }}
                        </span>
                        <div class="min-w-0 grow">
                            <p class="truncate text-sm font-medium text-gray-900"
                                :class="!item.is_active && 'text-gray-400'">{{ item.name }}</p>
                            <p class="truncate text-xs text-gray-500">
                                {{ item.unit }}<span v-if="!item.is_active"> · Not counted</span>
                            </p>
                        </div>
                        <div class="flex-none flex items-center">
                            <button type="button" aria-label="Move up" :disabled="index === 0"
                                class="size-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-25 disabled:pointer-events-none"
                                @click="move(index, -1)">
                                <Icon name="ph:caret-up-bold" class="size-4" />
                            </button>
                            <button type="button" aria-label="Move down" :disabled="index === state.list.length - 1"
                                class="size-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-25 disabled:pointer-events-none"
                                @click="move(index, 1)">
                                <Icon name="ph:caret-down-bold" class="size-4" />
                            </button>
                        </div>
                    </li>
                </ul>
            </div>

            <div class="sticky bottom-0 -mx-8 mt-2 px-8 py-4 bg-white border-t border-gray-100">
                <p class="mb-3 text-xs h-4" :class="isDirty ? 'text-primary-700' : 'text-gray-400'">
                    {{ isDirty ? 'Order changed. Not saved yet.' : 'No changes yet.' }}
                </p>
                <div class="grid grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="$emit('close')">
                        Cancel
                    </FormButton>
                    <FormButton type="button" buttonStyle="primary" class="rounded-md"
                        :class="(!isDirty || state.isSaving) && 'opacity-50 pointer-events-none'" @click="save">
                        {{ state.isSaving ? 'Saving…' : 'Save order' }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { inventoryItemService } from '@/components/api/user/InventoryItemService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'saved'])
const { successAlert } = useAlert()

const state = reactive({
    list: [] as any[],
    originalOrder: [] as string[],
    isLoading: false,
    isSaving: false,
    dragIndex: -1,
    overIndex: -1,
    dragDelta: 0,
    animate: true,
    settling: false,
    error: {} as Error,
})

const scroller = ref<HTMLElement | null>(null)
const rows = new Map<string, HTMLElement>()

function setRow(uuid: string, el: any) {
    if (el) rows.set(uuid, el as HTMLElement)
    else rows.delete(uuid)
}

const isDirty = computed(() => state.list.some((item, index) => state.originalOrder[index] !== item.uuid))

watch(() => props.show, (open) => {
    if (open) load()
    else cancelDrag()
})

async function load() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await inventoryItemService.getInventoryItems({
            page: 1,
            page_length: 500,
            sortField: 'sort_order',
            sortOrder: 'ascend',
        })
        state.list = response?.data ?? []
        state.originalOrder = state.list.map(item => item.uuid)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= state.list.length) return
    const [item] = state.list.splice(index, 1)
    state.list.splice(target, 0, item)
    // Keep the row in view when the arrows push it past the visible edge.
    const uuid = item.uuid
    nextTick(() => rows.get(uuid)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
}

// Dragging. The list isn't reordered while the pointer is down: the grabbed
// row follows the pointer, the rows it passes slide aside to open a gap, and
// the list is reordered once, on drop. Listeners sit on the window rather
// than using pointer capture so they survive however the row is re-rendered.
let startY = 0
let startScroll = 0
let pointerY = 0
let slot = 0 // distance from one row to the next (row height + gap)
let frame = 0
let settleTimer: ReturnType<typeof setTimeout> | undefined

function startDrag(event: PointerEvent, index: number) {
    if (state.dragIndex !== -1) return
    if (event.button !== undefined && event.button !== 0) return
    const row = rows.get(state.list[index].uuid)
    const next = rows.get(state.list[index + 1]?.uuid) ?? rows.get(state.list[index - 1]?.uuid)
    if (!row) return
    slot = next ? Math.abs(next.offsetTop - row.offsetTop) : row.offsetHeight + 8
    startY = pointerY = event.clientY
    startScroll = scroller.value?.scrollTop ?? 0
    state.animate = true
    state.dragIndex = state.overIndex = index
    state.dragDelta = 0
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', cancelDrag)
    frame = requestAnimationFrame(tick)
}

function onPointerMove(event: PointerEvent) {
    pointerY = event.clientY
    followPointer()
}

// How far the grabbed row has travelled, counting any scrolling done since
// the grab, kept inside the list so it can't be dragged past either end.
function followPointer() {
    if (state.dragIndex === -1) return
    const scrolled = (scroller.value?.scrollTop ?? 0) - startScroll
    const min = -state.dragIndex * slot
    const max = (state.list.length - 1 - state.dragIndex) * slot
    state.dragDelta = Math.min(max, Math.max(min, pointerY - startY + scrolled))
    state.overIndex = state.dragIndex + Math.round(state.dragDelta / slot)
}

// Scrolls the list while the pointer sits near its top or bottom edge.
function tick() {
    const box = scroller.value
    if (box && state.dragIndex !== -1) {
        const rect = box.getBoundingClientRect()
        const edge = 48
        if (pointerY < rect.top + edge) box.scrollTop -= Math.ceil((rect.top + edge - pointerY) / 4)
        else if (pointerY > rect.bottom - edge) box.scrollTop += Math.ceil((pointerY - (rect.bottom - edge)) / 4)
        followPointer()
        frame = requestAnimationFrame(tick)
    }
}

function rowStyle(index: number) {
    if (state.dragIndex === -1) return undefined
    if (index === state.dragIndex) return { transform: `translateY(${state.dragDelta}px)` }
    const { dragIndex, overIndex } = state
    if (index > dragIndex && index <= overIndex) return { transform: `translateY(${-slot}px)` }
    if (index < dragIndex && index >= overIndex) return { transform: `translateY(${slot}px)` }
    return undefined
}

function removeListeners() {
    cancelAnimationFrame(frame)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endDrag)
    window.removeEventListener('pointercancel', cancelDrag)
}

// Slides the grabbed row into its slot, then reorders the list for real.
function endDrag() {
    if (state.dragIndex === -1) return
    removeListeners()
    const from = state.dragIndex
    const to = state.overIndex
    state.settling = true
    state.dragDelta = (to - from) * slot
    settleTimer = setTimeout(() => {
        // Reordering moves every shifted row back to zero, so switch the
        // transitions off for that one frame or they'd visibly slide again.
        state.animate = false
        if (to !== from) {
            const [item] = state.list.splice(from, 1)
            state.list.splice(to, 0, item)
        }
        state.settling = false
        state.dragIndex = state.overIndex = -1
        state.dragDelta = 0
        nextTick(() => requestAnimationFrame(() => { state.animate = true }))
    }, 150)
}

function cancelDrag() {
    removeListeners()
    clearTimeout(settleTimer)
    state.settling = false
    state.dragIndex = state.overIndex = -1
    state.dragDelta = 0
    state.animate = true
}

onBeforeUnmount(cancelDrag)

async function save() {
    if (!isDirty.value || state.isSaving) return
    state.error = {}
    state.isSaving = true
    try {
        await inventoryItemService.reorderInventoryItems(state.list.map(item => item.uuid))
        successAlert('Success', 'Inventory order saved.')
        emit('saved')
        emit('close')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
