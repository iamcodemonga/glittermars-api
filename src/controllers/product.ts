import express, { Request, Response } from "express";
import { QueryResult } from 'pg';
import crypto from 'crypto';
import { pool } from '../connect';

// create product
export const addProduct = async (req: Request, res: Response) => {
   // Interfaces
   interface statusInterface {
      error: boolean,
      message: string,
      product?: any[]
   }

   interface uploadInterface {
      images: string[],
      title: string,
      price: number,
      quantity: number,
      description: string,
      category: string
   }

   // variable declaration
   let status: statusInterface;

   const { images, title, price, quantity, description, category } : uploadInterface = req.body;

   //Error checking - emptiness
   if ( !title || !price || !quantity || !description || !category ) {
      status = { error: true, message: "Please fill in all fields!" };
      return res.json(status);
   }

   if (images.length < 1 || images.length > 4 ) {
      status = { error: true, message: "Product Images must not be more than four(4) or less than one(1)"};
      return res.json(status);
   }

   const client = await pool.connect();
   try {

      let _id: string = crypto.randomUUID();
      // Add to database
      const { rows } : QueryResult = await pool.query('INSERT INTO products ( _id, images, title, category, price, quantity, description, created_at ) VALUES ( $1, $2, $3, $4, $5, $6, $7, CURRENT_DATE ) RETURNING *', [ _id, images.join(','), title, category, price, quantity, description ]);

      if (rows[0].id) {
         // return success message
         status = { error: false, message: "uploaded successfully", product: rows }
         return res.json(status);
      } else {
         status = { error: true, message: "could not upload product!" }
         return res.json(status);
      }
      
   } catch (error) {
      console.log(error)
   } finally {
      client.release();
   }

}
// Get all products
export const allProducts = async(req: Request, res: Response) => {

   const client = await pool.connect();
   try {
      const { rows } : QueryResult = await pool.query('SELECT _id, images, title, price, quantity FROM products');
      return res.json(rows);

   } catch (error) {
      console.log(error)
   } finally {
      client.release();
   }

}
// Get products by category
export const groupedProduct = async(req: Request, res: Response) => {

   interface statusInterface {
      error: boolean,
      message: string,
      product?: any[]
   }

   // variable declaration
   let status: statusInterface;

   const { category }  = req.params;
   const availableCategories = [ 'accessories', 'clothing', 'jewelries', 'shoes' ];

   if (!availableCategories.includes(category)) {
      status = { error: true, message: `${category} does not exist as a category!` }
      return res.json(status);
   }

   const client = await pool.connect();
   try {

      const { rows } : QueryResult = await pool.query('SELECT _id, images, title, price, quantity FROM products WHERE category=$1', [ category ]);
      status = { error: false, message: "All products available", product: rows };
      return res.json(status);

   } catch (error) {
      console.log(error)
   } finally {
      client.release();
   }

}
// Get recommended products
export const similarProducts = async(req: Request, res: Response) => {

   const { category, id }  = req.query;

   const client = await pool.connect();
   try {

      const { rows } : QueryResult = await pool.query('SELECT _id, images, title, price, quantity FROM products WHERE category=$1 AND _id!=$2', [ category, id ]);
      return res.json(rows);

   } catch (error) {
      console.log(error)
   } finally {
      client.release();
   }

}
// Get product by id
export const Product = async(req: Request, res: Response) => {

   interface statusInterface {
      error: boolean,
      message: string,
      product?: any[]
   }

   // variable declaration
   let status: statusInterface;

   const { id }  = req.params;

   const client = await pool.connect();
   try {

      const { rows, rowCount } : QueryResult = await pool.query('SELECT _id, images, title, category, price, quantity, description FROM products WHERE _id=$1', [ id ]);
      if (rowCount == 0) {
         status = { error: true, message: "this product does not exist!" };
         return res.json(status);
      }
      status = { error: false, message: "product available!", product: rows };
      return res.json(status);

   } catch (error) {
      console.log(error)
   } finally {
      client.release()
   }

}
// Get best-selling products
export const bestProducts = async(req: Request, res: Response) => {

   const client = await pool.connect();
   try {

      const { rows } : QueryResult = await pool.query('SELECT products._id, product.title, products.images, products.price, products.quantity, products SUM(order_items.quantity) as total_quantity FROM order_items JOIN products ON order_items.product_id = products.id GROUP BY products.id ORDER BY total_quantity DESC LIMIT 6');
      return res.json(rows);

   } catch (error) {
      console.log(error)
   } finally {
      client.release();
   }

}
// get searched product
