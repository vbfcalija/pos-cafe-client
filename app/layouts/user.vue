<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Mobile sidebar -->
        <TransitionRoot as="template" :show="sidebarOpen">
            <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
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
                            <div class="absolute top-0 left-full flex w-16 justify-center pt-5">
                                <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                                    <span class="sr-only">
                                        Close sidebar
                                    </span>

                                    <Icon name="ph:x" class="size-6 text-white" />
                                </button>
                            </div>

                            <div class="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                                <div class="flex h-16 shrink-0 items-center">
                                    <img class="h-8 w-auto"
                                        src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=blue&shade=600"
                                        alt="Your Company" />
                                </div>

                                <nav class="flex flex-1 flex-col">
                                    <ul role="list" class="flex flex-1 flex-col gap-y-7">
                                        <!-- Main navigation -->
                                        <li>
                                            <ul role="list" class="-mx-2 space-y-1">
                                                <li v-for="item in navigation" :key="item.id">
                                                    <a :href="item.href" :class="[
                                                        isActive(item)
                                                            ? 'bg-primary-50 text-primary-600'
                                                            : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600',
                                                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors',
                                                    ]" @click.prevent="
                                                        handleMobileNavigation(
                                                            item.href,
                                                        )
                                                        ">
                                                        <Icon :name="item.icon" :class="[
                                                            isActive(item)
                                                                ? 'text-primary-600'
                                                                : 'text-gray-400 group-hover:text-primary-600',
                                                            'size-6 shrink-0 transition-colors',
                                                        ]" />

                                                        <span class="truncate">
                                                            {{ item.label }}
                                                        </span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>

                                        <!-- Settings -->
                                        <li>
                                            <div class="text-xs/6 font-semibold text-gray-400">
                                                Settings
                                            </div>

                                            <ul role="list" class="-mx-2 mt-2 space-y-1">
                                                <li v-for="item in settings" :key="item.id">
                                                    <a :href="item.href" :class="[
                                                        isActive(item)
                                                            ? 'bg-primary-50 text-primary-600'
                                                            : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600',
                                                        'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors',
                                                    ]" @click.prevent="
                                                        handleMobileNavigation(
                                                            item.href,
                                                        )
                                                        ">
                                                        <Icon :name="item.icon" :class="[
                                                            isActive(item)
                                                                ? 'text-primary-600'
                                                                : 'text-gray-400 group-hover:text-primary-600',
                                                            'size-6 shrink-0 transition-colors',
                                                        ]" />

                                                        <span class="truncate">
                                                            {{ item.label }}
                                                        </span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>

                                        <li class="-mx-6 mt-auto">
                                            <a href="/profile"
                                                class="flex items-center gap-x-4 border-t border-gray-100 px-6 py-3 text-sm/6 font-semibold text-gray-900 transition-colors hover:bg-primary-50"
                                                @click.prevent="
                                                    handleMobileNavigation(
                                                        '/profile',
                                                    )
                                                    ">
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
                            class="flex items-center rounded-md p-2 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                            @click="desktopSidebarOpen = false">
                            <span class="sr-only">
                                Hide sidebar
                            </span>

                            <Icon name="ph:x" class="size-5" />
                        </button>
                    </div>

                    <nav class="flex flex-1 flex-col">
                        <ul role="list" class="flex flex-1 flex-col gap-y-7">
                            <!-- Main navigation -->
                            <li>
                                <ul role="list" class="-mx-2 space-y-1">
                                    <li v-for="item in navigation" :key="item.id">
                                        <a :href="item.href" :class="[
                                            isActive(item)
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600',
                                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors',
                                        ]" @click.prevent="
                                            navigateTo(item.href)
                                            ">
                                            <Icon :name="item.icon" :class="[
                                                isActive(item)
                                                    ? 'text-primary-600'
                                                    : 'text-gray-400 group-hover:text-primary-600',
                                                'size-6 shrink-0 transition-colors',
                                            ]" />

                                            <span class="truncate">
                                                {{ item.label }}
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </li>

                            <!-- Settings -->
                            <li>
                                <div class="text-xs/6 font-semibold text-gray-400">
                                    Settings
                                </div>

                                <ul role="list" class="-mx-2 mt-2 space-y-1">
                                    <li v-for="item in settings" :key="item.id">
                                        <a :href="item.href" :class="[
                                            isActive(item)
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600',
                                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors',
                                        ]" @click.prevent="
                                            navigateTo(item.href)
                                            ">
                                            <Icon :name="item.icon" :class="[
                                                isActive(item)
                                                    ? 'text-primary-600'
                                                    : 'text-gray-400 group-hover:text-primary-600',
                                                'size-6 shrink-0 transition-colors',
                                            ]" />

                                            <span class="truncate">
                                                {{ item.label }}
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </li>

                            <li class="-mx-6 mt-auto">
                                <p class="py-1 text-center text-xs">
                                    {{ runtimeConfig?.public?.appName }}
                                    v{{ runtimeConfig?.public?.appVersion }}
                                </p>
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
                    <span class="sr-only">
                        Open sidebar
                    </span>

                    <Icon name="ph:list" class="size-6" />
                </button>

                <button type="button"
                    class="hidden rounded-md p-2 text-gray-500 transition-colors hover:bg-primary-50 hover:text-primary-600 lg:inline-flex"
                    @click="
                        desktopSidebarOpen = !desktopSidebarOpen
                        ">
                    <span class="sr-only">
                        {{
                            desktopSidebarOpen
                                ? 'Hide sidebar'
                                : 'Show sidebar'
                        }}
                    </span>

                    <Icon :name="desktopSidebarOpen
                        ? 'ph:caret-left'
                        : 'ph:list'
                        " class="size-6" />
                </button>

                <div class="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

                <div class="flex flex-1 items-center justify-between">
                    <h1 class="text-lg font-semibold text-gray-900">
                        <slot name="header" />
                    </h1>

                    <div class="flex items-center gap-x-4">
                        <!-- <button type="button"
                            class="-m-2.5 rounded-md p-2.5 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                            @click="navigateTo('/notifications')">
                            <span class="sr-only">
                                View notifications
                            </span>

                            <Icon name="ph:bell" class="size-6" />
                        </button> -->

                        <!-- <div class="hidden h-6 w-px bg-gray-200 sm:block" aria-hidden="true" /> -->

                        <Menu as="div" class="relative">
                            <MenuButton
                                class="flex items-center gap-x-3 rounded-md p-1 transition-colors hover:bg-gray-50">
                                <img class="size-8 rounded-full bg-gray-50 object-cover ring-1 ring-gray-200"
                                    :src="`https://ui-avatars.com/api/?background=437dfb&color=fff&name=${userStore.getUser.firstname + (userStore.getUser.lastname ?? '')}`"
                                    alt="" />

                                <span class="hidden lg:flex lg:items-center">
                                    <span class="text-sm/6 font-semibold text-gray-900" aria-hidden="true">
                                        {{ userStore.getUser.firstname }} {{ userStore.getUser.lastname }}
                                    </span>

                                    <Icon name="ph:caret-down" class="ml-2 size-5 text-gray-400" />
                                </span>
                            </MenuButton>

                            <transition enter-active-class="transition ease-out duration-100"
                                enter-from-class="scale-95 opacity-0" enter-to-class="scale-100 opacity-100"
                                leave-active-class="transition ease-in duration-75"
                                leave-from-class="scale-100 opacity-100" leave-to-class="scale-95 opacity-0">
                                <MenuItems
                                    class="absolute right-0 z-50 mt-2.5 w-48 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                    <MenuItem v-slot="{ active }">
                                        <button type="button" :class="[
                                            active
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-gray-700',
                                            'block w-full px-3 py-2 text-left text-sm/6 transition-colors',
                                        ]" @click="navigateTo('/profile')">
                                            Your profile
                                        </button>
                                    </MenuItem>

                                    <MenuItem v-slot="{ active }">
                                        <button type="button" :class="[
                                            active
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-gray-700',
                                            'block w-full px-3 py-2 text-left text-sm/6 transition-colors',
                                        ]" @click="navigateTo('/settings')">
                                            Settings
                                        </button>
                                    </MenuItem>

                                    <div class="my-1 border-t border-gray-100" />

                                    <MenuItem v-slot="{ active }">
                                        <button type="button" :class="[
                                            active
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-gray-700',
                                            'block w-full px-3 py-2 text-left text-sm/6 transition-colors',
                                        ]" @click="handleSignOut">
                                            Sign out
                                        </button>
                                    </MenuItem>
                                </MenuItems>
                            </transition>
                        </Menu>
                    </div>
                </div>
            </header>

            <main class="py-8">
                <div class="px-4 sm:px-6 lg:px-8">
                    <div>
                        <slot name="breadcrumb"></slot>
                    </div>
                    <div class="mt-4">
                        <slot />
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    Dialog,
    DialogPanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    TransitionChild,
    TransitionRoot,
} from '@headlessui/vue'
import { useUserStore } from '@/store/user'
import type { SidebarNavigationItem } from '~/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const userStore = useUserStore() as any

