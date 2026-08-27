import BaseAPIService from '@/components/api/BaseAPIService'

class ProductService extends BaseAPIService {
    async getProducts(params: object): Promise<any> {
        return await this.request(`/user/products`, 'GET', params)
    }
    async getProduct(productUuid: any): Promise<any> {
        return await this.request(`/user/products/${productUuid}`, 'GET')
    }
    async saveProduct(params: object): Promise<any> {
        return await this.request(`/user/products`, 'POST', params)
    }
    async updateProduct(productUuid: any, params: object): Promise<any> {
        return await this.request(`/user/products/${productUuid}`, 'PUT', params)
    }
    async deleteProduct(productUuid: any): Promise<any> {
        return await this.request(`/user/products/${productUuid}`, 'DELETE')
    }
}

export const productService = new ProductService()
