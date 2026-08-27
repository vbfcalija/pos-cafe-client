import BaseAPIService from '@/components/api/BaseAPIService'

class ProductService extends BaseAPIService {
    async getProducts(params: object): Promise<any> {
        return await this.request(`/user/products`, 'GET', params)
    }
}

export const productService = new ProductService()
