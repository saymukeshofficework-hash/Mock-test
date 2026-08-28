import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TET Test Hub API is running' });
});

// Create Payment Link
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { userId, studentId, amount, testIds, receipt } = req.body;

    if (!userId || !studentId || !amount || !testIds || testIds.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: userId, studentId, amount, testIds',
      });
    }

    // Validate amount is in paise (minimum 1 rupee = 100 paise)
    if (amount < 100) {
      return res.status(400).json({
        error: 'Amount must be at least 100 paise (₹1)',
      });
    }

    // Create order record in database
    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        student_id: studentId,
        amount: amount,
        test_ids: testIds,
        receipt: receipt || `TET-${Date.now()}`,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        error: 'Failed to create order in database',
        details: dbError.message,
      });
    }

    // Create Razorpay order
    const razorpayOrderOptions = {
      amount: amount, // in paise
      currency: 'INR',
      receipt: receipt || `TET-${Date.now()}`,
      notes: {
        student_id: studentId,
        order_id: order.id,
        test_ids: testIds.join(','),
      },
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);

    // Update order with Razorpay order ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        razorpay_order_id: razorpayOrder.id,
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order with Razorpay ID:', updateError);
    }

    // Log payment event
    await supabase.from('payment_logs').insert({
      order_id: order.id,
      event_type: 'payment_created',
      razorpay_event_id: razorpayOrder.id,
      payload: razorpayOrder,
      status: 'created',
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: amount,
        currency: 'INR',
        key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Failed to create payment order',
      details: error.message,
    });
  }
});

// Verify Payment & Complete Transaction
app.post('/api/payments/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !order_id
    ) {
      return res.status(400).json({
        error: 'Missing required verification fields',
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValidSignature = expectedSignature === razorpay_signature;

    if (!isValidSignature) {
      // Log failed verification
      await supabase.from('payment_logs').insert({
        order_id: order_id,
        event_type: 'payment_failed',
        status: 'signature_mismatch',
        error_message: 'Razorpay signature verification failed',
      });

      return res.status(400).json({
        error: 'Payment verification failed: Invalid signature',
        success: false,
      });
    }

    // Get order details
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({
        error: 'Order not found',
        success: false,
      });
    }

    // Update order with payment details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return res.status(500).json({
        error: 'Failed to update order status',
        success: false,
      });
    }

    // Update user's purchased tests
    const { error: profileError } = await supabase
      .from('profiles')
      .select('purchased_tests')
      .eq('id', order.user_id)
      .single()
      .then(async (result) => {
        if (result.error) return result;

        const currentTests = result.data.purchased_tests || [];
        const newTests = [
          ...new Set([...currentTests, ...order.test_ids]),
        ];

        return supabase
          .from('profiles')
          .update({ purchased_tests: newTests })
          .eq('id', order.user_id);
      });

    // Log successful payment
    await supabase.from('payment_logs').insert({
      order_id: order_id,
      event_type: 'payment_captured',
      razorpay_event_id: razorpay_payment_id,
      payload: { razorpay_payment_id, razorpay_signature },
      status: 'captured',
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order_id: order_id,
      tests_purchased: order.test_ids,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      error: 'Payment verification failed',
      success: false,
      details: error.message,
    });
  }
});

// Razorpay Webhook Handler
app.post('/api/webhooks/razorpay', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const eventType = event.event;

    // Log webhook event
    if (event.payload?.payment?.entity?.notes?.order_id) {
      const orderId = event.payload.payment.entity.notes.order_id;
      await supabase.from('payment_logs').insert({
        order_id: orderId,
        event_type: 'webhook_received',
        razorpay_event_id: event.id,
        payload: event,
        status: eventType,
      });
    }

    // Handle different webhook events
    switch (eventType) {
      case 'payment.authorized':
      case 'payment.captured':
        // Payment successful
        if (event.payload?.payment?.entity?.notes?.order_id) {
          const orderId = event.payload.payment.entity.notes.order_id;
          const paymentId = event.payload.payment.entity.id;

          // Update order status
          await supabase
            .from('orders')
            .update({
              razorpay_payment_id: paymentId,
              status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);
        }
        break;

      case 'payment.failed':
        if (event.payload?.payment?.entity?.notes?.order_id) {
          const orderId = event.payload.payment.entity.notes.order_id;
          await supabase
            .from('orders')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);
        }
        break;

      case 'refund.created':
        // Handle refunds if needed
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get Order Status
app.get('/api/payments/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        test_ids: order.test_ids,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      error: 'Failed to fetch order',
      details: error.message,
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `🚀 TET Test Hub API server running on http://localhost:${PORT}`
  );
  console.log(
    `📝 Health check: http://localhost:${PORT}/health`
  );
});
