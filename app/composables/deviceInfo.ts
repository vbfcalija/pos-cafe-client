// Identifies and describes the device the app is running on, for the
// activity log. A web page can't read the device's MAC address (browsers
// never expose it), so the app keeps its own random ID per device instead.
// It's the same ID the POS already stores with each shift as computer_id.

const DEVICE_ID_KEY = 'cafe_pos_computer_id'
let memoryDeviceId = ''

export function getDeviceId(): string {
    try {
        let deviceId = localStorage.getItem(DEVICE_ID_KEY)
        if (!deviceId) {
            deviceId = crypto.randomUUID()
            localStorage.setItem(DEVICE_ID_KEY, deviceId)
        }
        return deviceId
    } catch {
        // Storage blocked (e.g. private mode): keep one ID for this session at least.
        memoryDeviceId = memoryDeviceId || crypto.randomUUID()
        return memoryDeviceId
    }
}

export interface DeviceInfo {
    id: string
    model?: string
    platform?: string
    platform_version?: string
    mobile?: boolean
    touch: boolean
    screen: string
    viewport: string
    timezone?: string
    language?: string
    app_version?: string
    standalone: boolean
}

/**
 * Everything the browser will tell us about this device. Chromium browsers
 * can also report the device model (e.g. "SM-X200") and exact OS version;
 * that lookup is given half a second at most so sign-in is never held up.
 */
export async function collectDeviceInfo(): Promise<DeviceInfo> {
    const runtimeConfig = useRuntimeConfig()
    const nav: any = navigator
    const info: DeviceInfo = {
        id: getDeviceId(),
        platform: nav.userAgentData?.platform || nav.platform || undefined,
        mobile: nav.userAgentData?.mobile,
        touch: (nav.maxTouchPoints ?? 0) > 0,
        screen: `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio || 1}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: nav.language,
        app_version: runtimeConfig.public.appVersion ? String(runtimeConfig.public.appVersion) : undefined,
        standalone: window.matchMedia?.('(display-mode: standalone)').matches ?? false,
    }

    if (nav.userAgentData?.getHighEntropyValues) {
        try {
            const details: any = await Promise.race([
                nav.userAgentData.getHighEntropyValues(['model', 'platformVersion']),
                new Promise((resolve) => setTimeout(() => resolve({}), 500)),
            ])
            if (details?.model) info.model = String(details.model).slice(0, 100)
            if (details?.platformVersion) info.platform_version = String(details.platformVersion).slice(0, 50)
        } catch {
            // Not available on this browser; the server falls back to the User-Agent.
        }
    }

    return info
}
