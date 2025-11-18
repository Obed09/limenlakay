'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ProductFromPDF {
  id: string;
  name: string;
  category: 'concrete' | 'wood' | 'ceramic' | 'custom';
  description: string;
  price: number;
  features: string[];
  dimensions?: {
    height: string;
    diameter: string;
    weight?: string;
  };
  imageDescription: string; // Description of the image from PDF
  pdfPageRef?: string; // Reference to which page/section in PDF
}

export default function ProductDataExtractor() {
  const [currentProduct, setCurrentProduct] = useState<Partial<ProductFromPDF>>({
    category: 'concrete',
    features: [],
    price: 0
  });
  const [extractedProducts, setExtractedProducts] = useState<ProductFromPDF[]>([]);
  const [nextId, setNextId] = useState(1);

  const categoryPrefixes = {
    concrete: 'CON',
    wood: 'WOD',
    ceramic: 'CER', 
    custom: 'CUS'
  };

  const generateProductId = (category: string) => {
    const prefix = categoryPrefixes[category as keyof typeof categoryPrefixes];
    return `LL-${prefix}-${nextId.toString().padStart(3, '0')}`;
  };

  const addFeature = () => {
    const featureInput = document.getElementById('new-feature') as HTMLInputElement;
    if (featureInput && featureInput.value.trim()) {
      setCurrentProduct(prev => ({
        ...prev,
        features: [...(prev.features || []), featureInput.value.trim()]
      }));
      featureInput.value = '';
    }
  };

  const removeFeature = (index: number) => {
    setCurrentProduct(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const saveProduct = () => {
    if (!currentProduct.name || !currentProduct.description) {
      alert('Please fill in at least the product name and description');
      return;
    }

    const productId = generateProductId(currentProduct.category!);
    const newProduct: ProductFromPDF = {
      id: productId,
      name: currentProduct.name!,
      category: currentProduct.category!,
      description: currentProduct.description!,
      price: currentProduct.price || 0,
      features: currentProduct.features || [],
      dimensions: currentProduct.dimensions,
      imageDescription: currentProduct.imageDescription || '',
      pdfPageRef: currentProduct.pdfPageRef
    };

    setExtractedProducts(prev => [...prev, newProduct]);
    setNextId(prev => prev + 1);
    
    // Reset form
    setCurrentProduct({
      category: 'concrete',
      features: [],
      price: 0
    });

    alert(`Product ${productId} saved! You can continue adding more products.`);
  };

  const exportToCode = () => {
    const codeOutput = extractedProducts.map(product => {
      return `  {
    id: '${product.id}',
    name: '${product.name}',
    category: '${product.category}',
    description: '${product.description}',
    price: ${product.price},
    images: {
      main: '/images/products/${product.category}/${product.id}-main.jpg',
      gallery: [
        '/images/products/${product.category}/${product.id}-side.jpg',
        '/images/products/${product.category}/${product.id}-detail.jpg'
      ]
    },${product.dimensions ? `
    dimensions: {
      height: '${product.dimensions.height}',
      diameter: '${product.dimensions.diameter}'${product.dimensions.weight ? `,
      weight: '${product.dimensions.weight}'` : ''}
    },` : ''}
    features: [${product.features.map(f => `
      '${f}'`).join(',')}
    ],
    inStock: true${Math.random() > 0.7 ? ',\n    popular: true' : ''}
  }`;
    }).join(',\n');

    const fullCode = `// Generated product data from PDF extraction
export const newProducts = [
${codeOutput}
];`;

    // Copy to clipboard
    navigator.clipboard.writeText(fullCode).then(() => {
      alert('Product code copied to clipboard! You can paste this into your product-catalog.ts file.');
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Data Extractor</h1>
        <p className="text-gray-600">Extract product information from your PDF and create structured product data</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <p className="text-sm text-gray-600">Fill in the details from your PDF images and descriptions</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full p-2 border rounded-md"
                value={currentProduct.category || 'concrete'}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev, category: e.target.value as any }))}
              >
                <option value="concrete">Concrete Collection</option>
                <option value="wood">Wood Collection</option>
                <option value="ceramic">Ceramic Collection</option>
                <option value="custom">Custom Collection</option>
              </select>
            </div>

            {/* Product Name */}
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="e.g., Urban Concrete Vessel"
                value={currentProduct.name || ''}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full p-2 border rounded-md h-24"
                placeholder="Describe the product, its unique features, style, etc."
                value={currentProduct.description || ''}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="29.99"
                value={currentProduct.price || ''}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  placeholder="4 inches"
                  value={currentProduct.dimensions?.height || ''}
                  onChange={(e) => setCurrentProduct(prev => ({
                    ...prev,
                    dimensions: { 
                      height: e.target.value,
                      diameter: prev.dimensions?.diameter || '',
                      weight: prev.dimensions?.weight
                    }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="diameter">Diameter</Label>
                <Input
                  id="diameter"
                  placeholder="3.5 inches"
                  value={currentProduct.dimensions?.diameter || ''}
                  onChange={(e) => setCurrentProduct(prev => ({
                    ...prev,
                    dimensions: { 
                      height: prev.dimensions?.height || '',
                      diameter: e.target.value,
                      weight: prev.dimensions?.weight
                    }
                  }))}
                />
              </div>
            </div>

            {/* Weight (optional) */}
            <div>
              <Label htmlFor="weight">Weight (optional)</Label>
              <Input
                id="weight"
                placeholder="1.2 lbs"
                value={currentProduct.dimensions?.weight || ''}
                onChange={(e) => setCurrentProduct(prev => ({
                  ...prev,
                  dimensions: { 
                    height: prev.dimensions?.height || '',
                    diameter: prev.dimensions?.diameter || '',
                    weight: e.target.value || undefined
                  }
                }))}
              />
            </div>

            {/* Features */}
            <div>
              <Label>Features</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="new-feature"
                  placeholder="e.g., Natural soy wax"
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <Button type="button" onClick={addFeature} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentProduct.features?.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFeature(index)}>
                    {feature} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Image Description */}
            <div>
              <Label htmlFor="imageDescription">Image Description (from PDF)</Label>
              <textarea
                id="imageDescription"
                className="w-full p-2 border rounded-md h-20"
                placeholder="Describe what the image shows, colors, lighting, styling, etc."
                value={currentProduct.imageDescription || ''}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev, imageDescription: e.target.value }))}
              />
            </div>

            {/* PDF Reference */}
            <div>
              <Label htmlFor="pdfPageRef">PDF Page/Section Reference</Label>
              <Input
                id="pdfPageRef"
                placeholder="e.g., Page 2, Top Left"
                value={currentProduct.pdfPageRef || ''}
                onChange={(e) => setCurrentProduct(prev => ({ ...prev, pdfPageRef: e.target.value }))}
              />
            </div>

            <Button onClick={saveProduct} className="w-full bg-amber-600 hover:bg-amber-700">
              Save Product (ID will be: {generateProductId(currentProduct.category!)})
            </Button>
          </CardContent>
        </Card>

        {/* Preview & Extracted Products */}
        <div className="space-y-6">
          {/* Current Product Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Product Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {currentProduct.name ? (
                <div className="space-y-2">
                  <div className="font-semibold">{currentProduct.name}</div>
                  <Badge variant="outline">{currentProduct.category}</Badge>
                  <p className="text-sm text-gray-600">{currentProduct.description}</p>
                  <div className="text-lg font-bold text-amber-600">
                    ${(currentProduct.price || 0).toFixed(2)}
                  </div>
                  {currentProduct.features && currentProduct.features.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {currentProduct.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{feature}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Fill in the form to see preview</p>
              )}
            </CardContent>
          </Card>

          {/* Extracted Products List */}
          <Card>
            <CardHeader>
              <CardTitle>Extracted Products ({extractedProducts.length})</CardTitle>
              {extractedProducts.length > 0 && (
                <Button onClick={exportToCode} variant="outline" className="w-full">
                  Export to Code (Copy to Clipboard)
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {extractedProducts.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {extractedProducts.map((product, index) => (
                    <div key={product.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.id}</div>
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-600">${product.price.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{product.features.length} features</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No products extracted yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 How to Use This Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Open your PDF</strong> with the product images and descriptions</li>
            <li><strong>For each product:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Select the appropriate category (Concrete, Wood, Ceramic, Custom)</li>
                <li>Enter the product name (be descriptive and appealing)</li>
                <li>Write a compelling description highlighting unique features</li>
                <li>Set the price (research similar products for competitive pricing)</li>
                <li>Add key features one by one</li>
                <li>Include dimensions if available</li>
                <li>Describe the image for future reference</li>
                <li>Note which page/section of the PDF this is from</li>
              </ul>
            </li>
            <li><strong>Click "Save Product"</strong> - each product gets a unique ID (LL-CON-001, etc.)</li>
            <li><strong>Repeat</strong> for all products in your PDF</li>
            <li><strong>Export to Code</strong> - this copies the product data that you can paste into your product catalog</li>
            <li><strong>Update Images</strong> - after adding the code, upload actual product photos to match the image paths</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}