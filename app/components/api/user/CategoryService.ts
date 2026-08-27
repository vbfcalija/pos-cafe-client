import BaseAPIService from '@/components/api/BaseAPIService'

class CategoryService extends BaseAPIService {
    async getCategories(params: object): Promise<any> {
        return await this.request(`/user/categories`, 'GET', params)
    }
}
export const categoryService = new CategoryService()
