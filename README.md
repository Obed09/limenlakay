# Limen Lakay - Handmade Candles Landing Page

A beautiful, modern landing page for Limen Lakay, a handmade candle business featuring unique concrete vessels and artisanal materials.

## ✨ Features

- **Beautiful Hero Section** - Compelling introduction to the Limen Lakay brand
- **Product Showcase** - Display of candle collections with materials and scents
- **About Section** - Brand story and crafting process explanation  
- **Contact & Orders** - Comprehensive form for custom order inquiries
- **Responsive Design** - Optimized for all devices
- **Dark/Light Mode** - Theme switcher for user preference
- **Smooth Animations** - Subtle candle-inspired visual effects

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom candle-themed design
- **UI Components**: Radix UI primitives
- **Backend**: Supabase for database and authentication
- **Deployment**: Vercel-ready

## 🕯️ Design Philosophy

The design reflects the warm, artisanal nature of handmade candles:
- Warm amber/golden color palette
- Clean, minimalist layout inspired by concrete vessels
- Smooth scrolling and subtle animations
- Focus on craftsmanship and quality

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase URL and anon key

3. **Set up Database**
   - Run the SQL commands in `database/schema.sql` in your Supabase SQL editor

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   - Visit `http://localhost:3000`

## 📁 Project Structure

```
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── ui/             # Shadcn/ui components
│   ├── hero.tsx        # Hero section
│   ├── product-showcase.tsx
│   ├── about-section.tsx
│   └── contact-section.tsx
├── database/           # Database schema and migrations
├── public/images/      # Product and brand images
└── lib/               # Utilities and Supabase client
```

## 🗄️ Database Schema

The Supabase database includes tables for:
- **Products** - Candle inventory management
- **Inquiries** - Customer contact form submissions
- **Custom Orders** - Order tracking and management
- **Newsletter Subscribers** - Email list management

## 📸 Adding Product Images

1. Add images to `public/images/products/`
2. Organize by category: `concrete/`, `wood/`, `ceramic/`
3. Use WebP format for optimal performance
4. Recommended size: 800x800px for product images

## 🎨 Customization

### Colors
The design uses a warm amber palette. Main colors:
- Primary: `amber-600` (#d97706)
- Accent: `amber-100` (#fef3c7)
- Text: Warm grays

### Fonts
- Primary: Geist Sans (included)
- Clean, modern typography focusing on readability

## 📱 Features to Add

**Next Steps for Enhancement:**
- [ ] Product image gallery integration
- [ ] Payment processing (Stripe)
- [ ] Inventory management dashboard
- [ ] Email notifications for inquiries
- [ ] Customer testimonials section
- [ ] Instagram integration for social proof
- [ ] SEO optimization with structured data

## 🔧 Development

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📄 License

This project is created for Limen Lakay candle business.

---

**Limen Lakay** - *"Light of the Home"*  
Handcrafted candles that bring warmth and beauty to your space.
