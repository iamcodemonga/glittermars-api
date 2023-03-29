"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const router = (0, express_1.Router)();
router.get('/:id', user_1.profile);
router.get('/orders/:userid', user_1.getOrders);
router.post('/order', user_1.placeOrder);
exports.default = router;
