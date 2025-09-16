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

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('No stripe signature found')
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('No webhook secret found')
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Received webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        
        // Update user subscription status to active
        if (session.metadata?.userEmail) {
          await supabaseClient.rpc('update_user_subscription', {
            user_email: session.metadata.userEmail,
            status: 'active',
            stripe_customer_id: session.customer as string,
            start_date: new Date().toISOString()
          })
          console.log('Updated user subscription to active:', session.metadata.userEmail)
        }
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription created:', subscription.id)
        
        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
        
        if (customer.email) {
          await supabaseClient.rpc('update_user_subscription', {
            user_email: customer.email,
            status: 'active',
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            end_date: new Date(subscription.current_period_end * 1000).toISOString()
          })
          console.log('Updated user subscription details:', customer.email)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', subscription.id)
        
        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
        
        if (customer.email) {
          let status = 'active'
          if (subscription.status === 'canceled') {
            status = 'canceled'
          } else if (subscription.status === 'past_due') {
            status = 'past_due'
          }

          await supabaseClient.rpc('update_user_subscription', {
            user_email: customer.email,
            status: status,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            end_date: new Date(subscription.current_period_end * 1000).toISOString()
          })
          console.log('Updated user subscription status:', customer.email, status)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Subscription deleted:', subscription.id)
        
        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
        
        if (customer.email) {
          await supabaseClient.rpc('update_user_subscription', {
            user_email: customer.email,
            status: 'canceled',
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id
          })
          console.log('Updated user subscription to canceled:', customer.email)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice payment succeeded:', invoice.id)
        
        if (invoice.subscription) {
          // Get customer email from Stripe
          const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer
          
          if (customer.email) {
            await supabaseClient.rpc('update_user_subscription', {
              user_email: customer.email,
              status: 'active',
              stripe_customer_id: invoice.customer as string,
              stripe_subscription_id: invoice.subscription as string
            })
            console.log('Updated user subscription to active after payment:', customer.email)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice payment failed:', invoice.id)
        
        if (invoice.subscription) {
          // Get customer email from Stripe
          const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer
          
          if (customer.email) {
            await supabaseClient.rpc('update_user_subscription', {
              user_email: customer.email,
              status: 'past_due',
              stripe_customer_id: invoice.customer as string,
              stripe_subscription_id: invoice.subscription as string
            })
            console.log('Updated user subscription to past_due after failed payment:', customer.email)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
