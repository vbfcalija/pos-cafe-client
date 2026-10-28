<template>
    <div>

        <Head>
            <Title>Daily inventory - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>Daily inventory</template>
            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-5">
                    <NuxtLink class="flex max-w-fit items-center gap-x-2 text-gray-700 hover:text-gray-900"
                        to="/daily-inventories">
                        <Icon name="ph:arrow-left" size="20" /><span>Back</span>
                    </NuxtLink>

                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <template v-if="sheet">
                        <!-- Sheet header -->
                        <section class="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm md:p-5">
                            <div class="flex flex-wrap items-start justify-between gap-4">
                                <div class="min-w-0">
                                    <p class="text-xs font-semibold uppercase tracking-wider text-primary-700">Daily
                                        inventory</p>
                                    <h2 class="mt-1 text-xl font-bold text-gray-900">
                                        {{ formatLongDate(sheet.date) }}
                                        <span v-if="isToday"
                                            class="ml-1 align-middle rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700 ring-1 ring-primary-200">
                                            Today
                                        </span>
                                    </h2>
                                    <p class="mt-0.5 flex items-center gap-1.5 text-sm text-gray-600">
                                        <Icon name="ph:storefront" class="size-4" /> {{ sheet.branch?.name }}
                                    </p>
                                </div>
                                <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                                    <span :class="isVerified
                                        ? 'bg-green-50 text-green-800 ring-green-600/20'
                                        : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'"
                                        class="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset">
                                        <Icon :name="isVerified ? 'ph:seal-check' : 'ph:hourglass-medium'"
                                            class="size-4" />
                                        {{ isVerified ? 'Verified' : 'Pending' }}
                                    </span>
                                    <FormButton v-if="!isVerified" buttonStyle="success" class="flex-1 sm:flex-none"
                                        @click="state.modal.isVerifyOpen = true">
                                        <Icon name="ph:seal-check" class="size-4" /> Verify inventory
                                    </FormButton>
                                    <FormButton v-else buttonStyle="secondary" class="flex-1 sm:flex-none"
                                        @click="state.modal.isReopenOpen = true">
                                        <Icon name="ph:lock-open" class="size-4" /> Reopen
                                    </FormButton>
                                </div>
                            </div>

                            <div
                                class="mt-5 grid gap-5 border-t border-gray-100 pt-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
                                <div class="sheet-people min-w-0">
                                    <p class="mb-1.5 text-sm text-gray-600">Counted by</p>
                                    <Multiselect v-if="!isVerified" mode="tags" :options="peopleOptions"
                                        :searchable="true" :close-on-select="false" :canClear="false"
                                        placeholder="Select who counted" no-options-text="No users found"
                                        noResultsText="No result found" :modelValue="state.selectedUserUuids"
                                        @update:modelValue="changePeople" />
                                    <p v-else class="text-sm font-medium text-gray-900">
                                        {{ counterNames || 'No one was added' }}
                                    </p>
                                </div>
                                <div>
                                    <div class="flex items-center justify-between text-sm">
                                        <span class="font-medium text-gray-700">Counted</span>
                                        <span class="text-gray-600 tabular-nums">
                                            {{ progress.counted }} of {{ progress.total }} items
                                        </span>
                                    </div>
                                    <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
                                        <div class="h-full rounded-full bg-green-600 transition-all duration-300"
                                            :style="{ width: `${progress.percent}%` }" />
                                    </div>
                                </div>
                            </div>

                            <p v-if="isVerified"
                                class="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                                <Icon name="ph:lock-simple" class="size-4" />
                                This inventory is verified and locked. Reopen it to make changes.
                            </p>
                        </section>

                        <!-- The sheet -->
                        <section class="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
                            <div class="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-4 md:px-5">
                                <div class="relative min-w-0 flex-1 basis-60">
                                    <Icon name="ph:magnifying-glass"
                                        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                                    <input id="item-search" v-model="state.search" type="search"
                                        placeholder="Find an item"
                                        class="h-11 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-base focus:border-primary-700 focus:outline-none focus:ring-primary-700 sm:h-10 sm:text-sm" />
                                </div>
                                <button type="button"
                                    class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors sm:h-10 sm:w-auto"
                                    :class="state.notCountedOnly
                                        ? 'border-primary-700 bg-primary-50 text-primary-800'
                                        : 'border-gray-200 text-gray-700 hover:border-primary-300'"
                                    :aria-pressed="state.notCountedOnly"
                                    @click="state.notCountedOnly = !state.notCountedOnly">
                                    <Icon name="ph:funnel-simple" class="size-4" />
                                    Not counted yet ({{ progress.total - progress.counted }})
                                </button>
                            </div>

                            <!-- Phones: one card per item -->
                            <div class="md:hidden">
                                <ul class="divide-y divide-gray-100">
                                    <li v-for="(count, index) in visibleItemLines" :key="count.uuid"
                                        class="relative px-4 py-3"
                                        :class="count.ending !== null ? 'bg-green-50/50' : index % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'">
                                        <span class="absolute inset-y-0 left-0 w-1"
                                            :class="count.ending !== null ? 'bg-green-600' : 'bg-transparent'" />
                                        <div class="flex items-start justify-between gap-3">
                                            <div class="min-w-0">
                                                <p class="font-medium text-gray-900">{{ count.item_name }}</p>
                                                <p class="text-xs text-gray-500">{{ count.unit }}</p>
                                            </div>
                                            <SaveState :state="state.rowState[count.uuid]" class="mt-0.5 shrink-0" />
                                        </div>
                                        <div class="mt-2 grid grid-cols-2 gap-2">
                                            <label class="block min-w-0">
                                                <span
                                                    class="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Begin</span>
                                                <input v-if="!isVerified" v-model="draft(count).begin" type="number"
                                                    inputmode="decimal" min="0" step="any" :id="`m-begin-${count.uuid}`"
                                                    class="sheet-input mt-1" @change="saveField(count, 'begin')" />
                                                <span v-else class="mt-1 block tabular-nums">{{
                                                    formatNumber(count.begin) }}</span>
                                            </label>
                                            <label class="block min-w-0">
                                                <span
                                                    class="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Ending</span>
                                                <input v-if="!isVerified" v-model="draft(count).ending" type="number"
                                                    inputmode="decimal" min="0" step="any"
                                                    :id="`m-ending-${count.uuid}`"
                                                    class="sheet-input mt-1 font-semibold"
                                                    @change="saveField(count, 'ending')" />
                                                <span v-else class="mt-1 block font-semibold tabular-nums">{{
                                                    formatNumber(count.ending) }}</span>
                                            </label>
                                        </div>
                                        <input v-if="!isVerified" v-model="draft(count).remarks" type="text"
                                            maxlength="1000" :id="`m-remarks-${count.uuid}`"
                                            placeholder="Remarks (optional)"
                                            :aria-label="`Remarks for ${count.item_name}`"
                                            class="sheet-input mt-2 text-left" @change="saveField(count, 'remarks')" />
                                        <p v-else-if="count.remarks" class="mt-2 text-sm text-gray-700">
                                            {{ count.remarks }}
                                        </p>
                                    </li>
                                    <li v-if="visibleItemLines.length === 0"
                                        class="px-4 py-8 text-center text-gray-500">
                                        {{
                                            state.notCountedOnly ?
                                                'Every item matching this search is counted.' :
                                                'No item matches this search.'
                                        }}
                                    </li>
                                </ul>

                                <p
                                    class="bg-primary-50/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-primary-800">
                                    Other items
                                </p>
                                <ul class="divide-y divide-gray-100">
                                    <li v-for="count in otherLines" :key="count.uuid" class="relative px-4 py-3"
                                        :class="count.ending !== null ? 'bg-green-50/50' : 'bg-white'">
                                        <span class="absolute inset-y-0 left-0 w-1"
                                            :class="count.ending !== null ? 'bg-green-600' : 'bg-transparent'" />
                                        <div v-if="!isVerified" class="flex items-start gap-2">
                                            <div class="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_6rem] gap-2">
                                                <input v-model="draft(count).item_name" type="text" maxlength="255"
                                                    :id="`m-name-${count.uuid}`" aria-label="Item name"
                                                    class="sheet-input text-left font-medium"
                                                    @change="saveField(count, 'item_name')" />
                                                <input v-model="draft(count).unit" type="text" maxlength="50"
                                                    :id="`m-unit-${count.uuid}`" aria-label="Unit"
                                                    class="sheet-input text-left" @change="saveField(count, 'unit')" />
                                            </div>
                                            <button type="button"
                                                class="flex size-11 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                :aria-label="`Remove ${count.item_name}`" @click="askRemove(count)">
                                                <Icon name="ph:trash" class="size-5" />
                                            </button>
                                        </div>
                                        <div v-else>
                                            <p class="font-medium text-gray-900">{{ count.item_name }}</p>
                                            <p class="text-xs text-gray-500">{{ count.unit }}</p>
                                        </div>
                                        <div class="mt-2 grid grid-cols-2 gap-2">
                                            <label class="block min-w-0">
                                                <span
                                                    class="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Begin</span>
                                                <input v-if="!isVerified" v-model="draft(count).begin" type="number"
                                                    inputmode="decimal" min="0" step="any" :id="`m-begin-${count.uuid}`"
                                                    class="sheet-input mt-1" @change="saveField(count, 'begin')" />
                                                <span v-else class="mt-1 block tabular-nums">
                                                    {{ formatNumber(count.begin) }}
                                                </span>
                                            </label>
                                            <label class="block min-w-0">
                                                <span
                                                    class="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Ending</span>
                                                <input v-if="!isVerified" v-model="draft(count).ending" type="number"
                                                    inputmode="decimal" min="0" step="any"
                                                    :id="`m-ending-${count.uuid}`"
                                                    class="sheet-input mt-1 font-semibold"
                                                    @change="saveField(count, 'ending')" />
                                                <span v-else class="mt-1 block font-semibold tabular-nums">
                                                    {{ formatNumber(count.ending) }}
                                                </span>
                                            </label>
                                        </div>
                                        <div class="mt-2 flex items-center gap-2">
                                            <input v-if="!isVerified" v-model="draft(count).remarks" type="text"
                                                maxlength="1000" :id="`m-remarks-${count.uuid}`"
                                                placeholder="Remarks (optional)"
                                                :aria-label="`Remarks for ${count.item_name}`"
                                                class="sheet-input text-left" @change="saveField(count, 'remarks')" />
                                            <p v-else-if="count.remarks" class="text-sm text-gray-700">
                                                {{ count.remarks }}
                                            </p>
                                            <SaveState :state="state.rowState[count.uuid]" class="shrink-0" />
                                        </div>
                                    </li>
                                    <li v-if="isVerified && otherLines.length === 0" class="px-4 py-3 text-gray-500">
                                        None
                                    </li>
                                </ul>
                                <div v-if="!isVerified" class="grid gap-2 border-t border-gray-100 px-4 py-4">
                                    <div class="grid grid-cols-[minmax(0,1fr)_6rem] gap-2">
                                        <input id="m-new-other-name" v-model="state.newOther.item_name" type="text"
                                            maxlength="255" placeholder="Item not on the list"
                                            aria-label="New item name" class="sheet-input text-left"
                                            @keydown.enter.prevent="addOther" />
                                        <input id="m-new-other-unit" v-model="state.newOther.unit" type="text"
                                            maxlength="50" placeholder="Unit" aria-label="New item unit"
                                            class="sheet-input text-left" @keydown.enter.prevent="addOther" />
                                    </div>
                                    <FormButton buttonStyle="action" class="h-11 w-full"
                                        :disabled="!state.newOther.item_name.trim() || !state.newOther.unit.trim()"
                                        @click="addOther">
                                        <Icon name="ph:plus" class="size-4" /> Add other item
                                    </FormButton>
                                </div>
                            </div>

                            <!-- Tablets and desktops: the sheet as a table -->
                            <div class="hidden overflow-x-auto md:block">
                                <table class="w-full min-w-[46rem] text-sm">
                                    <thead
                                        class="bg-primary-900 text-left text-[11px] uppercase tracking-wider text-white">
                                        <tr>
                                            <th class="px-5 py-3 font-semibold">Item</th>
                                            <th class="px-3 py-3 font-semibold">Unit</th>
                                            <th class="w-32 px-3 py-3 font-semibold">Begin</th>
                                            <th class="w-32 px-3 py-3 font-semibold">Ending</th>
                                            <th class="px-3 py-3 font-semibold">Remarks</th>
                                            <th class="w-12 px-3 py-3"><span class="sr-only">Saved</span></th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100">
                                        <tr v-for="(count, index) in visibleItemLines" :key="count.uuid"
                                            class="transition-colors"
                                            :class="count.ending !== null ? 'bg-green-50/50' : index % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'">
                                            <td class="relative px-5 py-2 font-medium text-gray-900">
                                                <span class="absolute inset-y-0 left-0 w-1"
                                                    :class="count.ending !== null ? 'bg-green-600' : 'bg-transparent'" />
                                                {{ count.item_name }}
                                            </td>
                                            <td class="whitespace-nowrap px-3 py-2 text-gray-600">{{ count.unit }}</td>
                                            <td class="px-3 py-2">
                                                <input v-if="!isVerified" v-model="draft(count).begin" type="number"
                                                    inputmode="decimal" min="0" step="any" :id="`begin-${count.uuid}`"
                                                    :aria-label="`Begin for ${count.item_name}`" class="sheet-input"
                                                    @change="saveField(count, 'begin')" />
                                                <span v-else class="tabular-nums">
                                                    {{ formatNumber(count.begin) }}
                                                </span>
                                            </td>
                                            <td class="px-3 py-2">
                                                <input v-if="!isVerified" v-model="draft(count).ending" type="number"
                                                    inputmode="decimal" min="0" step="any" :id="`ending-${count.uuid}`"
                                                    :aria-label="`Ending for ${count.item_name}`"
                                                    class="sheet-input font-semibold"
                                                    @change="saveField(count, 'ending')" />
                                                <span v-else class="font-semibold tabular-nums">
                                                    {{ formatNumber(count.ending) }}
                                                </span>
                                            </td>
                                            <td class="px-3 py-2">
                                                <input v-if="!isVerified" v-model="draft(count).remarks" type="text"
                                                    maxlength="1000" :id="`remarks-${count.uuid}`"
                                                    :aria-label="`Remarks for ${count.item_name}`"
                                                    class="sheet-input w-full min-w-[10rem] text-left"
                                                    @change="saveField(count, 'remarks')" />
                                                <span v-else class="text-gray-700">
                                                    {{ count.remarks || '' }}
                                                </span>
                                            </td>
                                            <td class="px-3 py-2 text-center">
                                                <SaveState :state="state.rowState[count.uuid]" />
                                            </td>
                                        </tr>
                                        <tr v-if="visibleItemLines.length === 0">
                                            <td colspan="6" class="px-5 py-8 text-center text-gray-500">
                                                {{
                                                    state.notCountedOnly ?
                                                        'Every item matching this search is counted.' :
                                                        'No item matches this search.'
                                                }}
                                            </td>
                                        </tr>

                                        <!-- Other -->
                                        <tr class="bg-primary-50/60">
                                            <td colspan="6"
                                                class="px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-primary-800">
                                                Other items
                                            </td>
                                        </tr>
                                        <tr v-for="count in otherLines" :key="count.uuid"
                                            :class="count.ending !== null ? 'bg-green-50/50' : 'bg-white'">
                                            <td class="relative px-5 py-2">
                                                <span class="absolute inset-y-0 left-0 w-1"
                                                    :class="count.ending !== null ? 'bg-green-600' : 'bg-transparent'" />
                                                <input v-if="!isVerified" v-model="draft(count).item_name" type="text"
                                                    maxlength="255" :id="`name-${count.uuid}`" aria-label="Item name"
                                                    class="sheet-input w-full text-left font-medium"
                                                    @change="saveField(count, 'item_name')" />
                                                <span v-else class="font-medium text-gray-900">
                                                    {{ count.item_name }}
                                                </span>
                                            </td>
                                            <td class="px-3 py-2">
                                                <input v-if="!isVerified" v-model="draft(count).unit" type="text"
                                                    maxlength="50" :id="`unit-${count.uuid}`" aria-label="Unit"
                                                    class="sheet-input w-24 text-left"
                                                    @change="saveField(count, 'unit')" />
                                                <span v-else class="text-gray-600">
                                                    {{ count.unit }}
                                                </span>
                                            </td>
                                            <td class="px-3 py-2">
                                                <input v-if="!isVerified" v-model="draft(count).begin" type="number"
                                                    inputmode="decimal" min="0" step="any" :id="`begin-${count.uuid}`"
                                                    :aria-label="`Begin for ${count.item_name}`" class="sheet-input"
                                                    @change="saveField(count, 'begin')" />
                                                <span v-else class="tabular-nums">
                                                    {{ formatNumber(count.begin) }}
                                                </span>
                                            </td>
                                            <td class="px-3 py-2">
                                                <input v-if="!isVerified" v-model="draft(count).ending" type="number"
                                                    inputmode="decimal" min="0" step="any" :id="`ending-${count.uuid}`"
                                                    :aria-label="`Ending for ${count.item_name}`"
                                                    class="sheet-input font-semibold"
                                                    @change="saveField(count, 'ending')" />
                                                <span v-else class="font-semibold tabular-nums">
                                                    {{ formatNumber(count.ending) }}
                                                </span>
                                            </td>
                                            <td class="px-3 py-2">
                                                <input v-if="!isVerified" v-model="draft(count).remarks" type="text"
                                                    maxlength="1000" :id="`remarks-${count.uuid}`"
                                                    :aria-label="`Remarks for ${count.item_name}`"
                                                    class="sheet-input w-full min-w-[10rem] text-left"
                                                    @change="saveField(count, 'remarks')" />
                                                <span v-else class="text-gray-700">
                                                    {{ count.remarks || '' }}
                                                </span>
                                            </td>
                                            <td class="px-3 py-2 text-center">
                                                <button v-if="!isVerified" type="button"
                                                    class="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                    :aria-label="`Remove ${count.item_name}`" @click="askRemove(count)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                        <tr v-if="!isVerified">
                                            <td class="px-5 py-3">
                                                <input id="new-other-name" v-model="state.newOther.item_name"
                                                    type="text" maxlength="255" placeholder="Item not on the list"
                                                    class="sheet-input w-full text-left"
                                                    @keydown.enter.prevent="addOther" />
                                            </td>
                                            <td class="px-3 py-3">
                                                <input id="new-other-unit" v-model="state.newOther.unit" type="text"
                                                    maxlength="50" placeholder="Unit" class="sheet-input w-24 text-left"
                                                    @keydown.enter.prevent="addOther" />
                                            </td>
                                            <td colspan="4" class="px-3 py-3">
                                                <FormButton buttonStyle="action"
                                                    :disabled="!state.newOther.item_name.trim() || !state.newOther.unit.trim()"
                                                    @click="addOther">
                                                    <Icon name="ph:plus" class="size-4" /> Add other item
                                                </FormButton>
                                            </td>
                                        </tr>
                                        <tr v-else-if="otherLines.length === 0">
                                            <td colspan="6" class="px-5 py-3 text-gray-500">None</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </template>
                </div>
            </LoadingSpinner>

            <DialogConfirmation :isModalOpen="state.modal.isVerifyOpen" title="Verify inventory"
                :message="verifyMessage" @close="state.modal.isVerifyOpen = false" @confirm="setStatus('verified')" />
            <DialogConfirmation :isModalOpen="state.modal.isReopenOpen" title="Reopen inventory"
                message="Reopen this inventory so counts and who counted can be changed again?"
                @close="state.modal.isReopenOpen = false" @confirm="setStatus('pending')" />
            <DialogConfirmation :isModalOpen="Boolean(state.removing)" title="Remove item"
                :message="`Remove “${state.removing?.item_name}” from this sheet?`" @close="state.removing = null"
                @confirm="removeOther" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { dailyInventoryService } from '@/components/api/user/DailyInventoryService'
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

