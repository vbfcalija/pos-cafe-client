import BaseAPIService from '@/components/api/BaseAPIService'

class BranchService extends BaseAPIService {
    async logout(): Promise<any> {
        return await this.request(`/auth/logout`, 'POST')
    }

    async getBranches(params: object): Promise<any> {
        return await this.request(`/user/branches`, 'GET', params)
    }

    async getBranch(branchUuid: any): Promise<any> {
        return await this.request(`/user/branches/${branchUuid}`, 'GET')
    }

    async saveBranch(params: object): Promise<any> {
        return await this.request(`/user/branches`, 'POST', params)
    }

    async updateBranch(branchUuid: any, params: object): Promise<any> {
        return await this.request(`/user/branches/${branchUuid}`, 'PUT', params)
    }

    async deleteBranch(branchUuid: any): Promise<any> {
        return await this.request(`/user/branches/${branchUuid}`, 'DELETE')
    }
}

export const branchService = new BranchService()