import { Request, Response } from "express";
import { config } from 'dotenv';
import { pool } from '../connect';
config();

const stripe = require('stripe')(process.env.STRIPE_KEY);

export const payWithStripe = async(req:Request, res:Response) => {

    const { products, userid } = req.body;

    const items = products.map((product: { _id: string,  price: string, cartQuantity: number, quantity: string }) => {
      return { _id: product._id, price: product.price, cartQuantity: product.cartQuantity, quantity: product.quantity }
    })

    const customer = await  stripe.customers.create({
      metadata: {
        userid,
        products: JSON.stringify(items)
      }
    });

    const line_items = products.map((product: { _id: string, images: string, title: string, price: string, cartQuantity: number, quantity?: string }) => {
        const images = product.images.split(",").map((image) => image)
        return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.title,
                images,
                metadata: {
                    id: product._id
                }  
                // images: [ product.images.split(",")[0] ]
              },
              unit_amount: parseInt(product.price)*80,
            },
            quantity: product.cartQuantity,
          }
    })

    const session = await stripe.checkout.sessions.create({
        shipping_address_collection: {allowed_countries: ['US', 'CA', 'NG', 'GB']},
        line_items,
        customer: customer.id,
        shipping_options: [{
          shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {amount: 65*100, currency: 'usd'},
              display_name: 'Free shipping',
              delivery_estimate: {
              minimum: {unit: 'business_day', value: 3},
              maximum: {unit: 'business_day', value: 7},
              },
          },
        }],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/thanks`,
        cancel_url: `${process.env.CLIENT_URL}/cancelled`,
      });
    
      res.send({ url: session.url });
}

export const addStripeOrder = async(req:Request, res:Response) => {

  // name variables
  const data = req.body.data.object;
  const eventType = req.body.type;

  // check for successful event
  if (eventType == 'checkout.session.completed') {
      const customer = await stripe.customers.retrieve(data.customer)
      const shipping = data.shipping_details;

      const { name, address } = shipping
      const { country, state, city,  line1, line2, postal_code } = address;
      const { email, metadata } = customer;
      const { userid, products } = metadata;
      const orderid = Date.now();

      //Add order to database
      const client = await pool.connect()
      try {
          await Promise.all(JSON.parse(products).map(async(product: { _id: string, price: number, cartQuantity: number, quantity: string }) => {
              const { _id, price, cartQuantity, quantity } = product;
              const newQty = parseInt(quantity)-cartQuantity
              const addProducts = await pool.query(`INSERT INTO orders ( _id, product_id, buyer_id, fullname, email, country, city, address, postalcode, quantity, price, created_at ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE ) RETURNING *`, [ orderid, _id, userid, name, email, country, (state ? state: city), (line1 ? line1 : line2), (postal_code ? postal_code : ``), cartQuantity, (price*0.8).toFixed() ])
              const updateQuantity = await pool.query(`UPDATE products SET quantity=$1 WHERE _id=$2 RETURNING *`, [ newQty, _id ])
          }))
      } catch (error) {
          console.log(error)
      } finally {
          client.release()
      }
    }

  // Return a 200 response to acknowledge receipt of the event
  res.send().end();
}