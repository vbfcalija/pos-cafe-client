<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Mobile sidebar -->
        <TransitionRoot as="template" :show="sidebarOpen">
            <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
                <!-- Overlay -->
                <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0"
                    enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100"
                    leave-to="opacity-0">
                    <div class="fixed inset-0 bg-gray-900/80" aria-hidden="true" />
                </TransitionChild>

                <div class="fixed inset-0 flex">
                    <TransitionChild as="template" enter="transform transition ease-in-out duration-300"
                        enter-from="-translate-x-full" enter-to="translate-x-0"
                        leave="transform transition ease-in-out duration-300" leave-from="translate-x-0"
                        leave-to="-translate-x-full">
                        <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
                            <!-- Close button -->
                            <div class="absolute top-0 left-full flex w-16 justify-center pt-5">
                                <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                                    <span class="sr-only">
                                        Close sidebar
                                    </span>

                                    <Icon name="heroicons:x-mark" class="size-6 text-white" />
                                </button>
                            </div>

                            <!-- Sidebar content -->
                            <div class="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                                <!-- Logo -->
                                <div class="flex h-16 shrink-0 items-center">
                                    <img class="h-8 w-auto"
                                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=blue&shade=600"
                                        alt="Your Company" />
                                </div>

                                <!-- Mobile navigation -->
                                <nav class="flex flex-1 flex-col">
                                    <ul role="list" class="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" class="-mx-2 space-y-1">
                                                <li v-for="item in navigation" :key="item.name">
                                                    <!-- Normal item -->
                                                    <a v-if="!item.children" :href="item.href" :class="[
                                                        item.current
                                                            ? 'bg-primary-50 text-primary-600'
                                                            : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600',
                                                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors',
                                                    ]" @click="sidebarOpen = false">
                                                        <Icon :name="item.icon" :class="[
                                                            item.current
                                                                ? 'text-primary-600'
                                                                : 'text-gray-400 group-hover:text-primary-600',
                                                            'size-6 shrink-0 transition-colors',
                                                        ]" />

                                                        {{ item.name }}
                                                    </a>

                                                    <!-- Item with children -->
                                                    <Disclosure v-else v-slot="{ open }" as="div">
                                                        <DisclosureButton :class="[
                                                            item.current
                                                                ? 'bg-primary-50 text-primary-600'
                                                                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600',
                                                            'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-semibold transition-colors',
                                                        ]">
                                                            <Icon :name="item.icon" :class="[
                                                                item.current
                                                                    ? 'text-primary-600'
                                                                    : 'text-gray-400 group-hover:text-primary-600',
                                                                'size-6 shrink-0 transition-colors',
                                                            ]" />

                                                            {{ item.name }}

                                                            <Icon name="heroicons:chevron-right-20-solid" :class="[
                                                                open
                                                                    ? 'rotate-90 text-primary-600'
                                                                    : 'text-gray-400',
                                                                'ml-auto size-5 shrink-0 transition-all',
                                                            ]" />
                                                        </DisclosureButton>

                                                        <DisclosurePanel as="ul" class="mt-1 space-y-1 px-2">
                                                <li v-for="subItem in item.children" :key="subItem.name">
                                                    <DisclosureButton as="a" :href="subItem.href" :class="[
                                                        subItem.current
                                                            ? 'bg-primary-50 font-semibold text-primary-600'
                                                            : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600',
                                                        'block rounded-md py-2 pr-2 pl-9 text-sm/6 transition-colors',
                                                    ]" @click="sidebarOpen = false">
                                                        {{ subItem.name }}
                                                    </DisclosureButton>
                                                </li>
                                                </DisclosurePanel>
                                                </Disclosure>
                                        </li>
                                    </ul>
                                    </li>

                                    <!-- Mobile profile -->
                                    <li class="-mx-6 mt-auto">
                                        <a href="#"
                                            class="flex items-center gap-x-4 border-t border-gray-100 px-6 py-3 text-sm/6 font-semibold text-gray-900 transition-colors hover:bg-primary-50">
                                            <img class="size-8 rounded-full bg-gray-50 object-cover ring-1 ring-gray-200"
                                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                alt="" />

                                            <span class="sr-only">
                                                Your profile
                                            </span>

                                            <span aria-hidden="true">
                                                Tom Cook
                                            </span>
                                        </a>
                                    </li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </TransitionRoot>

        <!-- Desktop sidebar -->
        <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="-translate-x-full"
            enter-to-class="translate-x-0" leave-active-class="transition-transform duration-300 ease-in"
            leave-from-class="translate-x-0" leave-to-class="-translate-x-full">
            <aside v-if="desktopSidebarOpen"
                class="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-gray-200 bg-white lg:flex lg:flex-col">
                <div class="flex grow flex-col gap-y-5 overflow-y-auto px-6">
                    <div class="flex h-16 shrink-0 items-center justify-between">
                        <img class="h-8 w-auto"
                            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=blue&shade=600"
                            alt="Your Company" />

                        <button type="button"
                            class="rounded-md p-2 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                            @click="desktopSidebarOpen = false">
                            <span class="sr-only">Hide sidebar</span>

                            <Icon name="heroicons:x-mark" class="size-5" />
                        </button>
                    </div>

                    <nav class="flex flex-1 flex-col">
                        <ul role="list" class="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" class="-mx-2 space-y-1">
                                    <li v-for="item in navigation" :key="item.name">
                                        <a v-if="!item.children" :href="item.href" :class="[
                                            item.current
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600',
                                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors',
                                        ]">
                                            <Icon :name="item.icon" :class="[
                                                item.current
                                                    ? 'text-primary-600'
                                                    : 'text-gray-400 group-hover:text-primary-600',
                                                'size-6 shrink-0 transition-colors',
                                            ]" />

                                            {{ item.name }}
                                        </a>

                                        <Disclosure v-else v-slot="{ open }" as="div">
                                            <DisclosureButton :class="[
                                                item.current
                                                    ? 'bg-primary-50 text-primary-600'
                                                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600',
                                                'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-semibold transition-colors',
                                            ]">
                                                <Icon :name="item.icon" :class="[
                                                    item.current
                                                        ? 'text-primary-600'
                                                        : 'text-gray-400 group-hover:text-primary-600',
                                                    'size-6 shrink-0 transition-colors',
                                                ]" />

                                                {{ item.name }}

                                                <Icon name="heroicons:chevron-right-20-solid" :class="[
                                                    open
                                                        ? 'rotate-90 text-primary-600'
                                                        : 'text-gray-400',
                                                    'ml-auto size-5 shrink-0 transition-all',
                                                ]" />
                                            </DisclosureButton>

                                            <DisclosurePanel as="ul" class="mt-1 space-y-1 px-2">
                                    <li v-for="subItem in item.children" :key="subItem.name">
                                        <DisclosureButton as="a" :href="subItem.href" :class="[
                                            subItem.current
                                                ? 'bg-primary-50 font-semibold text-primary-600'
                                                : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600',
                                            'block rounded-md py-2 pr-2 pl-9 text-sm/6 transition-colors',
                                        ]">
                                            {{ subItem.name }}
                                        </DisclosureButton>
                                    </li>
                                    </DisclosurePanel>
                                    </Disclosure>
                            </li>
                        </ul>
                        </li>

                        <li class="-mx-6 mt-auto">
                            <a href="#"
                                class="flex items-center gap-x-4 border-t border-gray-100 px-6 py-3 text-sm/6 font-semibold text-gray-900 transition-colors hover:bg-primary-50">
                                <img class="size-8 rounded-full bg-gray-50 object-cover ring-1 ring-gray-200"
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt="" />

                                <span class="sr-only">Your profile</span>
                                <span aria-hidden="true">Tom Cook</span>
                            </a>
                        </li>
                        </ul>
                    </nav>
                </div>
            </aside>
        </Transition>

        <!-- Main area -->
        <div :class="[
            desktopSidebarOpen ? 'lg:pl-72' : 'lg:pl-0',
            'transition-[padding] duration-300 ease-in-out',
        ]">
            <header
                class="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
                <button type="button"
                    class="-m-2.5 p-2.5 text-gray-600 transition-colors hover:text-primary-600 lg:hidden"
                    @click="sidebarOpen = true">
                    <span class="sr-only">Open sidebar</span>

                    <Icon name="heroicons:bars-3" class="size-6" />
                </button>

                <button type="button"
                    class="hidden rounded-md p-2 text-gray-500 transition-colors hover:bg-primary-50 hover:text-primary-600 lg:inline-flex"
                    @click="desktopSidebarOpen = !desktopSidebarOpen">
                    <span class="sr-only">
                        {{
                            desktopSidebarOpen
                                ? 'Hide sidebar'
                                : 'Show sidebar'
                        }}
                    </span>

                    <Icon :name="desktopSidebarOpen
                            ? 'heroicons:chevron-left'
                            : 'heroicons:bars-3'
                        " class="size-6" />
                </button>

                <div class="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

                <div class="flex flex-1 items-center justify-between">
                    <h1 class="text-lg font-semibold text-gray-900">
                        Dashboard
                    </h1>

                    <div class="flex items-center gap-x-4">
                        <button type="button"
                            class="-m-2.5 rounded-md p-2.5 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600">
                            <span class="sr-only">View notifications</span>

                            <Icon name="heroicons:bell" class="size-6" />
                        </button>

                        <div class="hidden h-6 w-px bg-gray-200 sm:block" aria-hidden="true" />

                        <Menu as="div" class="relative">
                            <MenuButton
                                class="flex items-center gap-x-3 rounded-md p-1 transition-colors hover:bg-gray-50">
                                <img class="size-8 rounded-full bg-gray-50 object-cover ring-1 ring-gray-200"
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                    alt="" />

                                <span class="hidden lg:flex lg:items-center">
                                    <span class="text-sm/6 font-semibold text-gray-900" aria-hidden="true">
                                        Tom Cook
                                    </span>

                                    <Icon name="heroicons:chevron-down-20-solid" class="ml-2 size-5 text-gray-400" />
                                </span>
                            </MenuButton>

                            <transition enter-active-class="transition ease-out duration-100"
                                enter-from-class="scale-95 opacity-0" enter-to-class="scale-100 opacity-100"
                                leave-active-class="transition ease-in duration-75"
                                leave-from-class="scale-100 opacity-100" leave-to-class="scale-95 opacity-0">
                                <MenuItems
                                    class="absolute right-0 z-50 mt-2.5 w-48 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                    <MenuItem v-slot="{ active }">
                                        <a href="#" :class="[
                                            active
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-gray-700',
                                            'block px-3 py-2 text-sm/6 transition-colors',
                                        ]">
                                            Your profile
                                        </a>
                                    </MenuItem>

                                    <MenuItem v-slot="{ active }">
                                        <a href="#" :class="[
                                            active
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-gray-700',
                                            'block px-3 py-2 text-sm/6 transition-colors',
                                        ]">
                                            Settings
                                        </a>
                                    </MenuItem>

                                    <div class="my-1 border-t border-gray-100" />

                                    <MenuItem v-slot="{ active }">
                                        <a href="#" :class="[
                                            active
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-gray-700',
                                            'block px-3 py-2 text-sm/6 transition-colors',
                                        ]">
                                            Sign out
                                        </a>
                                    </MenuItem>
                                </MenuItems>
                            </transition>
                        </Menu>
                    </div>
                </div>
            </header>

            <main class="py-8">
                <div class="px-4 sm:px-6 lg:px-8">
                    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 class="text-xl font-semibold text-gray-900">
                                    Dashboard content
                                </h2>

                                <p class="mt-2 text-gray-600">
                                    Your page content goes here.
                                </p>
                            </div>

                            <button type="button"
                                class="inline-flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600">
                                Primary action
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import {
    Dialog,
    DialogPanel,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    TransitionChild,
    TransitionRoot,
} from '@headlessui/vue'

