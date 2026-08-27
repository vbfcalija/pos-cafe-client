import BaseAPIService from '@/components/api/BaseAPIService'

class TaxRateService extends BaseAPIService {
    async getTaxRates(params: object): Promise<any> {
        return await this.request(`/user/tax-rates`, 'GET', params)
    }
    async getTaxRate(taxRateUuid: any): Promise<any> {
        return await this.request(`/user/tax-rates/${taxRateUuid}`, 'GET')
    }
    async saveTaxRate(params: object): Promise<any> {
        return await this.request(`/user/tax-rates`, 'POST', params)
    }
    async updateTaxRate(taxRateUuid: any, params: object): Promise<any> {
        return await this.request(`/user/tax-rates/${taxRateUuid}`, 'PUT', params)
    }
    async deleteTaxRate(taxRateUuid: any): Promise<any> {
        return await this.request(`/user/tax-rates/${taxRateUuid}`, 'DELETE')
    }
}
export const taxRateService = new TaxRateService()
