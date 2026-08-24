import BaseAPIService from '@/components/api/BaseAPIService'

class AuthService extends BaseAPIService {
    async login(params: object): Promise<any> {
        return await this.request(`/auth/login`, 'POST', params)
    }
}
export const authService = new AuthService()