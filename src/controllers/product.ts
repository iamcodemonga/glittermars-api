import express, { Request, Response } from "express";
import { QueryResult } from 'pg';
import crypto from 'crypto';
import { pool } from '../connect';
import { GetProduct, ProductAuth, Review, ReviewStatus } from "../interfaces/product";
import redis from "../cache";

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
export const latestProducts = async(req: Request, res: Response) => {

   const client = await pool.connect();
   try {
      const cachedProducts = await redis.get("latestProducts");
      if (cachedProducts) {
         return res.json(JSON.parse(cachedProducts));
      }
      const { rows } : QueryResult = await pool.query('SELECT _id, images, title, price, quantity FROM products ORDER BY id DESC');
      await redis.set("latestProducts", JSON.stringify(rows), "EX", 60*60);
      return res.json(rows);

   } catch (error) {
      console.log(error)
   } finally {
      client.release();
   }

}
// Get all products
export const allProducts = async(req: Request, res: Response) => {

   const { min, max } = req.query;

   const client = await pool.connect();
   try {

      if ((min=="" || min == undefined) && (max=="" || max == undefined)) {
         const { rows } : QueryResult = await pool.query(`SELECT _id, images, title, category, price, quantity FROM products ORDER BY id ASC`);
         return res.json(rows);
      }
      
      const { rows } : QueryResult = await pool.query(`SELECT _id, images, title, category, price, quantity FROM products WHERE price < $1 AND price > $2 ORDER BY id ASC`, [ max, min ]);
      return res.json(rows);

   } catch (error) {
      console.log(error)
   } finally {
      client.release();
   }

}
// Get products by category
export const groupedProduct = async(req: Request, res: Response) => {

   // variable declaration
   let status: ProductAuth;

   const { category }  = req.params;
   const { min, max } = req.query;
   const availableCategories = [ 'accessories', 'clothing', 'jewelries', 'shoes' ];

   if (!availableCategories.includes(category)) {
      status = { error: true, message: `${category} does not exist as a category!` }
      return res.json(status);
   }

   const client = await pool.connect();
   try {

      if ((min=="" || min == undefined) && (max=="" || max == undefined)) {
         const { rows } : QueryResult = await pool.query('SELECT _id, images, title, price, quantity FROM products WHERE category=$1', [ category ]);
         status = { error: false, message: "All products available", product: rows };
         return res.json(status);
      }

      const { rows } : QueryResult = await pool.query('SELECT _id, images, title, price, quantity FROM products WHERE category=$1 AND price < $2 AND price > $3 ORDER BY id ASC', [ category, max, min ]);
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

   const { productid }  = req.params;

   const client = await pool.connect();
   try {
      const category: QueryResult = await pool.query('SELECT category FROM products WHERE _id=$1', [ productid ]);
      const { rows } : QueryResult = await pool.query('SELECT _id, images, title, category, price, quantity FROM products WHERE category=$1 AND _id!=$2 LIMIT 6', [ category.rows[0].category, productid ]);
      return res.json(rows);

   } catch (error) {
      console.log(error)
   } finally {
      client.release();
   }

}
// Get product by id
export const Product = async(req: Request, res: Response) => {

   // variable declaration
   let status: ProductAuth;
   const user = req.res?.locals.user;
   let customer: boolean = false;

   const { id }  = req.params;

   const client = await pool.connect();
   try {

      const { rows, rowCount } : QueryResult = await pool.query('SELECT _id, images, title, category, price, quantity, description FROM products WHERE _id=$1', [ id ]);
      if (rowCount == 0) {
         status = { error: true, message: "this product does not exist!" };
         return res.json(status);
      }
      if (user){
         const patron : QueryResult = await pool.query('SELECT id FROM orders WHERE product_id=$1 AND buyer_id=$2', [ id, user._id ]);
         if (patron.rowCount > 0) {
            customer = true;
         }
      }
      status = { error: false, message: "product available!", product: rows, customer };
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
      const cachedProducts = await redis.get("bestSellingProducts");
      if (cachedProducts) {
         return res.json(JSON.parse(cachedProducts));
      }
      const { rows } : QueryResult = await pool.query('SELECT products._id, products.images, products.title, products.price, products.quantity, SUM(orders.quantity) AS order_quantity FROM orders JOIN products ON orders.product_id = products._id GROUP BY products._id, products.images, products.title, products.price, products.quantity ORDER BY order_quantity DESC LIMIT 6');
      await redis.set("bestSellingProducts", JSON.stringify(rows), "EX", 60*60);
      return res.json(rows);

   } catch (error) {
      console.log(error)
   } finally {
      client.release();
   }

}
// Get product reviews
export const getReviews = async(req: Request, res: Response) => {

   const { id } = req.params;
   const client = await pool.connect();
   try {
      const { rows } = await pool.query("SELECT reviews.product_id, reviews.title, reviews.description, reviews.rating, reviews.created_at as date, users._id, users.fullname FROM reviews LEFT JOIN users on reviews.user_id = users._id WHERE reviews.product_id = $1", [ id ]);
      // console.log(rows)
      return res.json(rows)
   } catch (error) {
      console.log(error)
   } finally {
      client.release()
   }
}
// Add product review
export const addReview = async(req: Request, res: Response) => {

   let status: ReviewStatus;

   const { review } = req.body;
   const { title, rating, description } = review;
   const { id } = req.params;
   const { user } = req.query;
   const today: Date = new Date();
   const date = `${today.getDate()}-${today.getMonth()}-${today.getFullYear()}`

   if (!title || !description) {
      status = { error: true, message: "please fill in all fields!!!" }
      return res.json({ status })
   }

   const client = await pool.connect()
   try {
      const { rows }: QueryResult = await pool.query('INSERT INTO reviews (user_id, product_id, title, description, rating, created_at) VALUES ( $1, $2, $3, $4, $5, $6 ) RETURNING id', [ user, id, title, description, rating, date]);
      const getReview: QueryResult = await pool.query("SELECT reviews.product_id, reviews.title, reviews.description, reviews.rating, reviews.created_at as date, users._id, users.fullname FROM reviews LEFT JOIN users on reviews.user_id = users._id WHERE reviews.id = $1", [ rows[0].id ]);
      status = { error: false, message: "successful!!!", review: getReview.rows[0] }
      return res.json({ status })
   } catch (error) {
      console.log(error)
   } finally {
      client.release()
   }

}
// get searched product

