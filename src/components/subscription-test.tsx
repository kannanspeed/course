import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { hasActiveSubscription, getUserSubscriptionStatus } from "../utils/stripe";

interface SubscriptionTestProps {
  session: Session;
}

export const SubscriptionTest = ({ session }: SubscriptionTestProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testSubscription();
  }, [session]);

  const testSubscription = async () => {
    try {
      setLoading(true);
      console.log('Testing subscription for user:', session.user.id);
      
      // Test basic subscription check
      const hasSubscription = await hasActiveSubscription(session.user.id);
      console.log('Has subscription result:', hasSubscription);
      setIsSubscribed(hasSubscription);
      
      // Test detailed status
      const status = await getUserSubscriptionStatus(session.user.id);
      console.log('Detailed status result:', status);
      setSubscriptionStatus(status);
      
    } catch (error) {
      console.error('Subscription test error:', error);
      // Set default values to prevent infinite loading
      setIsSubscribed(false);
      setSubscriptionStatus({
        has_subscription: false,
        subscription_status: 'error',
        current_period_end: null
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        background: "#e9ecef", 
        border: "1px solid #dee2e6", 
        borderRadius: "4px", 
        padding: "1rem", 
        margin: "1rem 0" 
      }}>
        <h4>🧪 Subscription Test</h4>
        <p>Testing subscription functionality...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: "#e9ecef", 
      border: "1px solid #dee2e6", 
      borderRadius: "4px", 
      padding: "1rem", 
      margin: "1rem 0" 
    }}>
      <h4>🧪 Subscription Test Results</h4>
      <div style={{ marginBottom: "0.5rem" }}>
        <strong>Has Active Subscription:</strong> 
        <span style={{ 
          color: isSubscribed ? "#28a745" : "#dc3545",
          marginLeft: "0.5rem"
        }}>
          {isSubscribed ? "✅ Yes" : "❌ No"}
        </span>
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <strong>Subscription Status:</strong> 
        <span style={{ marginLeft: "0.5rem" }}>
          {subscriptionStatus?.subscription_status || "None"}
        </span>
      </div>
      {subscriptionStatus?.current_period_end && (
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>Period End:</strong> 
          <span style={{ marginLeft: "0.5rem" }}>
            {new Date(subscriptionStatus.current_period_end).toLocaleDateString()}
          </span>
        </div>
      )}
      <button 
        onClick={testSubscription}
        style={{
          padding: "0.5rem 1rem",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        🔄 Refresh Test
      </button>
    </div>
  );
};
