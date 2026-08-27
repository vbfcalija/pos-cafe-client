<template>
    <div>

        <Head>
            <Title>Edit discount - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>
        <NuxtLayout name="user">
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>
                Edit discount
            </template>

            <div>
                <NuxtLink
                    class="text-gray-700 hover:text-gray-900 flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/discounts">
                    <Icon name="ph:arrow-left" size="20" />
                    <span>Back</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesDiscountForm formType="update" :selectedDiscount="state.formDiscount" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateDiscount" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { discountService } from '@/components/api/user/DiscountService'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const router = useRouter()
const discountUuid = router?.currentRoute?.value?.params?.discount_uuid as string
const breadcrumbLinks = [
    {
        name: 'Discounts',
        href: '/discounts',
    },
    {
        name: 'Edit discount',
        href: `/discounts/${discountUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formDiscount: {
        name: '',
        type: 'percentage',
        value: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchDiscount()
})

async function fetchDiscount() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await discountService.getDiscount(discountUuid)
        if (response) {
            state.formDiscount = {
                name: response?.data?.name ?? '',
                type: response?.data?.type ?? 'percentage',
                value: response?.data?.value?.toString() ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}

async function updateDiscount(discountDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: discountDetails.name,
            type: discountDetails.type,
            value: discountDetails.value,
        }
        const response = await discountService.updateDiscount(discountUuid, params)
        if (response.data) {
            successAlert('Success', 'Discount successfully updated.')
            navigateTo('/discounts')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>
