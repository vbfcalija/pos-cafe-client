import BaseAPIService from '@/components/api/BaseAPIService'

class UserService extends BaseAPIService {
    async logout(): Promise<any> {
        return await this.request(`/auth/logout`, 'POST')
    }

    async getUsers(params: object): Promise<any> {
        return await this.request(`/user/users`, 'GET', params)
    }

    async getUser(userUuid: any): Promise<any> {
        return await this.request(`/user/users/${userUuid}`, 'GET')
    }

    async saveUser(params: object): Promise<any> {
        return await this.request(`/user/users`, 'POST', params)
    }

    async updateUser(userUuid: any, params: object): Promise<any> {
        return await this.request(`/user/users/${userUuid}`, 'PUT', params)
    }
    async deleteUser(userUuid: any): Promise<any> {
        return await this.request(`/user/users/${userUuid}`, 'DELETE')
    }
}

export const userService = new UserService()
