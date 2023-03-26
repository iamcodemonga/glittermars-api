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
exports.isActive = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connect_1 = require("../connect");
const cache_1 = __importDefault(require("../cache"));
const isActive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.cookies.glittermars) {
        const { id } = jsonwebtoken_1.default.verify(String(req.cookies.glittermars), String(process.env.JWTSECRET));
        const client = yield connect_1.pool.connect();
        try {
            const cachedUser = yield cache_1.default.get(id);
            if (cachedUser) {
                res.locals.user = JSON.parse(cachedUser);
                next();
            }
            else {
                const { rows } = yield connect_1.pool.query('SELECT _id, fullname, email FROM users WHERE _id=$1', [id]);
                yield cache_1.default.set(id, JSON.stringify(rows[0]), "EX", 60 * 5);
                res.locals.user = rows[0];
                next();
            }
        }
        catch (error) {
            console.log(error);
        }
        finally {
            client.release();
        }
    }
    else {
        res.locals.user = null;
        next();
    }
});
exports.isActive = isActive;
