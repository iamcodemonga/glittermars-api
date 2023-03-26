"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStripeOrder = exports.payWithStripe = void 0;
const dotenv_1 = require("dotenv");
const connect_1 = require("../connect");
(0, dotenv_1.config)();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const payWithStripe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { products, userid } = req.body;
    const items = products.map((product) => {
        return { _id: product._id, price: product.price, cartQuantity: product.cartQuantity, quantity: product.quantity };
    });
    const customer = yield stripe.customers.create({
        metadata: {
            userid,
            products: JSON.stringify(items)
        }
    });
    const line_items = products.map((product) => {
        const images = product.images.split(",").map((image) => image);
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
                unit_amount: parseInt(product.price) * 80,
            },
            quantity: product.cartQuantity,
        };
    });
    const session = yield stripe.checkout.sessions.create({
        shipping_address_collection: { allowed_countries: ['US', 'CA', 'NG', 'GB'] },
        line_items,
        customer: customer.id,
        shipping_options: [{
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: { amount: 65 * 100, currency: 'usd' },
                    display_name: 'Free shipping',
                    delivery_estimate: {
                        minimum: { unit: 'business_day', value: 3 },
                        maximum: { unit: 'business_day', value: 7 },
                    },
                },
            }],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/thanks`,
        cancel_url: `${process.env.CLIENT_URL}/cancelled`,
    });
    res.send({ url: session.url });
});
exports.payWithStripe = payWithStripe;
const addStripeOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // name variables
    const data = req.body.data.object;
    const eventType = req.body.type;
    // check for successful event
    if (eventType == 'checkout.session.completed') {
        const customer = yield stripe.customers.retrieve(data.customer);
        const shipping = data.shipping_details;
        const { name, address } = shipping;
        const { country, state, city, line1, line2, postal_code } = address;
        const { email, metadata } = customer;
        const { userid, products } = metadata;
        const orderid = Date.now();
        //Add order to database
        const client = yield connect_1.pool.connect();
        try {
            yield Promise.all(JSON.parse(products).map((product) => __awaiter(void 0, void 0, void 0, function* () {
                const { _id, price, cartQuantity, quantity } = product;
                const newQty = parseInt(quantity) - cartQuantity;
                const addProducts = yield connect_1.pool.query(`INSERT INTO orders ( _id, product_id, buyer_id, fullname, email, country, city, address, postalcode, quantity, price, created_at ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE ) RETURNING *`, [orderid, _id, userid, name, email, country, (state ? state : city), (line1 ? line1 : line2), (postal_code ? postal_code : ``), cartQuantity, (price * 0.8).toFixed()]);
                const updateQuantity = yield connect_1.pool.query(`UPDATE products SET quantity=$1 WHERE _id=$2 RETURNING *`, [newQty, _id]);
            })));
        }
        catch (error) {
            console.log(error);
        }
        finally {
            client.release();
        }
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send().end();
});
exports.addStripeOrder = addStripeOrder;
