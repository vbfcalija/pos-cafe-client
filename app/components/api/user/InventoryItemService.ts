import BaseAPIService from '@/components/api/BaseAPIService'

class InventoryItemService extends BaseAPIService {
    async getInventoryItems(params: object): Promise<any> {
        return await this.request(`/user/inventory-items`, 'GET', params)
    }

    async getInventoryItem(inventoryItemUuid: any): Promise<any> {
        return await this.request(`/user/inventory-items/${inventoryItemUuid}`, 'GET')
    }

    async saveInventoryItem(params: object): Promise<any> {
        return await this.request(`/user/inventory-items`, 'POST', params)
    }

    async updateInventoryItem(inventoryItemUuid: any, params: object): Promise<any> {
        return await this.request(`/user/inventory-items/${inventoryItemUuid}`, 'PUT', params)
    }

    async deleteInventoryItem(inventoryItemUuid: any): Promise<any> {
        return await this.request(`/user/inventory-items/${inventoryItemUuid}`, 'DELETE')
    }
}
export const inventoryItemService = new InventoryItemService()
