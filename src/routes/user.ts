import { Router } from 'express';
import { profile, getOrders, placeOrder } from '../controllers/user';

const router = Router();
router.get('/:id', profile);
router.get('/orders/:userid', getOrders);
router.post('/order', placeOrder);

export default router