// Small saving / saved / failed marker for a row.
const SaveState = defineComponent({
    props: { state: { type: String, required: false } },
    setup(props) {
        return () => {
            if (props.state === 'saving') return h(resolveComponent('Icon'), { name: 'ph:circle-notch', class: 'size-4 animate-spin text-gray-400', 'aria-label': 'Saving' })
            if (props.state === 'saved') return h(resolveComponent('Icon'), { name: 'ph:check-circle', class: 'size-4 text-green-600', 'aria-label': 'Saved' })
            if (props.state === 'error') return h(resolveComponent('Icon'), { name: 'ph:warning-circle', class: 'size-4 text-red-600', 'aria-label': 'Not saved' })
            return null
        }
    },
})

type Field = 'begin' | 'ending' | 'remarks' | 'item_name' | 'unit'
const NUMBER_FIELDS: Field[] = ['begin', 'ending']

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { successAlert, errorAlert } = useAlert()
const sheetUuid = route.params.daily_inventory_uuid as string
const breadcrumbLinks = [
    { name: 'Daily inventory', href: '/daily-inventories' },
    { name: 'Sheet', href: `/daily-inventories/${sheetUuid}` },
]

const state = reactive({
    sheet: null as any,
    drafts: {} as Record<string, Record<Field, string>>,
    rowState: {} as Record<string, string>,
    userOptions: [] as any[],
    selectedUserUuids: [] as string[],
    search: '',
    notCountedOnly: false,
    newOther: { item_name: '', unit: '' },
    removing: null as any,
    error: {} as Error,
    isPageLoading: false,
    modal: { isVerifyOpen: false, isReopenOpen: false },
})

