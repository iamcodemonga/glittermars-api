export interface getProduct {
    _id: string,
    images: string,
    title: string,
    category?: string,
    price: string,
    quantity: string,
    description?: string,
    created_at?: string
}

export interface getPackages extends getProduct {
    order_id: string,
    pending: number,
    order_quantity: string
}

// export interface addressInfo {
//     country: string,
//     city: string,
//     address: string,
//     postal_code: number
// }

// export interface makeOrders extends addressInfo {
//     _id: string,
//     product_id: string,
//     buyer_id: string,
//     name: string,
//     email: string,
//     cartQuantity: number,
//     price: string,
//     created_at: string

// }

export interface getComments {
    _id: string,
    fullname: string,
    product_id: string,
    title: string,
    description: string,
    rating: string,
    date: string,
}

export interface addComments {
    title: string,
    rating: number,
    description: string,
}

export interface orderAuth {
    error: boolean,
    message: string,
    orders?: Array<getPackages>
}

export interface productAuth {
    error: boolean,
    message: string,
    products?: Array<getPackages>
}