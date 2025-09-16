import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

    const { userEmail } = await req.json()

    console.log('Creating Stripe Payment Link for:', userEmail)

    // Create a payment link (this is more reliable than checkout sessions)
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: 'price_1S84aVB4gMZdPiFsRIaXTfV0', // Your Price ID
          quantity: 1,
        },
      ],
      metadata: {
        userEmail: userEmail,
      },
    })

    console.log('Stripe payment link created:', paymentLink.id)
    
    return new Response(
      JSON.stringify({ 
        id: paymentLink.id,
        url: paymentLink.url,
        message: 'Stripe payment link created successfully!' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating payment link:', error)
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
