import express,{ Router } from 'express';
import { addStripeOrder, payWithStripe } from '../controllers/payment';

const router = Router()

router.post("/stripe/create-checkout-session", payWithStripe)
router.post('/stripe/webhook', express.raw({type: 'application/json'}), addStripeOrder)

export default router