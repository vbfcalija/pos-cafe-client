<template>
    <section class="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
        <header class="bg-primary-900 px-5 py-4 text-white">
            <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <Icon :name="isOpener ? 'ph:sun-horizon' : 'ph:moon-stars'" class="size-6" />
                    </span>
                    <div class="min-w-0">
                        <h2 class="truncate text-sm font-bold uppercase tracking-wider">
                            {{ isOpener ? 'Opening checklist' : 'Closing checklist' }}
                        </h2>
                        <p class="text-xs text-primary-200">{{ doneCount }} of {{ props.tasks.length }} done</p>
                    </div>
                </div>
                <span v-if="props.tasks.length > 0 && doneCount === props.tasks.length"
                    class="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold">
                    <Icon name="ph:check-bold" class="size-3.5" /> Complete
                </span>
            </div>
            <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div class="h-full rounded-full bg-green-400 transition-all duration-300"
                    :style="{ width: `${percent}%` }" />
            </div>
        </header>

        <!-- Baristas on this half of the day -->
        <div class="border-b border-primary-100 bg-primary-50/40 px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {{ isOpener ? 'Openers' : 'Closers' }}
            </p>
            <div v-if="!props.locked" class="checklist-people mt-2">
                <Multiselect mode="tags" :options="peopleOptions" :searchable="true" :close-on-select="false"
                    :canClear="false" :placeholder="isOpener ? 'Select openers' : 'Select closers'"
                    no-options-text="No users found" noResultsText="No result found"
                    :modelValue="state.selectedUserUuids" @update:modelValue="changePeople" />
                <p class="mt-1 text-[11px] text-gray-500">
                    Pick everyone on the {{ isOpener ? 'opening' : 'closing' }} shift. You can choose more than one.
                </p>
            </div>
            <div v-else class="mt-2 flex flex-wrap items-center gap-2">
                <span v-for="checklistUser in props.users" :key="checklistUser.uuid"
                    class="inline-flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-sm font-medium text-gray-800 ring-1 ring-primary-200">
                    <span
                        class="flex size-6 items-center justify-center rounded-full bg-primary-700 text-[10px] font-bold text-white">
                        {{ initials(checklistUser.user) }}
                    </span>
                    {{ fullName(checklistUser.user) }}
                </span>
                <span v-if="props.users.length === 0" class="text-sm text-gray-500">
                    No {{ isOpener ? 'opener' : 'closer' }} was added.
                </span>
            </div>
        </div>

        <!-- Tasks -->
        <div
            class="flex items-center justify-between border-b border-gray-100 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            <span>Task</span>
            <span>Done</span>
        </div>
        <ul class="divide-y divide-gray-100">
            <!-- The whole row is the tap target; FormCheckbox shows the state. -->
            <li v-for="(completion, index) in props.tasks" :key="completion.uuid" role="checkbox"
                :aria-checked="completion.is_done" :aria-disabled="props.locked" :tabindex="props.locked ? -1 : 0"
                class="group relative outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400"
                :class="[
                    completion.is_done ? 'bg-green-50/70' : index % 2 === 1 ? 'bg-gray-50/60' : 'bg-white',
                    !props.locked && 'cursor-pointer hover:bg-primary-50/70',
                ]" @click="emit('toggle', completion)" @keydown.space.self.prevent="emit('toggle', completion)"
                @keydown.enter.self.prevent="emit('toggle', completion)">
                <!-- Done marker down the left edge -->
                <span class="absolute inset-y-0 left-0 w-1 transition-colors"
                    :class="completion.is_done ? 'bg-green-600' : 'bg-transparent'" />
                <div class="flex items-start gap-3 px-5 py-3.5">
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium leading-5 transition-colors"
                            :class="completion.is_done ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-900'">
                            {{ completion.task?.name }}
                        </p>
                        <p v-if="completion.task?.description" class="mt-0.5 text-xs text-gray-500">
                            {{ completion.task.description }}
                        </p>

                        <div v-if="state.editingUuid === completion.uuid" class="mt-2 flex flex-wrap items-center gap-2"
                            @click.stop @keydown.stop>
                            <input v-model="state.draft" type="text" maxlength="1000" placeholder="Add a remark"
                                class="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-primary-700 focus:outline-none focus:ring-primary-700"
                                @keydown.enter.prevent="saveRemark(completion)" @keydown.esc="cancelRemark" />
                            <FormButton buttonStyle="primary" buttonSize="xs" @click="saveRemark(completion)">Save
                            </FormButton>
                            <FormButton buttonStyle="cancel" buttonSize="xs" @click="cancelRemark">Cancel</FormButton>
                        </div>
                        <template v-else>
                            <p v-if="completion.remarks"
                                class="mt-1.5 inline-flex max-w-full items-start gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-900 ring-1 ring-inset ring-amber-200/60">
                                <Icon name="ph:note-pencil" class="mt-px size-3.5 shrink-0" />
                                <span class="break-words">{{ completion.remarks }}</span>
                            </p>
                            <div v-if="(completion.is_done && completion.completed_at) || !props.locked"
                                class="mt-1 flex flex-wrap items-center gap-x-3 text-[11px] text-gray-500">
                                <span v-if="completion.is_done && completion.completed_at"
                                    class="inline-flex items-center gap-1 font-medium text-green-700">
                                    <Icon name="ph:check-circle" class="size-3.5" />
                                    Done {{ formatTime(completion.completed_at) }}
                                </span>
                                <button v-if="!props.locked" type="button"
                                    class="inline-flex items-center gap-1 rounded font-medium text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                                    @click.stop="editRemark(completion)" @keydown.stop>
                                    <Icon name="ph:chat-text" class="size-3.5" />
                                    {{ completion.remarks ? 'Edit remark' : 'Add remark' }}
                                </button>
                            </div>
                        </template>
                    </div>
                    <!-- Display only: clicks pass through to the row, so a tap is always exactly one toggle.
                         [&_input]:mr-0 drops FormCheckbox's built-in right margin so the box sits centred. -->
                    <div class="pointer-events-none flex size-8 shrink-0 items-center justify-center [&_input]:mr-0"
                        :class="props.locked && 'opacity-60'" aria-hidden="true">
                        <FormCheckbox :id="`task-${completion.uuid}`" :value="completion.is_done" />
                    </div>
                </div>
            </li>
            <li v-if="props.tasks.length === 0" class="px-5 py-8 text-center text-sm text-gray-500">
                No {{ isOpener ? 'opening' : 'closing' }} tasks yet. Add them under Settings → Checklist tasks.
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import moment from 'moment'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

