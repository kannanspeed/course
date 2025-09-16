import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { priceId, userId, userEmail } = await req.json()

    if (!priceId || !userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Creating Stripe checkout session:', { priceId, userId, userEmail })

    // Check if priceId is a product ID or price ID
    let lineItem
    if (priceId.startsWith('price_')) {
      // It's a price ID
      lineItem = {
        price: priceId,
        quantity: 1,
      }
    } else if (priceId.startsWith('prod_')) {
      // It's a product ID - we need to get the price
      const product = await stripe.products.retrieve(priceId)
      const prices = await stripe.prices.list({
        product: priceId,
        active: true,
        limit: 1,
      })
      
      if (prices.data.length === 0) {
        throw new Error(`No active prices found for product ${priceId}`)
      }
      
      lineItem = {
        price: prices.data[0].id,
        quantity: 1,
      }
    } else {
      throw new Error(`Invalid price/product ID: ${priceId}`)
    }

    // Create or retrieve customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      })
    }

    // Create checkout session with proper URLs and CSP-friendly settings
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: 'subscription',
      success_url: `https://qodpovituewhzjmtvghh.supabase.co/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://qodpovituewhzjmtvghh.supabase.co/?canceled=true`,
      billing_address_collection: 'auto',
      allow_promotion_codes: false,
      metadata: {
        userId: userId,
        userEmail: userEmail,
      },
      // Add CSP-friendly settings
      ui_mode: 'hosted',
      automatic_tax: { enabled: false },
    })

    console.log('Stripe checkout session created:', session.id)
    
    return new Response(
      JSON.stringify({ 
        id: session.id,
        url: session.url,
        message: 'Stripe checkout session created successfully!' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.type || 'unknown',
        code: error.code || 'unknown'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
