"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const url = String(process.env.REDIS_URL);
const redis = new ioredis_1.Redis(url);
exports.default = redis;