const sidebarOpen = ref(false)
const desktopSidebarOpen = ref(false)

const navigation: SidebarNavigationItem[] = [
    {
        id: 'overview',
        label: 'Overview',
        href: '/overview',
        icon: 'ph:house',
        routes: [
            'overview',
        ],
    },
    {
        id: 'pos',
        label: 'POS',
        href: '/pos',
        icon: 'ph:desktop',
        routes: [
            'pos',
        ],
    },
    {
        id: 'orders',
        label: 'Orders',
        href: '/orders',
        icon: 'ph:shopping-cart',
        routes: [
            'orders',
            'orders-id',
            'orders-id-edit',
        ],
    },
    {
        id: 'reports',
        label: 'Reports',
        href: '/reports',
        icon: 'ph:chart-bar',
        routes: [
            'reports',
        ],
    },
]

const settings: SidebarNavigationItem[] = [
    {
        id: 'branches',
        label: 'Branches',
        href: '/branches',
        icon: 'ph:storefront',
        routes: [
            'branches',
            'branches-create',
            'branches-id',
            'branches-id-edit',
        ],
    },
    {
        id: 'customers',
        label: 'Customers',
        href: '/customers',
        icon: 'ph:users-three',
        routes: [
            'customers',
            'customers-create',
            'customers-id',
            'customers-id-edit',
        ],
    },
    {
        id: 'discounts',
        label: 'Discounts',
        href: '/discounts',
        icon: 'ph:tag',
        routes: [
            'discounts',
            'discounts-create',
            'discounts-id',
            'discounts-id-edit',
        ],
    },
    {
        id: 'products',
        label: 'Products',
        href: '/products',
        icon: 'ph:cube',
        routes: [
            'products',
            'products-create',
            'products-id',
            'products-id-edit',
        ],
    },
    {
        id: 'product-categories',
        label: 'Product categories',
        href: '/product-categories',
        icon: 'ph:folder-open',
        routes: [
            'product-categories',
            'product-categories-create',
            'product-categories-id',
            'product-categories-id-edit',
        ],
    },
    {
        id: 'product-variants',
        label: 'Product variants',
        href: '/product-variants',
        icon: 'ph:squares-four',
        routes: [
            'product-variants',
            'product-variants-create',
            'product-variants-id',
            'product-variants-id-edit',
        ],
    },
    {
        id: 'shifts',
        label: 'Shifts',
        href: '/shifts',
        icon: 'ph:clock',
        routes: [
            'shifts',
            'shifts-create',
            'shifts-id',
            'shifts-id-edit',
        ],
    },
    {
        id: 'tax-rates',
        label: 'Tax rates',
        href: '/tax-rates',
        icon: 'ph:receipt',
        routes: [
            'tax-rates',
            'tax-rates-create',
            'tax-rates-id',
            'tax-rates-id-edit',
        ],
    },
    {
        id: 'users',
        label: 'Users',
        href: '/users',
        icon: 'ph:users',
        routes: [
            'users',
            'users-create',
            'users-id',
            'users-id-edit',
        ],
    },
]

function isActive(item: SidebarNavigationItem) {
    return (
        item.routes?.includes(route.name as string) ||
        route.path === item.href ||
        route.path.startsWith(`${item.href}/`)
    )
}

const handleMobileNavigation = async (href: string) => {
    sidebarOpen.value = false

    await navigateTo(href)
}

const handleSignOut = async () => {
    await navigateTo('/')
}
</script>
