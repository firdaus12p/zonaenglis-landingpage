# Deployment & Production Notes

## Build Process
```bash
# Production build
npm run build
# Output: dist/ folder

# Build verification
npm run preview  # Test production build locally
```

## Build Output
- `dist/index.html` - Main HTML file
- `dist/assets/` - CSS and JS bundles (with hash for caching)
- Bundle size: ~217KB JS, ~2.5KB CSS (gzipped: ~67KB JS, ~1KB CSS)

## Deployment Options

### Static Hosting (Recommended)
- **Netlify**: Drag & drop `dist/` folder or connect repo
- **Vercel**: Connect GitHub repository for auto-deployment
- **GitHub Pages**: Upload `dist/` contents to `gh-pages` branch
- **Firebase Hosting**: `firebase deploy` after build

### Configuration for Hosting
- No server-side rendering needed (SPA)
- All routes redirect to `index.html`
- Enable GZIP compression for better performance
- Set proper cache headers for assets with hashes

## Environment Variables (Future)
Currently all URLs are hardcoded in constants. For different environments:
```typescript
// Future: Use environment variables
const CTA_WHATSAPP = import.meta.env.VITE_WHATSAPP_URL || "#whatsapp";
```

## Performance Optimization
- Tailwind CSS is automatically purged in production
- React chunks are split automatically by Vite
- Icons from Lucide React are tree-shaken
- Images should be optimized and placed in `public/` folder

## SEO Considerations
- Meta tags in `index.html` are basic
- Consider adding Open Graph tags for social sharing
- Add structured data for local business
- Generate sitemap.xml for better indexing

## Analytics Integration
Add Google Analytics or similar:
```html
<!-- In index.html head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## Content Management
- All text content is in Indonesian
- CTA links need real URLs before production
- Testimonials should be replaced with real customer feedback
- Statistics (200+ students, 90% satisfaction) need verification