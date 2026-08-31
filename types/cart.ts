export interface CartLine {
    product_variant_uuid: string
    product_name: string
    variant_name: string
    price: number
    tax_percentage: number
    quantity: number
    discount_uuid: string
}
