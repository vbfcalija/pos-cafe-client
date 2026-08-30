import BaseAPIService from '@/components/api/BaseAPIService'

class OrderService extends BaseAPIService {
    async getOrders(params: object): Promise<any> {
        return await this.request('/user/orders', 'GET', params)
    }

    async getOrder(orderUuid: string): Promise<any> {
        return await this.request(`/user/orders/${orderUuid}`, 'GET')
    }

    async saveOrder(params: object): Promise<any> {
        return await this.request('/user/orders', 'POST', params)
    }
}

export const orderService = new OrderService()
