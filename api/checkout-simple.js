// Real Stripe checkout session creator
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, userEmail } = req.body;

    if (!priceId || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('Creating Stripe checkout session:', { priceId, userId, userEmail });

    // Create or retrieve Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });
    }

    // Check if priceId is a product ID or price ID
    let lineItem;
    if (priceId.startsWith('price_')) {
      // It's a price ID
      lineItem = {
        price: priceId,
        quantity: 1,
      };
    } else if (priceId.startsWith('prod_')) {
      // It's a product ID - we need to get the price
      const product = await stripe.products.retrieve(priceId);
      const prices = await stripe.prices.list({
        product: priceId,
        active: true,
        limit: 1,
      });
      
      if (prices.data.length === 0) {
        throw new Error(`No active prices found for product ${priceId}`);
      }
      
      lineItem = {
        price: prices.data[0].id,
        quantity: 1,
      };
    } else {
      throw new Error(`Invalid price/product ID: ${priceId}`);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: 'subscription',
      success_url: `${req.headers.origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
      metadata: {
        userId: userId,
      },
    });

    console.log('Stripe checkout session created:', session.id);
    
    res.status(200).json({ 
      id: session.id,
      url: session.url,
      message: 'Stripe checkout session created successfully!' 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param
    });
    
    res.status(500).json({ 
      error: error.message,
      type: error.type || 'unknown',
      code: error.code || 'unknown'
    });
  }
}
