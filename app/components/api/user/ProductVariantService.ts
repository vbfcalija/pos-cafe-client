import BaseAPIService from '@/components/api/BaseAPIService'

class ProductVariantService extends BaseAPIService {
    async getProductVariants(params: object): Promise<any> {
        return await this.request(`/user/product-variants`, 'GET', params)
    }
    async getProductVariant(productVariantUuid: any): Promise<any> {
        return await this.request(`/user/product-variants/${productVariantUuid}`, 'GET')
    }
    async saveProductVariant(params: object): Promise<any> {
        return await this.request(`/user/product-variants`, 'POST', params)
    }
    async updateProductVariant(productVariantUuid: any, params: object): Promise<any> {
        return await this.request(`/user/product-variants/${productVariantUuid}`, 'PUT', params)
    }
    async deleteProductVariant(productVariantUuid: any): Promise<any> {
        return await this.request(`/user/product-variants/${productVariantUuid}`, 'DELETE')
    }
}

export const productVariantService = new ProductVariantService()