const sheet = computed(() => state.sheet)
const isVerified = computed(() => state.sheet?.status === 'verified')
const isToday = computed(() => state.sheet?.date === moment().format('YYYY-MM-DD'))
const counts = computed(() => state.sheet?.counts ?? [])
const otherLines = computed(() => counts.value.filter((count: any) => count.is_other))
const visibleItemLines = computed(() => {
    const search = state.search.trim().toLowerCase()
    return counts.value.filter((count: any) => !count.is_other
        && (!search || count.item_name.toLowerCase().includes(search))
        && (!state.notCountedOnly || count.ending === null))
})
const progress = computed(() => {
    const total = counts.value.length
    const counted = counts.value.filter((count: any) => count.ending !== null).length
    return { counted, total, percent: total ? Math.round((counted / total) * 100) : 0 }
})
const counterNames = computed(() => (state.sheet?.users ?? [])
    .map((sheetUser: any) => [sheetUser.user?.firstname, sheetUser.user?.lastname].filter(Boolean).join(' '))
    .join(', '))
const peopleOptions = computed(() => {
    const options = [...state.userOptions]
    for (const sheetUser of state.sheet?.users ?? []) {
        if (sheetUser.user && !options.some((option: any) => option.value === sheetUser.user.uuid)) {
            options.push({ label: `${sheetUser.user.firstname} ${sheetUser.user.lastname ?? ''}`.trim(), value: sheetUser.user.uuid })
        }
    }
    return options
})
const verifyMessage = computed(() => {
    const missing = progress.value.total - progress.value.counted
    if (missing > 0) return `${missing} item${missing === 1 ? ' has' : 's have'} no ending count yet. Enter 0 for anything that ran out, then verify.`
    if (!(state.sheet?.users ?? []).length) return 'Add who counted before verifying.'
    return 'Every item is counted. Verify and lock this inventory?'
})

