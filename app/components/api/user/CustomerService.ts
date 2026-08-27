import BaseAPIService from '@/components/api/BaseAPIService'

class CustomerService extends BaseAPIService {
    async getCustomers(params: object): Promise<any> {
        return await this.request('/user/customers', 'GET', params)
    }

    async getCustomer(customerUuid: string): Promise<any> {
        return await this.request(`/user/customers/${customerUuid}`, 'GET')
    }

    async saveCustomer(params: object): Promise<any> {
        return await this.request('/user/customers', 'POST', params)
    }

    async updateCustomer(customerUuid: string, params: object): Promise<any> {
        return await this.request(`/user/customers/${customerUuid}`, 'PUT', params)
    }

    async deleteCustomer(customerUuid: string): Promise<any> {
        return await this.request(`/user/customers/${customerUuid}`, 'DELETE')
    }
}

export const customerService = new CustomerService()
