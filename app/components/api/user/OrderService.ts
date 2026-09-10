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

    async refundOrder(orderUuid: string): Promise<any> {
        return await this.request(`/user/orders/${orderUuid}/refund`, 'POST')
    }

    async updatePayment(orderUuid: string, paymentUuid: string, params: object): Promise<any> {
        return await this.request(`/user/orders/${orderUuid}/payments/${paymentUuid}`, 'PATCH', params)
    }
}

export const orderService = new OrderService()
