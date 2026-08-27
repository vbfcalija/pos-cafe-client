import BaseAPIService from '@/components/api/BaseAPIService'

class ShiftService extends BaseAPIService {
    async getShifts(params: object): Promise<any> {
        return await this.request(`/user/shifts`, 'GET', params)
    }
    async getShift(shiftUuid: any): Promise<any> {
        return await this.request(`/user/shifts/${shiftUuid}`, 'GET')
    }
    async saveShift(params: object): Promise<any> {
        return await this.request(`/user/shifts`, 'POST', params)
    }
    async updateShift(shiftUuid: any, params: object): Promise<any> {
        return await this.request(`/user/shifts/${shiftUuid}`, 'PUT', params)
    }
    async deleteShift(shiftUuid: any): Promise<any> {
        return await this.request(`/user/shifts/${shiftUuid}`, 'DELETE')
    }
}
export const shiftService = new ShiftService()
