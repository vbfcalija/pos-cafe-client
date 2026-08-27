export function useNumberFormatter() {
    function formatPrice(pricing: any) {
        const price = pricing
        if (isNaN(price)) return '0' // Ensure it's a valid number

        // Ensure two decimal places even for whole numbers
        const [whole, fraction = '00'] = Number(price).toFixed(2).split('.') as any

        // English: thousands separator as ',' and decimal as '.'
        const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return `₱${formattedWhole}.${fraction}`
    }

    return { formatPrice }
}