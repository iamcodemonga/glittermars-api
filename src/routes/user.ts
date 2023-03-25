import { Router } from 'express';
import { profile, getOrders, placeOrder } from '../controllers/user';
import { isActive } from '../middleware/user';

const router = Router();

router.get('/', isActive, profile);
router.get('/orders', isActive, getOrders);
router.post('/order', isActive, placeOrder);

export default router