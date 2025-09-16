# Stripe Subscription Integration Setup Guide

## 🚀 Complete Setup Instructions

### Step 1: Database Setup (Supabase)

1. **Go to your Supabase dashboard**
2. **Open SQL Editor**
3. **Run the subscription setup SQL:**

```sql
-- Copy and paste the entire content from stripe-subscription-setup.sql
-- This creates the necessary tables and functions for subscription management
```

### Step 2: Stripe Dashboard Setup

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com)**
2. **Create a Product:**
   - Go to Products → Add Product
   - Name: "Premium Subscription"
   - Description: "Unlimited tasks and premium features"
   - Pricing: $9.99/month (recurring)

3. **Get the Price ID:**
   - After creating the product, copy the Price ID (starts with `price_`)
   - Update the `PRICE_ID` in `src/components/subscription.tsx`

4. **Set up Webhooks:**
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret

### Step 3: Environment Variables

1. **Create `.env` file in your project root:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_Xm1QHZwiPtb4ixVJu5lVxKFF00pck52XVi

# For API endpoints (server-side only)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Step 4: Deploy API Endpoints

The API endpoints need to be deployed as serverless functions. Choose one:

#### Option A: Vercel (Recommended)
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**

#### Option B: Netlify Functions
1. **Create `netlify.toml`:**
   ```toml
   [build]
     functions = "api"
   ```

2. **Deploy to Netlify**

#### Option C: Supabase Edge Functions
1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Create edge functions:**
   ```bash
   supabase functions new create-checkout-session
   supabase functions new create-customer-portal-session
   supabase functions new webhook
   ```

### Step 5: Update Price ID

1. **Open `src/components/subscription.tsx`**
2. **Replace the PRICE_ID:**
   ```typescript
   const PRICE_ID = "price_your_actual_price_id_here";
   ```

### Step 6: Test the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the flow:**
   - Sign up/login with a test user
   - Click "Subscribe Now"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete the subscription
   - Verify the user sees "Welcome to Premium!"

### Step 7: Stripe CLI Testing (Optional)

1. **Install Stripe CLI:**
   ```bash
   # Windows
   winget install stripe.stripe-cli
   
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   snap install stripe
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost:**
   ```bash
   stripe listen --forward-to localhost:4242/webhook
   ```

4. **Test events:**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

## 🎯 Features Implemented

### ✅ Subscription Management
- **Subscribe**: Users can subscribe to premium features
- **Manage**: Users can manage their subscription via Stripe customer portal
- **Status Check**: Real-time subscription status checking
- **Banner**: Shows subscription status in header

### ✅ Database Integration
- **Subscriptions Table**: Stores subscription data
- **Features Table**: Manages feature access
- **RLS Policies**: Secure data access
- **Helper Functions**: Easy subscription checking

### ✅ UI Components
- **Subscription Banner**: Shows at top of app
- **Subscription Panel**: Main subscription management
- **Premium Indicators**: Shows when user has premium access

### ✅ Security
- **Row Level Security**: Users can only see their own data
- **Admin Access**: Admins can see all subscriptions
- **Webhook Verification**: Secure webhook handling

## 🔧 Customization Options

### Change Pricing
1. **Update Stripe product price**
2. **Update PRICE_ID in subscription component**
3. **Update display text**

### Add More Features
1. **Add new feature names to database**
2. **Update subscription features logic**
3. **Add feature checks in components**

### Customize UI
1. **Modify subscription component styles**
2. **Update banner colors and text**
3. **Add more premium features list**

## 🚨 Important Notes

1. **Test Mode**: Currently using Stripe test keys
2. **Webhook URL**: Must be publicly accessible
3. **Price ID**: Must match your Stripe product
4. **Environment Variables**: Keep secret keys secure
5. **Database**: Run the SQL setup first

## 🆘 Troubleshooting

### Common Issues:
1. **"Price not found"**: Check PRICE_ID is correct
2. **"Webhook failed"**: Verify webhook URL and secret
3. **"Subscription not updating"**: Check database policies
4. **"API errors"**: Verify environment variables

### Debug Steps:
1. Check browser console for errors
2. Verify Stripe dashboard for events
3. Check Supabase logs for database errors
4. Test with Stripe CLI webhook forwarding

## 🎉 Success!

Once everything is set up, users will see:
- **Non-subscribers**: "Upgrade to Premium" banner and subscription panel
- **Subscribers**: "Premium Member" banner and "Welcome to Premium!" message
- **Admin users**: Can see all user subscriptions

The integration is now complete and ready for production! 🚀

