import { useState } from "react";
import { Session } from "@supabase/supabase-js";

interface SimpleSubscriptionProps {
  session: Session;
}

export const SimpleSubscription = ({ session: _session }: SimpleSubscriptionProps) => {
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      
      // Call the deployed API endpoint
      const response = await fetch('/api/checkout-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'prod_T3qkxmpNE6worE',
          userId: _session.user.id,
          userEmail: _session.user.email,
        }),
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Redirect to Stripe checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        alert(`Checkout session created: ${result.id}\n\nRedirecting to Stripe checkout...`);
      }
      
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

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
          <strong>Note:</strong> This is a demo. The actual Stripe integration will be implemented once the database functions are working properly.
        </div>
      </div>
    </div>
  );
};
