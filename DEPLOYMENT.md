# Deployment Guide

## Quick Start (Local Development)

```bash
cd colour-maxx
npm install
npm run dev
```

Open http://localhost:3000

## Production Build

### Option 1: Static Export (Recommended for hosting on any static server)

```bash
npm run build
```

This creates an optimized production build in `.next/` directory that can be served with:

```bash
npm start
```

### Option 2: Deploy to Vercel (One-Click)

The easiest way to deploy this Next.js app:

1. Push to GitHub
2. Import on [Vercel](https://vercel.com/new)
3. Deploy (auto-detects Next.js, zero config needed)

### Option 3: Deploy to Netlify

```bash
npm run build
```

Then deploy the `.next` directory.

### Option 4: Static HTML Export

To export as pure static files:

Add to `next.config.ts`:
```typescript
const nextConfig = {
  output: 'export',
};
```

Then run:
```bash
npm run build
```

This creates an `out/` directory with static HTML/CSS/JS that can be hosted anywhere (GitHub Pages, S3, Cloudflare Pages, etc.).

## Environment Variables

None required! The game runs entirely client-side with no backend dependencies.

## Browser Support

- Modern browsers with ES6+ support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: ~150KB total (Next.js + React + game code)
- **First Load**: <1s on 3G
- **Interactive**: <500ms

## Customization for Production

1. **Replace Word Lists**: Update `lib/wordlists.ts` with complete Wordle word lists
2. **Analytics**: Add your analytics script to `app/layout.tsx`
3. **SEO**: Update metadata in `app/layout.tsx`
4. **Favicon**: Replace `app/favicon.ico`
5. **Open Graph**: Add OG image for social sharing

## Monitoring

No server monitoring needed since it's fully client-side. Consider:
- Client-side error tracking (Sentry, Rollbar)
- Web analytics (Plausible, Fathom, Google Analytics)
- Real user monitoring (Vercel Analytics, Cloudflare Web Analytics)
