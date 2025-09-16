import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../supabase-client';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_Xm1QHZwiPtb4ixVJu5lVxKFF00pck52XVi');

export interface SubscriptionStatus {
  has_subscription: boolean;
  subscription_status: string;
  current_period_end: string | null;
}

export interface Subscription {
  id: number;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get user's subscription status
 */
export const getUserSubscriptionStatus = async (userId: string): Promise<SubscriptionStatus | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_subscription_status', { user_uuid: userId })
      .single();
    
    if (error) {
      console.error('Error getting subscription status:', error);
      return null;
    }
    
    return data as SubscriptionStatus;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
};

/**
 * Check if user has active subscription
 */
export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('has_active_subscription', { user_uuid: userId });
    
    if (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};

/**
 * Create Stripe checkout session for subscription
 */
export const createCheckoutSession = async (priceId: string, userId: string, userEmail: string) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
      }),
    });

    const session = await response.json();
    
    if (session.error) {
      throw new Error(session.error);
    }

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Redirect to Stripe checkout
 */
export const redirectToCheckout = async (priceId: string, userId: string, userEmail: string) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const session = await createCheckoutSession(priceId, userId, userEmail);
    
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};

/**
 * Create customer portal session for subscription management
 */
export const createCustomerPortalSession = async (userId: string) => {
  try {
    const response = await fetch('/api/create-customer-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const session = await response.json();
    
    if (session.error) {
      throw new Error(session.error);
    }

    return session;
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
};

/**
 * Redirect to customer portal
 */
export const redirectToCustomerPortal = async (userId: string) => {
  try {
    const session = await createCustomerPortalSession(userId);
    window.location.href = session.url;
  } catch (error) {
    console.error('Error redirecting to customer portal:', error);
    throw error;
  }
};

/**
 * Get user's subscription details
 */
export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
};
