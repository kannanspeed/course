import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { 
  getUserSubscriptionStatus, 
  redirectToCheckout, 
  redirectToCustomerPortal,
  SubscriptionStatus 
} from "../utils/stripe";

interface SubscriptionProps {
  session: Session;
}

export const Subscription = ({ session }: SubscriptionProps) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  // Your actual Stripe Price ID
  const PRICE_ID = "prod_T3qkxmpNE6worE";

  useEffect(() => {
    checkSubscriptionStatus();
  }, [session]);

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      console.log('Checking subscription status for user:', session.user.id);
      const status = await getUserSubscriptionStatus(session.user.id);
      console.log('Subscription status result:', status);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // Set default status to prevent infinite loading
      setSubscriptionStatus({
        has_subscription: false,
        subscription_status: 'none',
        current_period_end: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      await redirectToCheckout(PRICE_ID, session.user.id, session.user.email || '');
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsManaging(true);
      await redirectToCustomerPortal(session.user.id);
    } catch (error) {
      console.error('Error managing subscription:', error);
      alert('Failed to open subscription management. Please try again.');
    } finally {
      setIsManaging(false);
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

  const isSubscribed = subscriptionStatus?.has_subscription && subscriptionStatus?.subscription_status === 'active';

  return (
    <div style={{ 
      background: isSubscribed ? "#d4edda" : "#fff3cd", 
      border: `1px solid ${isSubscribed ? "#c3e6cb" : "#ffeaa7"}`, 
      borderRadius: "8px", 
      padding: "1.5rem", 
      margin: "1rem 0"
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ 
          fontSize: "1.5rem", 
          marginRight: "0.5rem" 
        }}>
          {isSubscribed ? "🎉" : "💎"}
        </div>
        <h3 style={{ 
          margin: 0, 
          color: isSubscribed ? "#155724" : "#856404" 
        }}>
          {isSubscribed ? "Welcome to Premium!" : "Upgrade to Premium"}
        </h3>
      </div>

      {isSubscribed ? (
        <div>
          <p style={{ 
            margin: "0 0 1rem 0", 
            color: "#155724",
            fontSize: "1.1rem"
          }}>
            🎉 <strong>You have an active premium subscription!</strong>
          </p>
          <p style={{ 
            margin: "0 0 1rem 0", 
            color: "#155724" 
          }}>
            Enjoy unlimited tasks, priority support, and all premium features.
          </p>
          {subscriptionStatus?.current_period_end && (
            <p style={{ 
              margin: "0 0 1rem 0", 
              color: "#155724",
              fontSize: "0.9rem"
            }}>
              Next billing date: {new Date(subscriptionStatus.current_period_end).toLocaleDateString()}
            </p>
          )}
          <button
            onClick={handleManageSubscription}
            disabled={isManaging}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isManaging ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "500"
            }}
          >
            {isManaging ? "Opening..." : "Manage Subscription"}
          </button>
        </div>
      ) : (
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
        </div>
      )}
    </div>
  );
};
