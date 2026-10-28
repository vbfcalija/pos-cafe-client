import BaseAPIService from '@/components/api/BaseAPIService'

class InventorySummaryService extends BaseAPIService {
    // What needs restocking per branch, from the latest counts on or before `date`.
    async getSummary(params: { branch?: string, date?: string }): Promise<any> {
        return await this.request(`/user/inventory-summary`, 'GET', params)
    }
}
export const inventorySummaryService = new InventorySummaryService()
