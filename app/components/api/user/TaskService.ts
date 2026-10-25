import BaseAPIService from '@/components/api/BaseAPIService'

class TaskService extends BaseAPIService {
    async getTasks(params: object): Promise<any> {
        return await this.request(`/user/tasks`, 'GET', params)
    }

    async getTask(taskUuid: any): Promise<any> {
        return await this.request(`/user/tasks/${taskUuid}`, 'GET')
    }

    async saveTask(params: object): Promise<any> {
        return await this.request(`/user/tasks`, 'POST', params)
    }

    async updateTask(taskUuid: any, params: object): Promise<any> {
        return await this.request(`/user/tasks/${taskUuid}`, 'PUT', params)
    }

    async deleteTask(taskUuid: any): Promise<any> {
        return await this.request(`/user/tasks/${taskUuid}`, 'DELETE')
    }
}
export const taskService = new TaskService()
