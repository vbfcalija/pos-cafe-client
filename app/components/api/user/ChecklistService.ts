import BaseAPIService from '@/components/api/BaseAPIService'

class ChecklistService extends BaseAPIService {
    async getChecklists(params: object): Promise<any> {
        return await this.request(`/user/checklists`, 'GET', params)
    }

    async getChecklist(checklistUuid: any): Promise<any> {
        return await this.request(`/user/checklists/${checklistUuid}`, 'GET')
    }

    // Creates the branch's checklist for the day, or returns it if it already exists.
    async generateChecklist(params: { branch_uuid: string, date?: string }): Promise<any> {
        return await this.request(`/user/checklists`, 'POST', params)
    }

    async updateChecklist(checklistUuid: any, params: object): Promise<any> {
        return await this.request(`/user/checklists/${checklistUuid}`, 'PATCH', params)
    }

    async updateTask(checklistUuid: any, taskCompletionUuid: any, params: object): Promise<any> {
        return await this.request(`/user/checklists/${checklistUuid}/tasks/${taskCompletionUuid}`, 'PATCH', params)
    }

    async addUser(checklistUuid: any, params: { user_uuid: string, type: string }): Promise<any> {
        return await this.request(`/user/checklists/${checklistUuid}/users`, 'POST', params)
    }

    // Sets all openers (or closers) at once; an empty list clears that side.
    async syncUsers(checklistUuid: any, params: { type: string, user_uuids: string[] }): Promise<any> {
        return await this.request(`/user/checklists/${checklistUuid}/users`, 'PUT', params)
    }

    async removeUser(checklistUuid: any, checklistUserUuid: any): Promise<any> {
        return await this.request(`/user/checklists/${checklistUuid}/users/${checklistUserUuid}`, 'DELETE')
    }
}
export const checklistService = new ChecklistService()
