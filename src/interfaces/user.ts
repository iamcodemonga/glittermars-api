export interface getUser {
    id?: number,
    _id?: string,
    fullname?: string,
    email?: string,
    password?: string
}

export interface User {
    _id?: string,
    fullname?: string,
    email: string,
    password: string
}

export interface authStatus {
    error: boolean,
    message: string,
    user?: Array<getUser>
}