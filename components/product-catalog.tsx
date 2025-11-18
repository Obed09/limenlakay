'use client';

import React, { useState, useMemo } from 'react';
import { productCatalog, getProductsByCategory, categories, Product } from '@/lib/product-catalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ProductCatalogProps {
  onProductSelect?: (product: Product) => void;
}

export default function ProductCatalog({ onProductSelect }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on category and search
  const filteredProducts = useMemo(() => {
    let products = productCatalog;

    // Filter by category
    if (selectedCategory !== 'all') {
      products = getProductsByCategory(selectedCategory as Product['category']);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query) ||
        product.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    return products;
  }, [selectedCategory, searchQuery]);

  const handleProductInquiry = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      // Scroll to contact form
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        // Pre-fill the contact form with product info
        const messageField = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
        if (messageField) {
          messageField.value = `Hi! I'm interested in the ${product.name} (${product.id}). Could you please provide more information about availability and customization options?`;
          messageField.focus();
        }
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Product Catalog</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our collection of handcrafted candles in unique vessels. Each piece is carefully crafted with attention to detail and quality.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Input
              type="text"
              placeholder="Search products by name, ID, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="text-sm"
          >
            All Products ({productCatalog.length})
          </Button>
          {Object.entries(categories).map(([key, category]) => {
            const categoryCount = getProductsByCategory(key as Product['category']).length;
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(key)}
                className="text-sm"
              >
                {category.icon} {category.name} ({categoryCount})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-amber-300">
            <CardHeader className="pb-3">
              {/* Product Image Placeholder */}
              <div className="aspect-square bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                {/* Placeholder for actual product image */}
                <div className="text-6xl opacity-30">
                  {categories[product.category].icon}
                </div>
                
                {/* Product ID Badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs font-mono bg-white/80">
                    {product.id}
                  </Badge>
                </div>

                {/* Popular Badge */}
                {product.popular && (
                  <div className="absolute top-2 left-2">
                    <Badge className="text-xs bg-amber-600 hover:bg-amber-700">
                      Popular
                    </Badge>
                  </div>
                )}

                {/* Stock Status */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-sm">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-1 group-hover:text-amber-700 transition-colors">
                  {product.name}
                </h3>
                <Badge variant="outline" className="text-xs mb-2">
                  {categories[product.category].name}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="py-0">
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {product.description}
              </p>

              {/* Dimensions */}
              {product.dimensions && (
                <div className="text-xs text-gray-500 mb-3">
                  <p>{product.dimensions.height} H × {product.dimensions.diameter} W</p>
                  {product.dimensions.weight && <p>{product.dimensions.weight}</p>}
                </div>
              )}

              {/* Key Features */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {product.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{product.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-3">
              <div className="w-full space-y-3">
                {/* Price */}
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-amber-700">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Starting at
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => handleProductInquiry(product)}
                    disabled={!product.inStock}
                  >
                    {product.inStock ? 'Get Quote' : 'Notify When Available'}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        // Open detailed view modal (can be implemented later)
                        alert(`More details about ${product.name} (${product.id}) coming soon!`);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        // Add to favorites/wishlist (can be implemented later)
                        alert(`${product.name} added to wishlist!`);
                      }}
                    >
                      ♥ Save
                    </Button>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🕯️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? `No products match "${searchQuery}". Try a different search term.`
              : 'No products available in this category.'}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            View All Products
          </Button>
        </div>
      )}

      {/* Quick Order Help */}
      <div className="mt-12 bg-amber-50 rounded-lg p-6 border border-amber-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">Easy Ordering with Product IDs</h3>
          <p className="text-amber-700 mb-4">
            Each product has a unique ID (like LL-CON-001) that makes ordering quick and easy. 
            Simply reference the ID when contacting us!
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-amber-600">
            <span><strong>LL-CON-</strong> = Concrete Collection</span>
            <span><strong>LL-WOD-</strong> = Wood Collection</span>
            <span><strong>LL-CER-</strong> = Ceramic Collection</span>
            <span><strong>LL-CUS-</strong> = Custom Collection</span>
          </div>
        </div>
      </div>
    </div>
  );
}