onMounted(() => {
    fetchSheet()
    fetchUsers()
})

async function fetchSheet() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await dailyInventoryService.getDailyInventory(sheetUuid)
        if (response?.data) setSheet(response.data)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchUsers() {
    try {
        const response = await userService.getUsers({ page: 1, page_length: 500, sortField: 'firstname', sortOrder: 'ascend' })
        state.userOptions = (response?.data ?? [])
            .filter((user: any) => user.is_active)
            .map((user: any) => ({ label: `${user.firstname} ${user.lastname ?? ''}`.trim(), value: user.uuid }))
    } catch (error: any) {
        errorAlert('Could not load users', error?.message)
    }
}

// Replaces the whole sheet (first load, verify/reopen, Other lines added or removed).
function setSheet(data: any) {
    state.sheet = data
    state.selectedUserUuids = (data.users ?? []).map((sheetUser: any) => sheetUser.user?.uuid).filter(Boolean)
    for (const count of data.counts ?? []) resetDraft(count)
}

function resetDraft(count: any) {
    state.drafts[count.uuid] = {
        begin: count.begin === null ? '' : String(count.begin),
        ending: count.ending === null ? '' : String(count.ending),
        remarks: count.remarks ?? '',
        item_name: count.item_name ?? '',
        unit: count.unit ?? '',
    }
}

