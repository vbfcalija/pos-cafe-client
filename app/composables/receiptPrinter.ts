import { computed, ref } from 'vue'
import { orderService } from '@/components/api/user/OrderService'
import { useAlert } from '@/composables/alert'

// Two ways a receipt reaches the Bluetooth thermal printer, picked per device:
//
// 1. Android → RawBT. A browser can't talk classic-SPP Bluetooth, so the
//    ESC/POS bytes are handed to the RawBT app via Chrome's "intent:" URL
//    syntax (RawBT's own documented integration, rawbt.ru/intents.html).
//    There's no success/failure signal back, so this only confirms the job
//    was *sent to RawBT*.
//
// 2. iOS (iPhone/iPad) → Web Bluetooth. RawBT doesn't exist on iOS, and iOS
//    apps can only reach printers over Bluetooth Low Energy anyway, so the
//    same ESC/POS bytes are written straight to the printer's BLE write
//    characteristic. Safari has no Web Bluetooth, so this needs a browser
//    that does — Bluefy (free on the App Store). The printer must support
//    BLE (most 58/80mm "dual-mode" printers do).

export type PrintMethod = 'rawbt' | 'bluetooth' | 'unsupported'

// Service UUIDs used by common ESC/POS BLE printers. Web Bluetooth only lets
// us open services listed up front, so this list is what makes an unknown
// printer usable — the writable characteristic is then found automatically.
const PRINTER_SERVICES: string[] = [
    '000018f0-0000-1000-8000-00805f9b34fb', // generic thermal (Goojprt, PT-210, MTP-II…)
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Xprinter / Rongta
    '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC / Microchip transparent UART
    '0000ff00-0000-1000-8000-00805f9b34fb',
    '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10 style serial
    '0000fee7-0000-1000-8000-00805f9b34fb',
    '0000ae30-0000-1000-8000-00805f9b34fb', // cat/mini printers
    '0000af30-0000-1000-8000-00805f9b34fb',
]

// Small chunks with a short pause: cheap printers have tiny buffers and drop
// bytes if flooded, and iOS caps a no-response write at the negotiated MTU.
const CHUNK_SIZE = 100
const CHUNK_DELAY_MS = 20

// Kept at module level so the printer picked once stays connected for every
// receipt until the page is reloaded — only the *first* pick needs a tap.
let printerDevice: any = null
let printerCharacteristic: any = null
const connectedPrinterName = ref('')

function isIOS() {
    if (typeof navigator === 'undefined') return false
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
        // iPadOS reports itself as a Mac; touch support gives it away.
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function hasWebBluetooth() {
    return typeof navigator !== 'undefined' && !!(navigator as any).bluetooth
}

function base64ToBytes(base64: string) {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function findWritableCharacteristic(server: any) {
    const services = await server.getPrimaryServices()
    for (const service of services) {
        const characteristics = await service.getCharacteristics()
        const writable = characteristics.find((c: any) => c.properties.writeWithoutResponse)
            || characteristics.find((c: any) => c.properties.write)
        if (writable) return writable
    }
    throw new Error('This printer has no writable Bluetooth channel. Make sure it supports Bluetooth Low Energy (BLE).')
}

async function connect(device: any) {
    if (!device.gatt) throw new Error('This device does not support Bluetooth printing.')
    const server = device.gatt.connected ? device.gatt : await device.gatt.connect()
    printerCharacteristic = await findWritableCharacteristic(server)
    printerDevice = device
    connectedPrinterName.value = device.name || 'Bluetooth printer'
}

async function writeBytes(bytes: Uint8Array) {
    const characteristic = printerCharacteristic!
    const withoutResponse = characteristic.properties.writeWithoutResponse
    for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
        const chunk = bytes.slice(offset, offset + CHUNK_SIZE)
        if (withoutResponse) {
            await characteristic.writeValueWithoutResponse(chunk)
            await sleep(CHUNK_DELAY_MS)
        } else {
            await characteristic.writeValueWithResponse(chunk)
        }
    }
}

export function useReceiptPrinter() {
    const { successAlert } = useAlert()

    const printMethod = computed<PrintMethod>(() => {
        if (isIOS()) return hasWebBluetooth() ? 'bluetooth' : 'unsupported'
        return 'rawbt'
    })

    function sendToRawBt(escposData: string) {
        // The literal "base64," prefix is required — without it RawBT prints
        // the base64 string itself instead of decoding it into ESC/POS bytes.
        const intentUrl = `intent:base64,${escposData}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`
        window.location.href = intentUrl
        successAlert('Sent to RawBT', 'Check RawBT to confirm the receipt printed.')
    }

    // Must be called from a click: the very first call opens the browser's
    // printer picker, which is only allowed inside a user gesture. Nothing
    // is awaited before requestDevice() for that reason.
    async function sendViaBluetooth(escposData: string) {
        const bytes = base64ToBytes(escposData)

        if (!printerDevice) {
            const device = await (navigator as any).bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: PRINTER_SERVICES,
            })
            await connect(device)
        } else if (!printerDevice.gatt?.connected || !printerCharacteristic) {
            await connect(printerDevice)
        }

        try {
            await writeBytes(bytes)
        } catch {
            // Printer may have slept or dropped the link — reconnect once.
            await connect(printerDevice!)
            await writeBytes(bytes)
        }
        successAlert('Printed', `Receipt sent to ${connectedPrinterName.value}.`)
    }

    // Single entry point for the Print button. Throws with a readable
    // message the caller can show.
    async function sendToPrinter(escposData: string) {
        if (printMethod.value === 'rawbt') return sendToRawBt(escposData)
        if (printMethod.value === 'unsupported') {
            throw new Error('Safari can\'t print to Bluetooth printers. Open this site in the Bluefy browser (free on the App Store) to print receipts.')
        }
        try {
            await sendViaBluetooth(escposData)
        } catch (error: any) {
            if (error?.name === 'NotFoundError') throw new Error('No printer selected.')
            throw new Error(error?.message || 'Could not print to the Bluetooth printer.')
        }
    }

    function forgetPrinter() {
        printerDevice?.gatt?.disconnect()
        printerDevice = null
        printerCharacteristic = null
        connectedPrinterName.value = ''
    }

    // Auto-print after a sale. On Android this is the RawBT handoff; on iOS
    // it only prints if a printer was already picked this session, since the
    // picker can't open without a tap — "Print receipt" covers the first one.
    async function printOrderReceipt(orderUuid: string) {
        if (printMethod.value === 'unsupported') return
        if (printMethod.value === 'bluetooth' && !printerDevice) return
        const response = await orderService.getReceiptEscPos(orderUuid)
        await sendToPrinter(response.data)
    }

    return { printMethod, connectedPrinterName, sendToPrinter, sendToRawBt, forgetPrinter, printOrderReceipt }
}
