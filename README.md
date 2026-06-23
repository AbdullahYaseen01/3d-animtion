# NOVA — Premium Footwear

A premium sneaker brand landing page built with React, Vite, Framer Motion, and GSAP.

## Live deploy (Vercel)

1. Push this repo to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

## Local development

```bash
npm install
npm run dev
```

## Asset scripts

| Command | Description |
|---------|-------------|
| `npm run setup-process-stock` | Download HQ shoe photos for Craft section |
| `npm run setup-feature-shoes` | Download HQ shoe photos for Features section |
| `npm run create-hero-loop` | Regenerate hero video loop (requires local source video) |

## Included media

- `public/hero-loop.mp4` — HD loop used in Hero + Collection sections (~3.4 MB)
- `public/process/*.webp` — Craft section card images
- `public/features/*.webp` — Features section card images

Large source files (`shoe-animation.mp4`, frame sequences, 3D models) are gitignored and not required for deployment.
