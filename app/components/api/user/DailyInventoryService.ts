import BaseAPIService from '@/components/api/BaseAPIService'

class DailyInventoryService extends BaseAPIService {
    async getDailyInventories(params: object): Promise<any> {
        return await this.request(`/user/daily-inventories`, 'GET', params)
    }

    async getDailyInventory(dailyInventoryUuid: any): Promise<any> {
        return await this.request(`/user/daily-inventories/${dailyInventoryUuid}`, 'GET')
    }

    // Creates the branch's sheet for the day, or returns it if it already exists.
    async generateDailyInventory(params: { branch_uuid: string, date?: string }): Promise<any> {
        return await this.request(`/user/daily-inventories`, 'POST', params)
    }

    // Verify ('verified') or reopen ('pending').
    async updateStatus(dailyInventoryUuid: any, status: string): Promise<any> {
        return await this.request(`/user/daily-inventories/${dailyInventoryUuid}`, 'PATCH', { status })
    }

    async updateCount(dailyInventoryUuid: any, countUuid: any, params: object): Promise<any> {
        return await this.request(`/user/daily-inventories/${dailyInventoryUuid}/counts/${countUuid}`, 'PATCH', params)
    }

    async addOtherCount(dailyInventoryUuid: any, params: { item_name: string, unit: string }): Promise<any> {
        return await this.request(`/user/daily-inventories/${dailyInventoryUuid}/counts`, 'POST', params)
    }

    async removeOtherCount(dailyInventoryUuid: any, countUuid: any): Promise<any> {
        return await this.request(`/user/daily-inventories/${dailyInventoryUuid}/counts/${countUuid}`, 'DELETE')
    }

    // Sets everyone who counted at once; an empty list clears it.
    async syncUsers(dailyInventoryUuid: any, userUuids: string[]): Promise<any> {
        return await this.request(`/user/daily-inventories/${dailyInventoryUuid}/users`, 'PUT', { user_uuids: userUuids })
    }
}
export const dailyInventoryService = new DailyInventoryService()
