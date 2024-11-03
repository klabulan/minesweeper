# Neon Miner Deployment Guide

## Prerequisites
- Node.js 18+ installed
- npm 9+ installed
- Git installed (for version control)

## Local Development Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd minesweeper
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```
The development server will run at http://localhost:3000

## Building for Production

1. Create production build:
```bash
npm run build
```
This will create a `dist` folder with optimized production files.

2. Test production build locally:
```bash
npm run preview
```

## Deployment Options

### 1. Static Hosting (Recommended)
The game can be deployed to any static hosting service:

#### Netlify
1. Create account on netlify.com
2. Connect your repository
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy

#### GitHub Pages
1. Add homepage to package.json:
```json
{
  "homepage": "https://[username].github.io/minesweeper"
}
```

2. Deploy using gh-pages:
```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d dist
```

### 2. Self-Hosted
If deploying to your own server:

1. Build the project:
```bash
npm run build
```

2. Copy the `dist` folder to your web server
3. Configure server to serve index.html for all routes
4. Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Environment Variables

Create `.env` file for environment-specific settings:
```env
VITE_API_URL=your-api-url
VITE_STORAGE_PREFIX=neon-miner
```

## Post-Deployment Checklist

1. Verify all game features work:
   - Board generation
   - Game mechanics
   - High scores
   - Settings persistence

2. Test responsive design on different devices

3. Check browser compatibility:
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)

4. Performance verification:
   - Load time < 3s
   - Smooth animations
   - No memory leaks

## Monitoring & Maintenance

1. Set up error tracking (optional):
   - Sentry integration
   - Console error monitoring

2. Regular maintenance:
   - Keep dependencies updated
   - Monitor for security advisories
   - Backup high scores data

## Troubleshooting

Common issues and solutions:

1. White screen after deployment:
   - Check base URL configuration in vite.config.js
   - Verify all assets are loading correctly
   - Check browser console for errors

2. High scores not persisting:
   - Verify localStorage permissions
   - Check storage quota limits
   - Validate JSON data structure

3. Performance issues:
   - Enable gzip compression on server
   - Verify build optimization settings
   - Check for unnecessary re-renders

## Support

For issues and support:
1. Check GitHub Issues
2. Review documentation
3. Contact development team
