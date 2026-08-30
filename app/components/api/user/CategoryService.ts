import BaseAPIService from '@/components/api/BaseAPIService'

class CategoryService extends BaseAPIService {
    async getCategories(params: object): Promise<any> {
        return await this.request(`/user/categories`, 'GET', params)
    }

    async getCategory(categoryUuid: any): Promise<any> {
        return await this.request(`/user/categories/${categoryUuid}`, 'GET')
    }

    async saveCategory(params: object): Promise<any> {
        return await this.request(`/user/categories`, 'POST', params)
    }

    async updateCategory(categoryUuid: any, params: object): Promise<any> {
        return await this.request(`/user/categories/${categoryUuid}`, 'PUT', params)
    }

    async deleteCategory(categoryUuid: any): Promise<any> {
        return await this.request(`/user/categories/${categoryUuid}`, 'DELETE')
    }
}
export const categoryService = new CategoryService()
