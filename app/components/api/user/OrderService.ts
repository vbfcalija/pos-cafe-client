import BaseAPIService from '@/components/api/BaseAPIService'
import APIError from '@/components/api/user/APIError'

class OrderService extends BaseAPIService {
    async getOrders(params: object): Promise<any> {
        return await this.request('/user/orders', 'GET', params)
    }

    async getOrder(orderUuid: string): Promise<any> {
        return await this.request(`/user/orders/${orderUuid}`, 'GET')
    }

    async saveOrder(params: object): Promise<any> {
        return await this.request('/user/orders', 'POST', params)
    }

    async printReceipt(orderUuid: string): Promise<any> {
        return await this.request(`/user/orders/${orderUuid}/print`, 'POST')
    }

    // Base64 ESC/POS bytes for handing off to RawBT — see receipt-preview-modal.vue.
    async getReceiptEscPos(orderUuid: string): Promise<any> {
        return await this.request(`/user/orders/${orderUuid}/receipt-escpos`, 'POST')
    }

    // Not routed through BaseAPIService.request() — that always parses JSON,
    // but this response is binary (application/pdf) on plain web, and JSON
    // on the packaged mobile app, where the backend has already handed the
    // PDF to Android's native share sheet since there's no browser to
    // download a file to there.
    async downloadReceiptPdf(orderUuid: string): Promise<{ deliveredVia: 'download' | 'share' }> {
        const runtimeConfig = useRuntimeConfig()
        const headers = {
            Authorization: 'Bearer ' + localStorage.getItem('_token'),
            Accept: 'application/json',
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('POST', `${runtimeConfig.public.apiBaseURL}/user/orders/${orderUuid}/receipt-pdf`)
            xhr.setRequestHeader('Authorization', headers.Authorization)
            xhr.setRequestHeader('Accept', headers.Accept)
            xhr.responseType = 'blob'

            xhr.onload = () => {
                if (xhr.status < 200 || xhr.status >= 300) {
                    const reader = new FileReader()
                    reader.onload = () => {
                        let data: any = null
                        try {
                            data = JSON.parse(reader.result as string)
                        } catch {
                            data = null
                        }
                        reject(new APIError(data || {}))
                    }
                    reader.onerror = () => reject(new APIError({}))
                    reader.readAsText(xhr.response)
                    return
                }

                const contentType = xhr.getResponseHeader('Content-Type') || ''

                if (contentType.includes('application/json')) {
                    resolve({ deliveredVia: 'share' })
                    return
                }

                const blob = new Blob([xhr.response], { type: 'application/pdf' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `receipt-${orderUuid}.pdf`
                link.click()
                URL.revokeObjectURL(url)
                resolve({ deliveredVia: 'download' })
            }

            xhr.onerror = () => reject(new APIError({}))
            xhr.send()
        })
    }

    async refundOrder(orderUuid: string): Promise<any> {
        return await this.request(`/user/orders/${orderUuid}/refund`, 'POST')
    }

    async updatePayment(orderUuid: string, paymentUuid: string, params: object): Promise<any> {
        return await this.request(`/user/orders/${orderUuid}/payments/${paymentUuid}`, 'PATCH', params)
    }
}

export const orderService = new OrderService()
