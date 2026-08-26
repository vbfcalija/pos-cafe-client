import BaseAPIService from '@/components/api/BaseAPIService'

class AuthService extends BaseAPIService {
    async login(params: object): Promise<any> {
        return await this.request(`/auth/login`, 'POST', params)
    }

    async getUser(): Promise<any> {
        return await this.request(`/user`, 'GET')
    }
}
export const authService = new AuthService()