function draft(count: any) {
    if (!state.drafts[count.uuid]) resetDraft(count)
    return state.drafts[count.uuid]
}

/**
 * Saves one field when it loses focus. Only that row is updated from the
 * reply, so typing elsewhere is never overwritten by a slower save.
 */
async function saveField(count: any, field: Field) {
    const raw = String(draft(count)[field] ?? '').trim()
    let value: any = raw

    if (NUMBER_FIELDS.includes(field)) {
        value = raw === '' ? null : Number(raw)
        if (value !== null && (!Number.isFinite(value) || value < 0)) {
            errorAlert('Check the number', `${field === 'begin' ? 'Begin' : 'Ending'} must be 0 or more.`)
            resetDraft(count)
            return
        }
        if (value === count[field]) return
    } else {
        if ((field === 'item_name' || field === 'unit') && raw === '') {
            errorAlert('Required', field === 'unit' ? 'Enter a unit.' : 'Enter the item name.')
            resetDraft(count)
            return
        }
        if (raw === (count[field] ?? '')) return
        value = raw === '' ? null : raw
    }

    state.rowState[count.uuid] = 'saving'
    try {
        const response = await dailyInventoryService.updateCount(sheetUuid, count.uuid, { [field]: value })
        const saved = response?.data?.counts?.find((line: any) => line.uuid === count.uuid)
        if (saved) {
            Object.assign(count, saved)
            state.drafts[count.uuid][field] = field === 'remarks' || field === 'item_name' || field === 'unit'
                ? (saved[field] ?? '')
                : (saved[field] === null ? '' : String(saved[field]))
        }
        state.rowState[count.uuid] = 'saved'
        setTimeout(() => { if (state.rowState[count.uuid] === 'saved') delete state.rowState[count.uuid] }, 1500)
    } catch (error: any) {
        state.rowState[count.uuid] = 'error'
        errorAlert(`Could not save ${count.item_name}`, error?.message)
    }
}