interface NavigationChild {
    name: string
    href: string
    current?: boolean
}

interface NavigationItem {
    name: string
    href?: string
    icon: string
    current: boolean
    children?: NavigationChild[]
}

const sidebarOpen = ref(false)
const desktopSidebarOpen = ref(false)

const navigation: NavigationItem[] = [
    {
        name: 'Dashboard',
        href: '#',
        icon: 'heroicons:home',
        current: true,
    },
    {
        name: 'Teams',
        icon: 'heroicons:users',
        current: false,
        children: [
            {
                name: 'Engineering',
                href: '#',
                current: false,
            },
            {
                name: 'Human Resources',
                href: '#',
                current: false,
            },
            {
                name: 'Customer Success',
                href: '#',
                current: false,
            },
        ],
    },
    {
        name: 'Projects',
        icon: 'heroicons:folder',
        current: false,
        children: [
            {
                name: 'GraphQL API',
                href: '#',
                current: false,
            },
            {
                name: 'iOS App',
                href: '#',
                current: false,
            },
            {
                name: 'Android App',
                href: '#',
                current: false,
            },
            {
                name: 'New Customer Portal',
                href: '#',
                current: false,
            },
        ],
    },
    {
        name: 'Calendar',
        href: '#',
        icon: 'heroicons:calendar',
        current: false,
    },
    {
        name: 'Documents',
        href: '#',
        icon: 'heroicons:document-duplicate',
        current: false,
    },
    {
        name: 'Reports',
        href: '#',
        icon: 'heroicons:chart-pie',
        current: false,
    },
]
</script>