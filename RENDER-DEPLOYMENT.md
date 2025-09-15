# 🚀 Deploy to Render

Deploy your Task Manager app to Render for free with automatic deployments from GitHub.

## ✅ What's Ready

- ✅ **render.yaml** configuration file created
- ✅ **Environment variables** configured
- ✅ **Build settings** optimized for Render
- ✅ **Static site** configuration ready

## 🚀 Step-by-Step Deployment

### Step 1: Create Render Account

1. **Go to**: [https://render.com](https://render.com)
2. **Sign up** with your GitHub account
3. **Connect your GitHub** account if not already connected

### Step 2: Deploy from GitHub

1. **Go to Render Dashboard**
2. **Click "New +"** button
3. **Select "Static Site"**
4. **Connect your repository**:
   - **Repository**: `kannanspeed/course`
   - **Branch**: `main`
   - **Root Directory**: Leave empty (default)

### Step 3: Configure Build Settings

1. **Build Command**: `npm install && npm run build`
2. **Publish Directory**: `dist`
3. **Node Version**: `18` (or latest)

### Step 4: Environment Variables

The environment variables are already configured in `render.yaml`, but you can also add them manually:

1. **Go to Environment tab**
2. **Add these variables**:
   ```
   VITE_SUPABASE_URL = https://qodpovituewhzjmtvghh.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZHBvdml0dWV3aHpqbXR2Z2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Nzg1MzQsImV4cCI6MjA3MzM1NDUzNH0.3bXYgN4WUgLWGq6KPST_gWxKxPdpK46RyrxGu_cEUF4
   ```

### Step 5: Deploy

1. **Click "Create Static Site"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Your app will be live** at a Render URL like: `https://task-manager-app.onrender.com`

## 🔧 Advanced Configuration

### Custom Domain (Optional)

1. **Go to your service settings**
2. **Click "Custom Domains"**
3. **Add your domain** (if you have one)
4. **Follow DNS instructions**

### Automatic Deployments

- ✅ **Auto-deploy** is enabled by default
- ✅ **Every push to main** triggers a new deployment
- ✅ **Preview deployments** for pull requests

## 📱 Your App Features

Once deployed on Render, your app will have:

- ✅ **Real-time task management**
- ✅ **User authentication**
- ✅ **Image uploads**
- ✅ **Responsive design**
- ✅ **User-specific tasks**
- ✅ **Instant updates**
- ✅ **HTTPS enabled**
- ✅ **Global CDN**

## 🎯 Render Benefits

- ✅ **Free tier** available
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Zero-downtime deployments**
- ✅ **GitHub integration**
- ✅ **Custom domains**
- ✅ **Environment variables**
- ✅ **Build logs**

## 🔍 Monitoring

1. **Go to your service dashboard**
2. **View build logs** for debugging
3. **Monitor performance** metrics
4. **Check deployment history**

## 🚀 Quick Deploy URL

**Direct deploy link**: [https://render.com/deploy](https://render.com/deploy)

1. **Click the link above**
2. **Select "Static Site"**
3. **Connect your GitHub repo**: `kannanspeed/course`
4. **Use the settings from render.yaml**
5. **Deploy!**

## 📞 Support

- **Render Documentation**: [https://render.com/docs](https://render.com/docs)
- **Render Community**: [https://community.render.com](https://community.render.com)

---

**Your repository**: [https://github.com/kannanspeed/course](https://github.com/kannanspeed/course)
**Render Dashboard**: [https://dashboard.render.com](https://dashboard.render.com)
