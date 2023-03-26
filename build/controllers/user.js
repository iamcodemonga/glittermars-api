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
exports.getOrders = exports.placeOrder = exports.profile = void 0;
const connect_1 = require("../connect");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return res.json((_a = req.res) === null || _a === void 0 ? void 0 : _a.locals.user);
});
exports.profile = profile;
const placeOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { buyer, products } = req.body;
    const client = yield connect_1.pool.connect();
    const orderid = Date.now();
    try {
        yield Promise.all(products.map((product) => __awaiter(void 0, void 0, void 0, function* () {
            const { _id, price, cartQuantity, quantity } = product;
            const newQty = parseInt(quantity) - cartQuantity;
            const addProducts = yield connect_1.pool.query(`INSERT INTO orders ( _id, product_id, buyer_id, fullname, email, country, city, address, postalcode, quantity, price, created_at ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE ) RETURNING *`, [orderid, _id, buyer.userid, buyer.fullname, buyer.email, buyer.country, buyer.city, buyer.address, buyer.postalcode, cartQuantity, (price * 0.8).toFixed()]);
            const updateQuantity = yield connect_1.pool.query(`UPDATE products SET quantity=$1 WHERE _id=$2 RETURNING *`, [newQty, _id]);
            return res.json({ error: false, message: 'your order was successful!!!' });
        })));
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.placeOrder = placeOrder;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    let status;
    // get the user id
    const user = (_b = req.res) === null || _b === void 0 ? void 0 : _b.locals.user;
    if (!user) {
        status = { error: true, message: "User is not authorized!" };
        return res.json(status);
    }
    const client = yield connect_1.pool.connect();
    try {
        const { rows } = yield connect_1.pool.query(`SELECT orders.pending, orders._id AS order_id, orders.quantity AS order_quantity, products._id, products.images, products.title, orders.price, products.quantity FROM orders LEFT JOIN products ON orders.product_id=products._id WHERE orders.buyer_id=$1 ORDER BY pending`, [user._id]);
        status = { error: false, message: "successful!", orders: rows };
        return res.json(status);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
    // get user orders and order by pending
    res.send('all orders');
});
exports.getOrders = getOrders;
