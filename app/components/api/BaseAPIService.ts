import APIError from '@/components/api/user/APIError'

class BaseAPIService {
    async request(url: string, method: string, params: object = []): Promise<any> {
        const runtimeConfig = useRuntimeConfig()
        let config: any = null
        // Create the configuration for the request
        const headers = {
            Authorization: 'Bearer ' + localStorage.getItem('_token'),
            Accept: 'application/json',
        }

        // Every verb is sent via raw XMLHttpRequest rather than $fetch.
        // NativePHP's mobile WebView wraps window.fetch for request/response
        // logging, and under that wrapper ofetch's automatic JSON parsing
        // doesn't run: a GET response comes back as the raw JSON *string*
        // instead of a parsed object, so e.g. `response.data` is silently
        // undefined and list pages render empty despite the API returning
        // real rows. The same wrapper also drops POST/PUT/DELETE bodies
        // (ofetch resolves its internal fetch reference before the patch is
        // injected). XMLHttpRequest isn't affected by either issue, so every
        // request goes through it here and JSON is parsed explicitly.
        const isGet = method === 'GET'
        const query = isGet ? this.buildQueryString(params) : ''

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open(method, `${runtimeConfig.public.apiBaseURL}${url}${query}`)
            xhr.setRequestHeader('Authorization', headers.Authorization)
            xhr.setRequestHeader('Accept', headers.Accept)
            if (!isGet) {
                xhr.setRequestHeader('Content-Type', 'application/json')
            }

            xhr.onload = () => {
                let data: any = null
                try {
                    data = xhr.responseText ? JSON.parse(xhr.responseText) : null
                } catch {
                    data = null
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(data)
                } else {
                    reject(this.mapError(xhr.status, data))
                }
            }

            xhr.onerror = () => {
                reject(this.mapError(0, null))
            }

            xhr.send(isGet ? null : JSON.stringify(params))
        })
    }

    buildQueryString(params: any): string {
        const query = new URLSearchParams()

        for (const [key, value] of Object.entries(params || {})) {
            if (value === undefined || value === null || value === '') continue
            if (Array.isArray(value)) {
                if (value.length === 0) continue
                value.forEach((item) => query.append(key, item))
            } else {
                query.append(key, value as string)
            }
        }

        const stringified = query.toString()
        return stringified ? `?${stringified}` : ''
    }

    mapError(status: number | undefined, data: any): APIError {
        switch (status) {
            case 400:
            case 404:
            case 409:
            case 422:
            case 429:
                return new APIError(data || {})
            case 401:
                this.revokeAccess()
                return new APIError({
                    message: "Server error. Please try again. If the problem persists, contact your system administrator"
                })
            case 500:
                return new APIError({
                    message: "Server error. Please try again. If the problem persists, contact your system administrator"
                })
            default:
                return new APIError({
                    message: "Something went wrong. Please try again. If the problem persists, contact your system administrator"
                })
        }
    }

    revokeAccess() {
        localStorage.removeItem("_token")
        localStorage.removeItem("remember_me")
        navigateTo('/')
    }
}

export default BaseAPIService
