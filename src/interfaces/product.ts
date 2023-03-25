export interface GetProduct {
    _id: string,
    images: string,
    title: string,
    category?: string,
    price: string,
    quantity: string,
    description?: string,
    created_at?: string
}

export interface ProductAuth {
    error: boolean,
    message: string,
    product?: Array<GetProduct>
    customer?: boolean
}

export interface GetPackages extends GetProduct {
    order_id: string,
    pending: number,
    order_quantity: string
}

export interface OrderAuth {
    error: boolean,
    message: string,
    orders?: Array<GetPackages>
}

export interface Review {
    product_id: string,
    title: string,
    description: string,
    rating: number,
    date: string,
    _id: string,
    fullname: string
 }

 export interface ReviewStatus {
    error: boolean,
    message: string,
    review?: Review,
    customer?: boolean
}