const props = defineProps({
    type: {
        type: String,
        required: true,
    },
    tasks: {
        type: Array as () => any[],
        required: true,
    },
    users: {
        type: Array as () => any[],
        required: true,
    },
    userOptions: {
        type: Array as () => any[],
        required: true,
    },
    locked: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['toggle', 'saveRemark', 'syncUsers'])

const state = reactive({
    editingUuid: '' as string,
    draft: '' as string,
    selectedUserUuids: [] as string[],
})

// Follow what the server saved (after each change, or a reload).
watch(() => props.users, (users: any[]) => {
    state.selectedUserUuids = users.map((checklistUser: any) => checklistUser.user?.uuid).filter(Boolean)
}, { immediate: true })

const isOpener = computed(() => props.type === 'opener')
const doneCount = computed(() => props.tasks.filter((completion: any) => completion.is_done).length)
const percent = computed(() => props.tasks.length ? Math.round((doneCount.value / props.tasks.length) * 100) : 0)
// Active users, plus anyone already on this checklist who has since been deactivated
// (so their name still shows instead of a blank tag).
const peopleOptions = computed(() => {
    const options = [...props.userOptions]
    for (const checklistUser of props.users) {
        if (checklistUser.user && !options.some((option: any) => option.value === checklistUser.user.uuid)) {
            options.push({ label: fullName(checklistUser.user), value: checklistUser.user.uuid })
        }
    }
    return options
})

function changePeople(userUuids: string[]) {
    state.selectedUserUuids = userUuids
    emit('syncUsers', userUuids)
}

function fullName(user: any) {
    return [user?.firstname, user?.lastname].filter(Boolean).join(' ') || 'Unknown user'
}

function initials(user: any) {
    return `${user?.firstname?.[0] ?? ''}${user?.lastname?.[0] ?? ''}`.toUpperCase() || '?'
}

function formatTime(value: string) {
    return moment(value).format('h:mm A')
}

function editRemark(completion: any) {
    state.editingUuid = completion.uuid
    state.draft = completion.remarks ?? ''
}

function cancelRemark() {
    state.editingUuid = ''
    state.draft = ''
}

function saveRemark(completion: any) {
    emit('saveRemark', completion, state.draft.trim())
    cancelRemark()
}
</script>

<style>
/* Let the name tags wrap onto as many lines as needed. */
.checklist-people .multiselect-tags {
    max-height: none;
}

.checklist-people .multiselect-tag {
    background: rgb(110 68 48);
}
</style>
