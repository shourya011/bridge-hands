# Deployment Guide - ISL Translation App

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

#### Quick Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to project
# - Choose framework: Vite
# - Build command: npm run build
# - Output directory: dist
# - Install command: npm install
```

#### Environment Setup
No environment variables needed! Everything runs client-side.

#### Custom Domain (Optional)
```bash
vercel --prod
vercel domains add yourdomain.com
```

### Option 2: Netlify

#### Via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod

# Specify:
# - Publish directory: dist
```

#### Via Git Integration
1. Push code to GitHub/GitLab
2. Connect repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Install command: `npm install`

### Option 3: GitHub Pages

#### Setup
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

# Update vite.config.ts
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
})

# Deploy
npm run deploy
```

### Option 4: Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Camera access requires HTTPS in production
    add_header Permissions-Policy "camera=(self)";
}
```

#### Build & Run
```bash
# Build image
docker build -t isl-translator .

# Run container
docker run -p 8080:80 isl-translator
```

### Option 5: AWS S3 + CloudFront

#### Build
```bash
npm run build
```

#### Deploy
```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

## 🔒 HTTPS Configuration

**CRITICAL**: Camera access requires HTTPS in production!

### Let's Encrypt (Free SSL)
```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --webroot \
  -w /var/www/html \
  -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Cloudflare (Easy SSL)
1. Point domain to Cloudflare nameservers
2. Enable "Full (strict)" SSL mode
3. Turn on "Always Use HTTPS"
4. Done! ✅

## ⚙️ Production Optimizations

### 1. Build Optimization

#### vite.config.ts
```typescript
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'mediapipe': ['@mediapipe/tasks-vision'],
          'tensorflow': ['@tensorflow/tfjs'],
          'vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### 2. CDN Configuration

#### MediaPipe Models
Models are loaded from `cdn.jsdelivr.net` automatically.

For custom CDN:
```typescript
// In WebcamCapture.tsx
const vision = await FilesetResolver.forVisionTasks(
  'https://your-cdn.com/mediapipe/wasm'
);
```

### 3. Caching Strategy

#### netlify.toml
```toml
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

### 4. Performance Monitoring

#### Web Vitals
```bash
npm install web-vitals
```

```typescript
// src/main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🌐 Browser Compatibility

### Recommended Settings

#### .browserslistrc
```
> 0.5%
last 2 versions
not dead
Chrome >= 90
Edge >= 90
Firefox >= 88
Safari >= 14
```

### Feature Detection
```typescript
// Check camera support
if (!navigator.mediaDevices?.getUserMedia) {
  alert('Camera not supported in this browser');
}

// Check Web Speech API
if (!window.speechSynthesis) {
  alert('Text-to-speech not supported');
}

// Check WebGL (for MediaPipe)
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl2');
if (!gl) {
  alert('WebGL 2.0 required for hand detection');
}
```

## 📊 Analytics Setup

### Google Analytics (Optional)
```bash
npm install @types/gtag.js
```

```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Privacy-Focused Alternative: Plausible
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## 🔍 SEO Optimization

### meta tags (index.html)
```html
<meta name="description" content="Real-time Indian Sign Language translation with camera-based gesture recognition and multilingual support">
<meta name="keywords" content="ISL, Indian Sign Language, translation, accessibility, sign language recognition">
<meta property="og:title" content="ISL Real-Time Translator">
<meta property="og:description" content="Bridge the communication gap with AI-powered sign language translation">
<meta property="og:image" content="/og-image.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

### robots.txt
```txt
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

## 🛡️ Security Headers

### Recommended Headers
```nginx
# Content Security Policy
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net;
  connect-src 'self' https://cdn.jsdelivr.net https://storage.googleapis.com;
  img-src 'self' data: blob:;
  media-src 'self' mediastream: blob:;
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  font-src 'self';
";

# Permissions Policy
add_header Permissions-Policy "
  camera=(self),
  microphone=(),
  geolocation=(),
  payment=()
";

# Other security headers
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

## 📱 Progressive Web App (PWA)

### manifest.json
```json
{
  "name": "ISL Real-Time Translator",
  "short_name": "ISL Translator",
  "description": "Real-time Indian Sign Language translation",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (vite-plugin-pwa)
```bash
npm install vite-plugin-pwa -D
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
});
```

## 🧪 Testing Before Deployment

### Checklist
- [ ] Camera access works
- [ ] Hand detection accurate
- [ ] All gestures recognized
- [ ] Audio plays in all languages
- [ ] Metrics update correctly
- [ ] History displays properly
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Cross-browser tested
- [ ] Performance optimized

### Test Commands
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Check bundle size
npm run build -- --mode production
```

### Lighthouse Audit
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://yourdomain.com --view
```

**Target Scores**:
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90

## 🐛 Troubleshooting Production Issues

### Camera Not Working in Production
**Cause**: HTTP instead of HTTPS
**Solution**: Enable SSL/TLS certificate

### Models Fail to Load
**Cause**: CORS or CDN blocked
**Solution**: Check Content Security Policy headers

### High Latency
**Cause**: Large bundle size or slow CDN
**Solution**: Implement code splitting and use faster CDN

### Audio Not Playing
**Cause**: Autoplay policy restrictions
**Solution**: Require user interaction before first audio

## 📈 Monitoring

### Uptime Monitoring
- **UptimeRobot**: Free tier available
- **Pingdom**: Comprehensive monitoring
- **StatusCake**: Simple uptime checks

### Error Tracking
```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

## 💰 Cost Estimation

### Hosting Costs (Monthly)

| Platform | Cost | Traffic Limit |
|----------|------|---------------|
| Vercel | $0 | 100GB |
| Netlify | $0 | 100GB |
| GitHub Pages | $0 | Soft limit |
| AWS S3 + CloudFront | ~$5-10 | 50GB |
| DigitalOcean | $5-10 | 1TB |

**Note**: All processing is client-side, so hosting is very cheap!

## 🎯 Launch Checklist

- [ ] Domain configured
- [ ] HTTPS enabled
- [ ] DNS propagated
- [ ] Analytics installed
- [ ] Error tracking setup
- [ ] Monitoring enabled
- [ ] Performance optimized
- [ ] SEO meta tags added
- [ ] Social media cards ready
- [ ] Tested on all browsers
- [ ] Mobile tested
- [ ] Documentation updated
- [ ] Backup plan ready

## 🚀 Go Live!

```bash
# Final build
npm run build

# Deploy to production
vercel --prod
# or
netlify deploy --prod
# or
npm run deploy
```

---

**Your ISL translation app is now live and helping bridge the communication gap!** 🌉✨

For support: Check logs, monitor metrics, and iterate based on user feedback.
