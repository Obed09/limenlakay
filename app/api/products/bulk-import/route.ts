import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/product-catalog';

interface ImportRequest {
  products: Partial<Product>[];
  filename?: string;
}

interface ImportResponse {
  success: boolean;
  message: string;
  products: Product[];
  imported: number;
  failed: number;
  errors?: string[];
}

/**
 * POST /api/products/bulk-import
 * Process bulk import of products from Excel file data
 */
export async function POST(request: NextRequest): Promise<NextResponse<ImportResponse>> {
  try {
    const body: ImportRequest = await request.json();
    const { products: partialProducts, filename } = body;

    if (!partialProducts || !Array.isArray(partialProducts)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid product data provided',
        products: [],
        imported: 0,
        failed: 0,
        errors: ['No product data received']
      }, { status: 400 });
    }

    const validProducts: Product[] = [];
    const errors: string[] = [];
    let importedCount = 0;
    let failedCount = 0;

    // Process each product
    for (let i = 0; i < partialProducts.length; i++) {
      const partialProduct = partialProducts[i];
      const rowNum = i + 2; // Excel row number (header is row 1)

      try {
        // Validate required fields
        if (!partialProduct.name || !partialProduct.description || !partialProduct.category || !partialProduct.price) {
          errors.push(`Row ${rowNum}: Missing required fields (name, description, category, or price)`);
          failedCount++;
          continue;
        }

        // Validate product structure and create complete product
        const product: Product = {
          id: partialProduct.id || `LL-TMP-${Date.now()}-${i}`, // Temporary ID if not generated
          name: partialProduct.name,
          description: partialProduct.description,
          category: partialProduct.category,
          price: partialProduct.price,
          images: partialProduct.images || {
            main: '/images/products/placeholder.jpg'
          },
          features: partialProduct.features || [],
          inStock: partialProduct.inStock ?? true,
          dimensions: partialProduct.dimensions,
          popular: partialProduct.popular || false
        };

        // Additional validation
        if (product.price <= 0) {
          errors.push(`Row ${rowNum}: Price must be greater than 0`);
          failedCount++;
          continue;
        }

        if (!['concrete', 'wood', 'ceramic', 'custom'].includes(product.category)) {
          errors.push(`Row ${rowNum}: Invalid category. Must be: concrete, wood, ceramic, or custom`);
          failedCount++;
          continue;
        }

        validProducts.push(product);
        importedCount++;

      } catch (error) {
        errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failedCount++;
      }
    }

    // In a real application, you would save to a database here
    // For now, we'll simulate successful import
    
    // TODO: Integrate with Supabase or your chosen database
    // Example:
    // const { data, error } = await supabase
    //   .from('products')
    //   .insert(validProducts);
    
    // For development, we'll just log the products
    console.log('Products to import:', validProducts);
    console.log('Import errors:', errors);

    const response: ImportResponse = {
      success: importedCount > 0,
      message: importedCount > 0 
        ? `Successfully imported ${importedCount} products${failedCount > 0 ? ` (${failedCount} failed)` : ''}`
        : 'No products were imported due to validation errors',
      products: validProducts,
      imported: importedCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined
    };

    return NextResponse.json(response, { 
      status: importedCount > 0 ? 200 : 400 
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error during import',
      products: [],
      imported: 0,
      failed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown server error']
    }, { status: 500 });
  }
}

/**
 * GET /api/products/bulk-import
 * Get import template or status information
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Bulk import endpoint is ready',
    supportedFormats: ['xlsx', 'xls'],
    requiredFields: ['name', 'description', 'category', 'price'],
    optionalFields: ['features', 'height', 'diameter', 'weight', 'inStock'],
    categories: ['concrete', 'wood', 'ceramic', 'custom']
  });
}