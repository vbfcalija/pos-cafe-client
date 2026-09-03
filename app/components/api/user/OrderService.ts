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

    async printReceipt(orderUuid: string): Promise<any> {
        return await this.request(`/user/orders/${orderUuid}/print`, 'POST')
    }
}

export const orderService = new OrderService()
