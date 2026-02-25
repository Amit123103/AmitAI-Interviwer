import { Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User';

const stripeKey = process.env.STRIPE_SECRET_KEY || '';
if (!stripeKey) {
    console.warn('WARNING: STRIPE_SECRET_KEY is missing. Payment features will be disabled.');
}

const stripe = stripeKey ? new Stripe(stripeKey, {
    apiVersion: '2026-01-28.clover',
}) : null;

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        if (!stripe) {
            return res.status(503).json({ error: 'Payment service is currently unavailable (Missing API Key)' });
        }
        const { userId, priceId } = req.body; // priceId comes from frontend (Pro Plan)

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
            line_items: [
                {
                    price: priceId || 'price_H5ggYJDqqy8b4b', // Default dummy test price
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${CLIENT_URL}/dashboard?success=true`,
            cancel_url: `${CLIENT_URL}/pricing?canceled=true`,
            metadata: {
                userId: user._id.toString()
            }
        });

        res.json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Webhook to handle fulfillment
export const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!sig || !endpointSecret || !stripe) throw new Error('Missing signature, secret or stripe instance');
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle string event type from recent Stripe versions
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;

            if (userId) {
                await User.findByIdAndUpdate(userId, {
                    subscriptionStatus: 'pro',
                    stripeCustomerId: session.customer as string,
                    subscriptionId: session.subscription as string
                });
                console.log(`User ${userId} upgraded to PRO`);

                // Broadcast payment event
                if ((global as any).broadcastAdminEvent) {
                    (global as any).broadcastAdminEvent('payment:success', {
                        userId,
                        amount: session.amount_total ? session.amount_total / 100 : 0,
                        id: session.id
                    });
                }
            }
            break;
        case 'customer.subscription.deleted':
            // Handle cancellation
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
};
