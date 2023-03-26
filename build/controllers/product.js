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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReview = exports.getReviews = exports.bestProducts = exports.Product = exports.similarProducts = exports.groupedProduct = exports.allProducts = exports.latestProducts = exports.addProduct = void 0;
const crypto_1 = __importDefault(require("crypto"));
const connect_1 = require("../connect");
const cache_1 = __importDefault(require("../cache"));
// create product
const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // variable declaration
    let status;
    const { images, title, price, quantity, description, category } = req.body;
    //Error checking - emptiness
    if (!title || !price || !quantity || !description || !category) {
        status = { error: true, message: "Please fill in all fields!" };
        return res.json(status);
    }
    if (images.length < 1 || images.length > 4) {
        status = { error: true, message: "Product Images must not be more than four(4) or less than one(1)" };
        return res.json(status);
    }
    const client = yield connect_1.pool.connect();
    try {
        let _id = crypto_1.default.randomUUID();
        // Add to database
        const { rows } = yield connect_1.pool.query('INSERT INTO products ( _id, images, title, category, price, quantity, description, created_at ) VALUES ( $1, $2, $3, $4, $5, $6, $7, CURRENT_DATE ) RETURNING *', [_id, images.join(','), title, category, price, quantity, description]);
        if (rows[0].id) {
            // return success message
            status = { error: false, message: "uploaded successfully", product: rows };
            return res.json(status);
        }
        else {
            status = { error: true, message: "could not upload product!" };
            return res.json(status);
        }
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.addProduct = addProduct;
// Get all products
const latestProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield connect_1.pool.connect();
    try {
        const cachedProducts = yield cache_1.default.get("latestProducts");
        if (cachedProducts) {
            return res.json(JSON.parse(cachedProducts));
        }
        const { rows } = yield connect_1.pool.query('SELECT _id, images, title, price, quantity FROM products ORDER BY id DESC');
        yield cache_1.default.set("latestProducts", JSON.stringify(rows), "EX", 60 * 60);
        return res.json(rows);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.latestProducts = latestProducts;
// Get all products
const allProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { min, max } = req.query;
    const client = yield connect_1.pool.connect();
    try {
        if ((min == "" || min == undefined) && (max == "" || max == undefined)) {
            const { rows } = yield connect_1.pool.query(`SELECT _id, images, title, category, price, quantity FROM products ORDER BY id ASC`);
            return res.json(rows);
        }
        const { rows } = yield connect_1.pool.query(`SELECT _id, images, title, category, price, quantity FROM products WHERE price < $1 AND price > $2 ORDER BY id ASC`, [max, min]);
        return res.json(rows);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.allProducts = allProducts;
// Get products by category
const groupedProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // variable declaration
    let status;
    const { category } = req.params;
    const { min, max } = req.query;
    const availableCategories = ['accessories', 'clothing', 'jewelries', 'shoes'];
    if (!availableCategories.includes(category)) {
        status = { error: true, message: `${category} does not exist as a category!` };
        return res.json(status);
    }
    const client = yield connect_1.pool.connect();
    try {
        if ((min == "" || min == undefined) && (max == "" || max == undefined)) {
            const { rows } = yield connect_1.pool.query('SELECT _id, images, title, price, quantity FROM products WHERE category=$1', [category]);
            status = { error: false, message: "All products available", product: rows };
            return res.json(status);
        }
        const { rows } = yield connect_1.pool.query('SELECT _id, images, title, price, quantity FROM products WHERE category=$1 AND price < $2 AND price > $3 ORDER BY id ASC', [category, max, min]);
        status = { error: false, message: "All products available", product: rows };
        return res.json(status);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.groupedProduct = groupedProduct;
// Get recommended products
const similarProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productid } = req.params;
    const client = yield connect_1.pool.connect();
    try {
        const category = yield connect_1.pool.query('SELECT category FROM products WHERE _id=$1', [productid]);
        const { rows } = yield connect_1.pool.query('SELECT _id, images, title, category, price, quantity FROM products WHERE category=$1 AND _id!=$2 LIMIT 6', [category.rows[0].category, productid]);
        return res.json(rows);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.similarProducts = similarProducts;
// Get product by id
const Product = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // variable declaration
    let status;
    const user = (_a = req.res) === null || _a === void 0 ? void 0 : _a.locals.user;
    let customer = false;
    const { id } = req.params;
    const client = yield connect_1.pool.connect();
    try {
        const { rows, rowCount } = yield connect_1.pool.query('SELECT _id, images, title, category, price, quantity, description FROM products WHERE _id=$1', [id]);
        if (rowCount == 0) {
            status = { error: true, message: "this product does not exist!" };
            return res.json(status);
        }
        if (user) {
            const patron = yield connect_1.pool.query('SELECT id FROM orders WHERE product_id=$1 AND buyer_id=$2', [id, user._id]);
            if (patron.rowCount > 0) {
                customer = true;
            }
        }
        status = { error: false, message: "product available!", product: rows, customer };
        return res.json(status);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.Product = Product;
// Get best-selling products
const bestProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield connect_1.pool.connect();
    try {
        const cachedProducts = yield cache_1.default.get("bestSellingProducts");
        if (cachedProducts) {
            return res.json(JSON.parse(cachedProducts));
        }
        const { rows } = yield connect_1.pool.query('SELECT products._id, products.images, products.title, products.price, products.quantity, SUM(orders.quantity) AS order_quantity FROM orders JOIN products ON orders.product_id = products._id GROUP BY products._id, products.images, products.title, products.price, products.quantity ORDER BY order_quantity DESC LIMIT 6');
        yield cache_1.default.set("bestSellingProducts", JSON.stringify(rows), "EX", 60 * 60);
        return res.json(rows);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.bestProducts = bestProducts;
// Get product reviews
const getReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const client = yield connect_1.pool.connect();
    try {
        const { rows } = yield connect_1.pool.query("SELECT reviews.product_id, reviews.title, reviews.description, reviews.rating, reviews.created_at as date, users._id, users.fullname FROM reviews LEFT JOIN users on reviews.user_id = users._id WHERE reviews.product_id = $1", [id]);
        // console.log(rows)
        return res.json(rows);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.getReviews = getReviews;
// Add product review
const addReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let status;
    const { review } = req.body;
    const { title, rating, description } = review;
    const { id } = req.params;
    const { user } = req.query;
    const today = new Date();
    const date = `${today.getDate()}-${today.getMonth()}-${today.getFullYear()}`;
    if (!title || !description) {
        status = { error: true, message: "please fill in all fields!!!" };
        return res.json({ status });
    }
    const client = yield connect_1.pool.connect();
    try {
        const { rows } = yield connect_1.pool.query('INSERT INTO reviews (user_id, product_id, title, description, rating, created_at) VALUES ( $1, $2, $3, $4, $5, $6 ) RETURNING id', [user, id, title, description, rating, date]);
        const getReview = yield connect_1.pool.query("SELECT reviews.product_id, reviews.title, reviews.description, reviews.rating, reviews.created_at as date, users._id, users.fullname FROM reviews LEFT JOIN users on reviews.user_id = users._id WHERE reviews.id = $1", [rows[0].id]);
        status = { error: false, message: "successful!!!", review: getReview.rows[0] };
        return res.json({ status });
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.addReview = addReview;
// get searched product
