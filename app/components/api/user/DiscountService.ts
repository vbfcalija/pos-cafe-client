import BaseAPIService from '@/components/api/BaseAPIService'

class DiscountService extends BaseAPIService {
    async getDiscounts(params: object): Promise<any> {
        return await this.request('/user/discounts', 'GET', params)
    }

    async getDiscount(discountUuid: string): Promise<any> {
        return await this.request(`/user/discounts/${discountUuid}`, 'GET')
    }

    async saveDiscount(params: object): Promise<any> {
        return await this.request('/user/discounts', 'POST', params)
    }

    async updateDiscount(discountUuid: string, params: object): Promise<any> {
        return await this.request(`/user/discounts/${discountUuid}`, 'PUT', params)
    }

    async deleteDiscount(discountUuid: string): Promise<any> {
        return await this.request(`/user/discounts/${discountUuid}`, 'DELETE')
    }
}

export const discountService = new DiscountService()
