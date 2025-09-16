import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { hasActiveSubscription } from "../utils/stripe";

interface SubscriptionBannerProps {
  session: Session;
}

export const SubscriptionBanner = ({ session }: SubscriptionBannerProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, [session]);

  const checkSubscription = async () => {
    try {
      const hasSubscription = await hasActiveSubscription(session.user.id);
      setIsSubscribed(hasSubscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (isSubscribed) {
    return (
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "0.75rem 1rem",
        textAlign: "center",
        fontSize: "0.9rem",
        fontWeight: "500",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        🎉 <strong>Premium Member</strong> - Enjoy unlimited tasks and premium features!
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      color: "white",
      padding: "0.75rem 1rem",
      textAlign: "center",
      fontSize: "0.9rem",
      fontWeight: "500",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      💎 <strong>Upgrade to Premium</strong> - Get unlimited tasks, priority support, and more! 
      <a 
        href="#subscription" 
        style={{ 
          color: "white", 
          textDecoration: "underline", 
          marginLeft: "0.5rem",
          fontWeight: "600"
        }}
      >
        Learn More
      </a>
    </div>
  );
};

