import BaseAPIService from '@/components/api/BaseAPIService'

class ActivityLogService extends BaseAPIService {
    async getActivityLogs(params: object): Promise<any> {
        return await this.request(`/user/activity-logs`, 'GET', params)
    }

    async getActivityLog(activityLogUuid: any): Promise<any> {
        return await this.request(`/user/activity-logs/${activityLogUuid}`, 'GET')
    }
}
export const activityLogService = new ActivityLogService()
