import BaseAPIService from '@/components/api/BaseAPIService'

class OrderService extends BaseAPIService {
    async saveOrder(params: object): Promise<any> {
        return await this.request('/user/orders', 'POST', params)
    }
}

export const orderService = new OrderService()
