# 🚀 Deployment Guide

Your Task Manager app has been successfully pushed to GitHub! Here's how to deploy it:

## ✅ What's Already Done

- ✅ **Code pushed to GitHub**: [https://github.com/kannanspeed/course](https://github.com/kannanspeed/course)
- ✅ **GitHub Actions workflow** created for automatic deployment
- ✅ **README.md** with complete documentation
- ✅ **Environment setup** ready

## 🚀 Deploy to GitHub Pages

### Step 1: Enable GitHub Pages

1. **Go to your repository**: [https://github.com/kannanspeed/course](https://github.com/kannanspeed/course)
2. **Click on "Settings"** tab
3. **Scroll down to "Pages"** section
4. **Under "Source"**, select **"GitHub Actions"**
5. **Save the settings**

### Step 2: Add Environment Variables

1. **Go to repository Settings**
2. **Click on "Secrets and variables"** → **"Actions"**
3. **Click "New repository secret"**
4. **Add these secrets**:

   ```
   Name: VITE_SUPABASE_URL
   Value: https://qodpovituewhzjmtvghh.supabase.co
   
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZHBvdml0dWV3aHpqbXR2Z2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Nzg1MzQsImV4cCI6MjA3MzM1NDUzNH0.3bXYgN4WUgLWGq6KPST_gWxKxPdpK46RyrxGu_cEUF4
   ```

### Step 3: Trigger Deployment

1. **Make a small change** to any file (like README.md)
2. **Commit and push** the change:
   ```bash
   git add .
   git commit -m "Trigger deployment"
   git push
   ```
3. **Go to "Actions" tab** in your repository
4. **Watch the deployment** process

### Step 4: Access Your Live App

Once deployment is complete, your app will be available at:
**https://kannanspeed.github.io/course**

## 🔧 Alternative Deployment Options

### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Add environment variables** in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Deploy to Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Drag and drop** the `dist` folder to [Netlify](https://netlify.com)

3. **Add environment variables** in Netlify dashboard

## 📱 Your App Features

Once deployed, your app will have:

- ✅ **Real-time task management**
- ✅ **User authentication**
- ✅ **Image uploads**
- ✅ **Responsive design**
- ✅ **User-specific tasks**
- ✅ **Instant updates**

## 🎯 Next Steps

1. **Deploy to GitHub Pages** (recommended)
2. **Share your live app** with others
3. **Add more features** as needed
4. **Customize the design** to your liking

## 📞 Support

If you need help with deployment, check the GitHub Actions logs or open an issue in your repository.

---

**Your repository**: [https://github.com/kannanspeed/course](https://github.com/kannanspeed/course)
**Live app**: [https://kannanspeed.github.io/course](https://kannanspeed.github.io/course) (after deployment)
