# Product PDF Extraction Guide

## 🎯 Overview
This guide will help you extract product information from your PDF and organize it into a structured, user-friendly catalog with proper ID numbers for easy customer ordering.

## 📋 Step-by-Step Process

### Step 1: Access the Product Data Extractor
1. Open your browser and go to: `http://localhost:3000/admin`
2. This is your private admin tool for extracting product data

### Step 2: Organize Your PDF Information
Before starting, have your PDF open and organize each product by:

#### Required Information:
- **Product Name**: Make it descriptive and appealing
- **Category**: Choose from:
  - `Concrete Collection` - Modern industrial vessels
  - `Wood Collection` - Natural wooden vessels
  - `Ceramic Collection` - Pottery and glazed vessels 
  - `Custom Collection` - Personalized or unique combinations
- **Description**: 2-3 sentences highlighting unique features
- **Price**: Research competitive pricing (suggested range: $24.99 - $45.99)

#### Optional Information:
- **Dimensions**: Height and diameter (e.g., "4 inches H × 3.5 inches W")
- **Weight**: If available (e.g., "1.2 lbs")
- **Features**: Key selling points (e.g., "Natural soy wax", "40-hour burn time")
- **Image Description**: Describe colors, lighting, styling for future photo shoots
- **PDF Reference**: Note which page/section for organization

### Step 3: Product ID System
Each product gets a unique ID for easy ordering:

- **LL-CON-001, LL-CON-002...** = Concrete Collection
- **LL-WOD-001, LL-WOD-002...** = Wood Collection  
- **LL-CER-001, LL-CER-002...** = Ceramic Collection
- **LL-CUS-001, LL-CUS-002...** = Custom Collection

### Step 4: Using the Extractor Tool

#### For Each Product in Your PDF:
1. **Select Category** from dropdown
2. **Enter Product Name** (be creative and descriptive)
3. **Write Description** highlighting what makes it special
4. **Set Price** (research similar products for competitive pricing)
5. **Add Features** one by one:
   - Natural soy wax
   - Cotton/wood wick
   - Burn time (estimate 30-50 hours)
   - Vessel material
   - Reusable container
   - Handcrafted/artisan made
6. **Enter Dimensions** if you have measurements
7. **Describe Image** for future reference
8. **Note PDF Location** to track which product is which
9. **Click "Save Product"** - gets automatic ID number

### Step 5: Export and Implement
1. After extracting all products, click **"Export to Code"**
2. Copy the generated code to your clipboard
3. Open `lib/product-catalog.ts`
4. Replace the sample products with your extracted data
5. Update image paths to match your actual product photos

## 📸 Image Organization
After extracting products, organize your images like this:

```
public/images/products/
├── concrete/
│   ├── LL-CON-001-main.jpg
│   ├── LL-CON-001-side.jpg
│   ├── LL-CON-002-main.jpg
│   └── ...
├── wood/
│   ├── LL-WOD-001-main.jpg
│   ├── LL-WOD-001-detail.jpg
│   └── ...
├── ceramic/
│   └── ...
└── custom/
    └── ...
```

## 💡 Pro Tips for Great Product Descriptions

### Concrete Collection Examples:
- "Modern minimalist concrete candle in sleek geometric form"
- "Hand-finished concrete with unique textural patterns"
- "Industrial charm meets contemporary elegance"

### Wood Collection Examples:
- "Handcrafted from reclaimed oak with natural wood grain"
- "Beach-sourced driftwood brings coastal vibes"
- "Rustic charm with organic, one-of-a-kind character"

### Ceramic Collection Examples:
- "Hand-thrown ceramic with beautiful glazed finish"
- "Artisan pottery with sophisticated matte finish"
- "Traditional craftsmanship meets modern design"

### Custom Collection Examples:
- "Unique combination of materials for personalized touch"
- "Custom engraving available for special occasions"
- "Bespoke design tailored to your space"

## 🏷️ Pricing Strategy
Research suggests these price ranges for handmade candles:

- **Small vessels** (3-4 inches): $24.99 - $29.99
- **Medium vessels** (4-5 inches): $29.99 - $35.99  
- **Large vessels** (5+ inches): $34.99 - $45.99
- **Custom/Personalized**: +$5-10 premium

## ✅ Quality Control Checklist

Before launching each product, ensure:
- [ ] Compelling, descriptive name
- [ ] Clear category assignment
- [ ] Detailed description (2-3 sentences)
- [ ] Competitive pricing
- [ ] 3-5 key features listed
- [ ] Dimensions when available
- [ ] High-quality image description for photo reference
- [ ] Unique product ID assigned
- [ ] All spelling and grammar checked

## 🚀 After Extraction

### Immediate Tasks:
1. Professional product photography
2. Update image paths in catalog
3. Test all product links and forms
4. Review pricing against competitors
5. Proofread all descriptions

### Marketing Preparation:
1. Create social media content using product IDs
2. Develop email campaigns featuring new catalog
3. Update business cards/materials with new product range
4. Create promotional materials highlighting unique ID system

## 📊 Benefits of This System

### For Customers:
- Easy ordering with product IDs
- Clear category organization  
- Detailed product information
- Professional presentation

### For Your Business:
- Streamlined order management
- Easy inventory tracking
- Professional catalog system
- Scalable as you add products

## 🔧 Technical Notes

### Image Requirements:
- **Main images**: 800x800px minimum, square aspect ratio
- **Gallery images**: Same size, different angles
- **Format**: JPG or PNG
- **Quality**: High resolution for zoom functionality

### SEO Optimization:
- Use descriptive file names: `LL-CON-001-urban-concrete-vessel.jpg`
- Include alt text with product name and key features
- Optimize images for web (compress without quality loss)

## 📞 Need Help?

If you encounter any issues during extraction:
1. Check the browser console for errors
2. Ensure all required fields are filled
3. Verify category selection matches your product type
4. Contact technical support if extraction tool malfunctions

---

## 🎨 Sample Product Entry

Here's how a complete product entry should look:

**Product ID**: LL-CON-001  
**Name**: Urban Concrete Vessel  
**Category**: Concrete Collection  
**Price**: $28.99  
**Description**: Modern minimalist concrete candle in sleek geometric form. Perfect for contemporary spaces with its clean lines and industrial charm.  

**Dimensions**:  
- Height: 4 inches  
- Diameter: 3.5 inches  
- Weight: 1.2 lbs  

**Features**:  
- Industrial concrete finish  
- Natural soy wax  
- Cotton wick  
- 40-hour burn time  
- Reusable vessel  

**Image Description**: Clean concrete vessel on white background, soft lighting from left, minimalist styling with subtle shadows  
**PDF Reference**: Page 1, top left

---

Happy cataloging! 🕯️✨