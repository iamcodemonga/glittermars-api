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
exports.logout = exports.login = exports.register = void 0;
const crypto_1 = __importDefault(require("crypto"));
const connect_1 = require("../connect");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let status;
    let { fullname, email, password } = req.body;
    // check for email existence in the database
    const client = yield connect_1.pool.connect();
    try {
        let existingEmail = yield connect_1.pool.query(`SELECT email FROM users WHERE email=$1`, [email]);
        if (existingEmail.rowCount > 0) {
            status = { error: true, message: "Email already exists!!" };
            return res.json(status);
        }
        // hash the password
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        const hashedId = crypto_1.default.randomUUID();
        // query the database
        const client = yield connect_1.pool.connect();
        try {
            //add user to database
            const user = yield connect_1.pool.query('INSERT INTO users (_id, fullname, email, password) VALUES ($1, $2, $3, $4) RETURNING *', [hashedId, fullname, email, hashedPassword]);
            // send response
            status = { error: false, message: `Hi ${user.rows[0].fullname},You're welcome!!`, user: user.rows[0] };
            return res.json(status);
        }
        catch (error) {
            console.log(error);
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let status;
    let { email, password } = req.body;
    // check if email exists
    const client = yield connect_1.pool.connect();
    try {
        let existingEmail = yield connect_1.pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
        if (existingEmail.rowCount < 1) {
            status = { error: true, message: "Email or Password is incorrect!!!" };
            return res.json(status);
        }
        // compare the password
        if (!(yield bcrypt_1.default.compare(password, existingEmail.rows[0].password))) {
            status = { error: true, message: "Email or Password is incorrect!!!" };
            return res.json(status);
        }
        // send response
        status = {
            error: false,
            message: `Hi ${existingEmail.rows[0].fullname},You're welcome!!`,
            user: [{ _id: existingEmail.rows[0]._id, fullname: existingEmail.rows[0].fullname, email: existingEmail.rows[0].email }]
        };
        return res.json(status);
    }
    catch (error) {
        console.log(error);
    }
    finally {
        client.release();
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('glittermars');
    return res.json({ status: 200, message: 'bye bye' });
});
exports.logout = logout;
