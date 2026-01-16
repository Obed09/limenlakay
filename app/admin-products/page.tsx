'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Database, 
  Upload, 
  BarChart3, 
  Package, 
  Settings, 
  Flame,
  Edit,
  Trash2,
  Plus,
  Star,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description: string;
  category: string;
  fragrance?: string;
  size?: string;
  image_url: string;
  is_available: boolean;
  stock_quantity: number;
  on_sale: boolean;
  is_new: boolean;
  rating: number;
  review_count: number;
  sku: string;
  created_at: string;
}

export default function ProductAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    original_price: 0,
    description: '',
    category: 'candles',
    fragrance: '',
    size: '',
    image_url: '',
    is_available: true,
    stock_quantity: 0,
    on_sale: false,
    is_new: false,
    rating: 0,
    review_count: 0,
    sku: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading products',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast({
        title: 'Validation Error',
        description: 'Name and price are required',
        variant: 'destructive'
      });
      return;
    }

    const productData = {
      ...formData,
      original_price: formData.original_price || null,
      fragrance: formData.fragrance || null,
      size: formData.size || null
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast({
          title: 'Error updating product',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({ title: 'Product updated successfully!' });
        resetForm();
        loadProducts();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) {
        toast({
          title: 'Error creating product',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({ title: 'Product created successfully!' });
        resetForm();
        loadProducts();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error deleting product',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({ title: 'Product deleted successfully!' });
      loadProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      original_price: product.original_price || 0,
      description: product.description,
      category: product.category,
      fragrance: product.fragrance || '',
      size: product.size || '',
      image_url: product.image_url,
      is_available: product.is_available,
      stock_quantity: product.stock_quantity,
      on_sale: product.on_sale,
      is_new: product.is_new,
      rating: product.rating,
      review_count: product.review_count,
      sku: product.sku
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      original_price: 0,
      description: '',
      category: 'candles',
      fragrance: '',
      size: '',
      image_url: '',
      is_available: true,
      stock_quantity: 0,
      on_sale: false,
      is_new: false,
      rating: 0,
      review_count: 0,
      sku: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('candle-images')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError.message,
        variant: 'destructive'
      });
      return;
    }

    const { data } = supabase.storage
      .from('candle-images')
      .getPublicUrl(filePath);

    setFormData({ ...formData, image_url: data.publicUrl });
    toast({ title: 'Image uploaded successfully!' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              ADMIN MODE
            </div>
            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
              Product Management
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Product Catalog Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage products displayed in the Kringle-style storefront
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Star className="h-8 w-8 text-amber-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {products.filter(p => p.on_sale).length}
                  </div>
                  <div className="text-sm text-gray-600">On Sale</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Flame className="h-8 w-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {products.filter(p => p.is_new).length}
                  </div>
                  <div className="text-sm text-gray-600">New Products</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {products.filter(p => p.is_available).length}
                  </div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin-vessels">Manage Vessels & Candles</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin">Main Dashboard</a>
            </Button>
          </div>
        </div>

        {/* Product Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
              <CardDescription>
                Product information for the storefront catalog
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Balsam & Cedar Large 2-Wick"
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., LL-CAN-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Original Price (if on sale)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="candles">Candles</option>
                    <option value="fragrances">Fragrances</option>
                    <option value="flameless">Flameless</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <Label>Fragrance</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.fragrance}
                    onChange={(e) => setFormData({ ...formData, fragrance: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="holiday">Holiday</option>
                    <option value="autumn">Autumn</option>
                    <option value="florals">Florals</option>
                    <option value="fresh">Fresh</option>
                    <option value="fruits">Fruits</option>
                    <option value="gourmet">Gourmet</option>
                  </select>
                </div>
                <div>
                  <Label>Size</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="xl-4-wick">XL 4-wick</option>
                    <option value="large-2-wick">Large 2-wick</option>
                    <option value="daylights">DayLights</option>
                    <option value="wax-melts">Wax Melts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Rating (0-5)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Product Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {formData.image_url && (
                    <Image
                      src={formData.image_url}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="rounded-md"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                  <Label>Available</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.on_sale}
                    onCheckedChange={(checked) => setFormData({ ...formData, on_sale: checked })}
                  />
                  <Label>On Sale</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_new}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                  />
                  <Label>New Product</Label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>All products displayed in the storefront</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products yet. Click "Add New Product" to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="relative h-48 bg-gray-100">
                      {product.image_url && (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute top-2 left-2 flex gap-2">
                        {product.on_sale && (
                          <span className="bg-red-600 text-white px-2 py-1 text-xs rounded font-bold">
                            SALE
                          </span>
                        )}
                        {product.is_new && (
                          <span className="bg-blue-600 text-white px-2 py-1 text-xs rounded font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.sku}</p>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl font-bold text-amber-600">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.original_price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>Stock: {product.stock_quantity}</span>
                        <span>Rating: {product.rating}⭐</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
