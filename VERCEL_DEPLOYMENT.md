# Vercel Deployment Guide for Drone Harmony

This guide will help you deploy the Drone Harmony application to Vercel.

## ⚠️ Important Limitations

Vercel is optimized for serverless functions and static sites. This drone application has some limitations when deployed on Vercel:

| Feature | Status | Notes |
|---------|--------|-------|
| **Video Streaming** | ⚠️ Limited | Serverless functions have 60s max timeout (Pro plan) |
| **WebSocket Control** | ❌ Not Supported | Vercel doesn't support persistent WebSockets in serverless |
| **FFmpeg Processing** | ⚠️ Challenging | Cold starts and execution time limits may cause issues |
| **Static UI** | ✅ Fully Supported | React frontend works perfectly |

### Recommended Alternatives for Full Functionality:
- **Railway**, **Render**, or **Fly.io** for long-running Node.js servers
- **AWS EC2** or **DigitalOcean** for full control
- **Hybrid approach**: Vercel for UI + separate server for streaming/WebSocket

---

## Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- Vercel CLI (optional): `npm i -g vercel`
- GitHub repository with your code

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your `drone-harmony` repository from GitHub
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click **"Deploy"**

### Method 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project directory
cd drone-harmony

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Build Configuration

The application uses the following build setup:

**Client (Static):**
- Build command: `cd client && npm run build`
- Output directory: `client/dist`

**Server (Serverless Functions):**
- Runtime: Node.js 20.x
- Entry: `server/index.ts`
- Max duration: 60 seconds (Pro plan)

## Environment Variables

In your Vercel project settings, configure:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment setting |
| `DRONE_VIDEO_SOURCE` | `test` | Default video source (optional) |
| `DRONE_IP` | (leave empty) | Can be set via UI |

## Using the Application

### Configure Drone Settings

1. Open your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Click the **Settings** button
3. Enter your **Drone IP Address**
4. Select **Video Stream Type** (RTSP/MJPEG/UDP)
5. Click **Save Settings**

### Known Issues on Vercel

#### 1. WebSocket Connection Won't Work
- The drone control WebSocket (/ws) is not supported on Vercel serverless
- **Workaround**: Deploy control server separately on Railway/Render
- UI will show "Drone Disconnected" - this is expected

#### 2. Video Streaming May Timeout
- FFmpeg streams are limited to 60 seconds on Pro plan (10s on Hobby)
- **Workaround**: 
  - Use MJPEG streams (lighter than RTSP)
  - Deploy streaming endpoint on a different platform
  - Use direct camera URLs if your drone supports it

#### 3. Test Pattern Works
- The test pattern stream (`/api/stream?test=true`) should work
- It demonstrates the UI functionality

## Hybrid Deployment (Recommended)

For full functionality, use a hybrid approach:

### Option A: Vercel + Railway
- **Vercel**: Host the React UI
- **Railway**: Host the streaming/WebSocket server
- Update client to point API calls to Railway URL

### Option B: Vercel + Custom Server
- **Vercel**: UI only
- **Your server**: Run the full backend with video/WebSocket
- Set environment variables to point to your server

## Vercel-Specific Features

✅ **What Works Well:**
- Static React UI
- Settings persistence (localStorage)
- API endpoints for configuration
- Health check endpoint

⚠️ **What Has Limitations:**
- Live video streaming (timeout issues)
- WebSocket drone control (not supported)
- FFmpeg processing (cold starts)

## Alternative: Static UI Only

To use Vercel for UI only and point to an external backend:

1. Update `client/src/components/VideoDisplay.tsx`:
```typescript
// Change this line:
const backendStreamUrl = droneIp 
    ? `/api/stream?droneIp=${encodeURIComponent(droneIp)}&sourceType=${sourceType}`
    : `/api/stream?test=true`;

// To point to your backend:
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://your-backend.com';
const backendStreamUrl = droneIp 
    ? `${BACKEND_URL}/api/stream?droneIp=${encodeURIComponent(droneIp)}&sourceType=${sourceType}`
    : `${BACKEND_URL}/api/stream?test=true`;
```

2. Add environment variable in Vercel:
   - `VITE_BACKEND_URL=https://your-backend.railway.app`

## Testing Locally

Test the Vercel build locally:

```bash
# Install dependencies
npm install

# Build
npm run build

# Test with Vercel CLI
vercel dev
```

## Troubleshooting

### Build Fails
- Ensure all dependencies are in `package.json`
- Check server TypeScript compiles: `npm run build:server`
- Check client builds: `cd client && npm run build`

### Stream Doesn't Work
- Check function logs in Vercel dashboard
- Verify the 60-second timeout isn't being hit
- Consider using direct camera URLs instead of FFmpeg proxy

### WebSocket Error
- Expected on Vercel - WebSockets aren't supported in serverless
- Deploy WebSocket server separately or use alternative platform

## Recommended Production Setup

For production drone control, I recommend:

1. **UI on Vercel** (fast, global CDN)
2. **Backend on Railway/Render** (WebSocket + streaming support)
3. **Configure CORS** to allow Vercel UI to call Railway API

This gives you:
- ✅ Fast UI delivery via Vercel CDN
- ✅ Full WebSocket support for drone control
- ✅ Reliable FFmpeg streaming
- ✅ No timeout issues

## Support

- **Vercel Issues**: [Vercel Docs](https://vercel.com/docs)
- **Serverless Limitations**: [Vercel Limits](https://vercel.com/docs/concepts/limits/overview)
- **Alternative Platforms**: Consider Railway, Render, or Fly.io for full features
