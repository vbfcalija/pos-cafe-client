import BaseAPIService from '@/components/api/BaseAPIService'

class TaxRateService extends BaseAPIService {
    async getTaxRates(params: object): Promise<any> {
        return await this.request(`/user/tax-rates`, 'GET', params)
    }
}
export const taxRateService = new TaxRateService()
