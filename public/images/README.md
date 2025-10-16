# Limen Lakay - Images Directory

This directory contains all images for the Limen Lakay candle business website.

## Recommended Image Structure:

### Product Images
- `products/concrete/` - Concrete vessel candle photos
- `products/wood/` - Wood vessel candle photos  
- `products/ceramic/` - Ceramic vessel candle photos
- `products/custom/` - Custom creation examples

### Hero Images
- `hero/` - Main banner and hero section images

### Process Images
- `process/` - Behind-the-scenes crafting photos

### About Images
- `about/` - Workspace, artisan photos

## Image Guidelines:
- Use WebP format for web optimization
- Recommended sizes: 800x800px for product images, 1920x1080px for hero images
- Always include alt text for accessibility
- Compress images for web delivery

## Usage in Components:
```tsx
import Image from 'next/image';

<Image
  src="/images/products/concrete/candle-1.webp"
  alt="Handmade soy candle in concrete vessel"
  width={800}
  height={800}
  className="rounded-lg"
/>
```