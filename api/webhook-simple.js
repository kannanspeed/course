// Simple webhook handler for testing
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

  try {
    // For now, just log the webhook event
    console.log('Webhook received:', req.body);
    
    // You can add your webhook processing logic here
    // For now, we'll just return success
    
    res.status(200).json({ received: true, message: 'Webhook received successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
}