// Each pick saves the full list; only the newest reply is applied.
let latestPeopleSync = 0
async function changePeople(userUuids: string[]) {
    state.selectedUserUuids = userUuids
    const requestId = ++latestPeopleSync
    try {
        const response = await dailyInventoryService.syncUsers(sheetUuid, userUuids)
        if (requestId === latestPeopleSync && response?.data) {
            state.sheet.users = response.data.users
        }
    } catch (error: any) {
        errorAlert('Could not update who counted', error?.message)
        if (requestId === latestPeopleSync) fetchSheet()
    }
}

async function addOther() {
    const item_name = state.newOther.item_name.trim()
    const unit = state.newOther.unit.trim()
    if (!item_name || !unit) return
    try {
        const response = await dailyInventoryService.addOtherCount(sheetUuid, { item_name, unit })
        if (response?.data) {
            mergeLines(response.data)
            state.newOther = { item_name: '', unit: '' }
        }
    } catch (error: any) {
        errorAlert('Could not add the item', error?.message)
    }
}

function askRemove(count: any) {
    state.removing = count
}

async function removeOther() {
    const count = state.removing
    state.removing = null
    if (!count) return
    try {
        const response = await dailyInventoryService.removeOtherCount(sheetUuid, count.uuid)
        if (response?.data) mergeLines(response.data)
    } catch (error: any) {
        errorAlert('Could not remove the item', error?.message)
    }
}

