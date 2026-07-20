import Stripe from 'stripe';
import { asyncHandler } from '../../utils/asyncHandler.js';
import Order from '../../models/order.model.js';
import Auction from '../../models/auction.model.js';
import User from '../../models/user.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export const createCheckoutSession = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('auction');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ success: false, message: 'Order is not pending' });

    // Fallback: If Stripe is not configured, redirect to sandbox checkout page!
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder');
    if (!isStripeConfigured) {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        return res.status(200).json({ 
            success: true, 
            url: `${clientUrl}/order/sandbox-checkout?orderId=${order._id}`,
            isSandbox: true 
        });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: order.auction.title,
                    },
                    unit_amount: Math.round(order.amount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/order/cancel`,
            client_reference_id: order._id.toString(),
        });

        res.status(200).json({ success: true, url: session.url });
    } catch (err) {
        console.warn('Stripe checkout creation failed, falling back to sandbox:', err.message);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.status(200).json({ 
            success: true, 
            url: `${clientUrl}/order/sandbox-checkout?orderId=${order._id}`,
            isSandbox: true 
        });
    }
});

export const handleStripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const referenceParts = session.client_reference_id ? session.client_reference_id.split(':') : [];

        if (referenceParts[0] === 'deposit') {
            // It's a wallet deposit
            const userId = referenceParts[1];
            await User.findByIdAndUpdate(userId, {
                $inc: { walletBalance: session.amount_total / 100 }
            });
            console.log(`Wallet deposit of $${session.amount_total / 100} confirmed for User ${userId}`);
        } else {
            // It's an order payment
            const orderId = session.client_reference_id;
            if (orderId) {
                const order = await Order.findById(orderId);
                if (order && order.status === 'pending') {
                    const platformFeeRate = 0.05; // 5%
                    const amount = order.amount;
                    const platformFee = amount * platformFeeRate;
                    const sellerPayout = amount - platformFee;

                    await Order.findByIdAndUpdate(orderId, {
                        status: 'paid',
                        paymentDate: new Date(),
                        platformFee,
                        sellerPayout
                    });

                    // Credit seller's wallet balance
                    await User.findByIdAndUpdate(order.seller, {
                        $inc: { walletBalance: sellerPayout }
                    });

                    console.log(`Payment confirmed for Order ${orderId}. Credited $${sellerPayout} to Seller ${order.seller}`);
                }
            }
        }
    }

    res.json({ received: true });
});

export const sandboxSuccess = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.status === 'pending') {
        const platformFeeRate = 0.05; // 5%
        const amount = order.amount;
        const platformFee = amount * platformFeeRate;
        const sellerPayout = amount - platformFee;

        // Mark order as paid
        order.status = 'paid';
        order.paymentDate = new Date();
        order.platformFee = platformFee;
        order.sellerPayout = sellerPayout;
        await order.save();

        // Credit seller's wallet balance
        await User.findByIdAndUpdate(order.seller, {
            $inc: { walletBalance: sellerPayout }
        });

        console.log(`[Sandbox] Payment success: Order ${orderId} marked paid. Payout of $${sellerPayout} credited to Seller ${order.seller}`);
    }

    res.status(200).json({ success: true, message: 'Sandbox payment processed successfully' });
});
