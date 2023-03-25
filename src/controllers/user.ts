import express, { Request, Response } from "express";
import { QueryResult } from 'pg';
import { pool } from '../connect';
import { config } from 'dotenv'
import { GetProduct, GetPackages, OrderAuth } from '../interfaces/product'
config();

export const profile = async(req: Request, res: Response) => {
    return res.json(req.res?.locals.user)
}

export const placeOrder = async(req: Request, res: Response) => {
    const { buyer, products } = req.body;
    const client = await pool.connect()
    const orderid = Date.now();
    try {
        await Promise.all(products.map(async(product: { _id: string, price: number, cartQuantity: number, quantity: string }) => {
            const { _id, price, cartQuantity, quantity } = product;
            const newQty = parseInt(quantity)-cartQuantity
            const addProducts: QueryResult = await pool.query(`INSERT INTO orders ( _id, product_id, buyer_id, fullname, email, country, city, address, postalcode, quantity, price, created_at ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE ) RETURNING *`, [ orderid, _id, buyer.userid, buyer.fullname, buyer.email, buyer.country, buyer.city, buyer.address, buyer.postalcode, cartQuantity, (price*0.8).toFixed() ])
            const updateQuantity: QueryResult = await pool.query(`UPDATE products SET quantity=$1 WHERE _id=$2 RETURNING *`, [ newQty, _id ])
            return res.json({ error: false, message: 'your order was successful!!!'})
        }))
    } catch (error) {
        console.log(error)
    } finally {
        client.release()
    }
}

export const getOrders = async(req: Request, res: Response) => {

    let status: OrderAuth;
    // get the user id
    const user = req.res?.locals.user;
    if (!user) {
        status = { error: true, message: "User is not authorized!"}
        return res.json(status)
    }
    
    const client = await pool.connect();
    try {
        const { rows }: QueryResult = await pool.query(`SELECT orders.pending, orders._id AS order_id, orders.quantity AS order_quantity, products._id, products.images, products.title, orders.price, products.quantity FROM orders LEFT JOIN products ON orders.product_id=products._id WHERE orders.buyer_id=$1 ORDER BY pending`, [ user._id]);
        status = { error: false, message: "successful!", orders: rows}
        return res.json(status)
    } catch (error) {
        console.log(error)
    } finally {
        client.release()
    }
    
    // get user orders and order by pending
    res.send('all orders')
}