// Takes the new list of lines but keeps anything still being typed on existing rows.
function mergeLines(data: any) {
    const known = new Set(Object.keys(state.drafts))
    state.sheet.counts = data.counts
    for (const count of data.counts) {
        if (!known.has(count.uuid)) resetDraft(count)
    }
}

async function setStatus(status: string) {
    try {
        const response = await dailyInventoryService.updateStatus(sheetUuid, status)
        if (response?.data) setSheet(response.data)
        successAlert('Success', status === 'verified' ? 'Inventory verified.' : 'Inventory reopened.')
    } catch (error: any) {
        errorAlert(status === 'verified' ? 'Could not verify' : 'Could not reopen', error?.message)
    }
}

function formatNumber(value: number | null) {
    return value === null || value === undefined ? '—' : new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 }).format(value)
}

function formatLongDate(value: string) {
    return moment(value, 'YYYY-MM-DD').format('dddd, MMMM D, YYYY')
}
</script>

<style scoped>
.sheet-input {
    height: 2.25rem;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid rgb(229 231 235);
    background: white;
    padding: 0 0.625rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.sheet-input:focus {
    outline: none;
    border-color: rgb(110 68 48);
    box-shadow: 0 0 0 2px rgb(110 68 48 / 0.15);
}

.sheet-input::placeholder {
    color: rgb(156 163 175);
}

@media (max-width: 767px) {
    .sheet-input {
        height: 2.75rem;
        font-size: 16px;
    }
}
</style>

<style>
.sheet-people .multiselect-tags {
    max-height: none;
}

.sheet-people .multiselect-tag {
    background: rgb(110 68 48);
}
</style>
