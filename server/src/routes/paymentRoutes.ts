import express from 'express';
import { createCheckoutSession, handleWebhook } from '../controllers/paymentController';

const router = express.Router();

router.post('/create-checkout-session', express.json(), createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
