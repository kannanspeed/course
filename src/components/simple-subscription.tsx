import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase-client";

interface SimpleSubscriptionProps {
  session: Session;
}

interface SubscriptionStatus {
  subscription_status: string;
  is_subscribed: boolean;
  stripe_customer_id?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
}

export const SimpleSubscription = ({ session }: SimpleSubscriptionProps) => {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Get subscription status
  const getSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-subscription-status');
      
      if (error) {
        console.error('Error getting subscription status:', error);
        setSubscriptionStatus({
          subscription_status: 'free',
          is_subscribed: false
        });
      } else {
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Error getting subscription status:', error);
      setSubscriptionStatus({
        subscription_status: 'free',
        is_subscribed: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSubscriptionStatus();
  }, []);

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId: 'prod_T3qkxmpNE6worE', // Your actual Stripe Product ID
          userId: session.user.id,
          userEmail: session.user.email,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(`Checkout session created: ${data.id}\n\nRedirecting to Stripe checkout...`);
      }
      
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        background: "#f8f9fa", 
        border: "1px solid #dee2e6", 
        borderRadius: "8px", 
        padding: "1.5rem", 
        margin: "1rem 0",
        textAlign: "center"
      }}>
        <p>Loading subscription status...</p>
      </div>
    );
  }

  // If user is subscribed, show success message
  if (subscriptionStatus?.is_subscribed) {
    return (
      <div style={{ 
        background: "#d4edda", 
        border: "1px solid #c3e6cb", 
        borderRadius: "8px", 
        padding: "1.5rem", 
        margin: "1rem 0"
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ 
            fontSize: "1.5rem", 
            marginRight: "0.5rem" 
          }}>
            ✅
          </div>
          <h3 style={{ 
            margin: 0, 
            color: "#155724" 
          }}>
            Welcome to Premium!
          </h3>
        </div>
        <p style={{ 
          margin: "0 0 1rem 0", 
          color: "#155724",
          fontSize: "1.1rem"
        }}>
          You have an active subscription. Enjoy all premium features!
        </p>
        <div style={{ 
          background: "#c3e6cb",
          padding: "0.5rem",
          borderRadius: "4px",
          fontSize: "0.9rem",
          color: "#155724"
        }}>
          <strong>Status:</strong> {subscriptionStatus.subscription_status}
          {subscriptionStatus.subscription_end_date && (
            <><br /><strong>Renews:</strong> {new Date(subscriptionStatus.subscription_end_date).toLocaleDateString()}</>
          )}
        </div>
      </div>
    );
  }

  // If user is not subscribed, show subscription options
  return (
    <div style={{ 
      background: "#fff3cd", 
      border: "1px solid #ffeaa7", 
      borderRadius: "8px", 
      padding: "1.5rem", 
      margin: "1rem 0"
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ 
          fontSize: "1.5rem", 
          marginRight: "0.5rem" 
        }}>
          💎
        </div>
        <h3 style={{ 
          margin: 0, 
          color: "#856404" 
        }}>
          Upgrade to Premium
        </h3>
      </div>

      <div>
        <p style={{ 
          margin: "0 0 1rem 0", 
          color: "#856404",
          fontSize: "1.1rem"
        }}>
          Unlock premium features with a subscription:
        </p>
        <ul style={{ 
          margin: "0 0 1rem 0", 
          paddingLeft: "1.5rem",
          color: "#856404"
        }}>
          <li>✨ Unlimited tasks</li>
          <li>🚀 Priority support</li>
          <li>📊 Advanced analytics</li>
          <li>🎨 Premium themes</li>
          <li>📱 Mobile app access</li>
        </ul>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={handleSubscribe}
            disabled={isSubscribing}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isSubscribing ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "500"
            }}
          >
            {isSubscribing ? "Processing..." : "Subscribe Now - $9.99/month"}
          </button>
          <span style={{ 
            color: "#856404",
            fontSize: "0.9rem"
          }}>
            Cancel anytime
          </span>
        </div>
        <div style={{ 
          marginTop: "1rem",
          padding: "0.5rem",
          background: "#f8f9fa",
          borderRadius: "4px",
          fontSize: "0.8rem",
          color: "#6c757d"
        }}>
          <strong>Current Status:</strong> {subscriptionStatus?.subscription_status || 'free'}
        </div>
      </div>
    </div>
  );
};
