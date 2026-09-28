import { orderService } from '@/components/api/user/OrderService'
import { useAlert } from '@/composables/alert'

// The app is a plain website now, not a packaged native app, so there's no
// bridge for a browser to talk Bluetooth to a classic-SPP thermal printer
// (Web Bluetooth only supports BLE). RawBT bridges that gap: handing it
// ESC/POS bytes via Chrome's "intent:" URL syntax hands the print job to
// that app, which does the real Bluetooth printing — this is RawBT's own
// documented integration (rawbt.ru/intents.html), not a plain `rawbt:` href,
// which Chrome doesn't reliably resolve into an app handoff on its own.
//
// There's also no way to get a genuine success/failure signal back from
// this handoff, so this can only confirm the job was *sent to RawBT* —
// never that it actually printed.
export function useReceiptPrinter() {
    const { successAlert } = useAlert()

    function sendToRawBt(escposData: string) {
        // The literal "base64," prefix is required — without it RawBT can't
        // tell the payload apart from plain text and just prints the base64
        // string itself verbatim instead of decoding it into ESC/POS bytes
        // first. Matches escpos-php's own RawbtPrintConnector exactly.
        const intentUrl = `intent:base64,${escposData}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`
        window.location.href = intentUrl
        successAlert('Sent to RawBT', 'Check RawBT to confirm the receipt printed.')
    }

    async function printOrderReceipt(orderUuid: string) {
        const response = await orderService.getReceiptEscPos(orderUuid)
        sendToRawBt(response.data)
    }

    return { sendToRawBt, printOrderReceipt }
}
