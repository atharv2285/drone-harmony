# Render Deployment Guide

## 🚀 Deploy to Render

This application is configured for automatic deployment on Render.com with the included `render.yaml` blueprint.

### Quick Start Deployment

1. **Sign up / Login to Render**
   - Go to [render.com](https://render.com)
   - Sign up or log in (can use GitHub)

2. **Connect Repository**
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub account if not already connected
   - Select the `atharv2285/drone-harmony` repository
   - Render will automatically detect `render.yaml`

3. **Deploy**
   - Click **"Apply"** to create the service
   - Render will automatically build using the Dockerfile
   - Wait for deployment to complete (~3-5 minutes)

4. **Get Your Public URL**
   - Once deployed, your app will be available at:
   - `https://drone-harmony.onrender.com` (or similar)
   - Find the URL in the service dashboard

### Manual Deployment (Alternative)

If you prefer manual setup:

1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect to `atharv2285/drone-harmony`
4. Configure:
   - **Name**: `drone-harmony`
   - **Runtime**: `Docker`
   - **Plan**: `Free`
   - **Dockerfile Path**: `./Dockerfile`
5. Add environment variable:
   - `NODE_ENV` = `production`
6. Click **"Create Web Service"**

### Configuration

The application uses the following settings:

- **Runtime**: Docker
- **Port**: Automatically assigned by Render via `$PORT` environment variable
- **Health Check**: `/` endpoint
- **Plan**: Free tier (can upgrade as needed)

### Environment Variables

Optional environment variables you can set in Render dashboard:

- `DRONE_IP` - IP address of your drone (default: empty)
- `DRONE_VIDEO_SOURCE` - Video source type (default: "test")
- `NODE_ENV` - Set to "production" (already configured in render.yaml)

### Post-Deployment

After successful deployment:

1. Click on the service URL to access your app
2. The drone video streaming interface will load
3. Configure drone IP in the app settings
4. Start streaming!

### Free Tier Limitations

Render free tier includes:
- ✅ Public URL with HTTPS
- ✅ Automatic deploys from GitHub
- ✅ 750 hours/month runtime
- ⚠️  Services spin down after 15 minutes of inactivity
- ⚠️  Cold starts take ~30 seconds

### Upgrade Options

For production use, consider upgrading to a paid plan for:
- No spin-down
- More resources
- Custom domains
- Better performance

### Troubleshooting

**Service won't start?**
- Check deployment logs in Render dashboard
- Verify Dockerfile builds locally: `docker build -t drone-harmony .`

**Can't access the URL?**
- Wait for deployment to complete (check status)
- Verify health check is passing
- Check if service spun down (free tier) - just visit URL to wake it

**Need help?**
- Check Render status: [status.render.com](https://status.render.com)
- View logs in Render dashboard
- Review build and deploy logs

---

## 📦 What Gets Deployed

- ✅ Client (React + Vite) - built and served statically
- ✅ Server (Express + WebSocket) - runs with tsx
- ✅ WebRTC signaling server
- ✅ Drone control proxy

## 🔄 Automatic Updates

With the render.yaml blueprint:
- Every push to `main` branch triggers automatic deployment
- Render rebuilds and redeploys automatically
- Zero downtime deployments

---

**Your app is now live at a public URL! 🎉**
