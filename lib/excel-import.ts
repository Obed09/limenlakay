import * as XLSX from 'xlsx';
import { Product } from './product-catalog';

export type ProductCategory = 'concrete' | 'wood' | 'ceramic' | 'custom';

export interface ExcelImportColumn {
  field: keyof Product | 'features' | 'dimensions' | 'height' | 'diameter' | 'weight' | 'mainImage' | 'galleryImages';
  label: string;
  required: boolean;
  type: 'text' | 'number' | 'array' | 'object';
}

export interface ImportMapping {
  [excelColumn: string]: ExcelImportColumn['field'];
}

export interface ImportValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowErrors: { [row: number]: string[] };
}

export interface ImportPreview {
  products: Partial<Product>[];
  validation: ImportValidation;
  totalRows: number;
  validRows: number;
}

// Define the expected Excel columns for Limen Lakay products
export const EXCEL_COLUMNS: ExcelImportColumn[] = [
  { field: 'name', label: 'Product Name', required: true, type: 'text' },
  { field: 'description', label: 'Description', required: true, type: 'text' },
  { field: 'category', label: 'Category (concrete/wood/ceramic/custom)', required: true, type: 'text' },
  { field: 'price', label: 'Price', required: true, type: 'number' },
  { field: 'inStock', label: 'In Stock (true/false)', required: false, type: 'text' },
  { field: 'features', label: 'Features (comma-separated)', required: false, type: 'array' },
  { field: 'height', label: 'Height', required: false, type: 'text' },
  { field: 'diameter', label: 'Diameter', required: false, type: 'text' },
  { field: 'weight', label: 'Weight', required: false, type: 'text' },
  { field: 'mainImage', label: 'Main Image URL', required: false, type: 'text' },
  { field: 'galleryImages', label: 'Gallery Images (comma-separated URLs)', required: false, type: 'array' },
];

/**
 * Parse Excel file and extract data
 * Adapted from WooCommerce Excel Importer functionality
 */
export function parseExcelFile(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        resolve(jsonData as any[][]);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Auto-detect column mapping based on header row
 * Similar to WooCommerce plugin's intelligent mapping
 */
export function detectColumnMapping(headers: string[]): ImportMapping {
  const mapping: ImportMapping = {};
  
  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().trim();
    
    // Smart matching based on common column names
    if (normalizedHeader.includes('name') || normalizedHeader.includes('title')) {
      mapping[header] = 'name';
    } else if (normalizedHeader.includes('description') || normalizedHeader.includes('desc')) {
      mapping[header] = 'description';
    } else if (normalizedHeader.includes('category') || normalizedHeader.includes('cat')) {
      mapping[header] = 'category';
    } else if (normalizedHeader.includes('price') || normalizedHeader.includes('cost')) {
      mapping[header] = 'price';
    } else if (normalizedHeader.includes('stock') || normalizedHeader.includes('in stock') || normalizedHeader.includes('available')) {
      mapping[header] = 'inStock';
    } else if (normalizedHeader.includes('feature') || normalizedHeader.includes('benefit')) {
      mapping[header] = 'features';
    } else if (normalizedHeader.includes('height')) {
      mapping[header] = 'height';
    } else if (normalizedHeader.includes('diameter') || normalizedHeader.includes('width')) {
      mapping[header] = 'diameter';
    } else if (normalizedHeader.includes('weight')) {
      mapping[header] = 'weight';
    } else if (normalizedHeader.includes('main image') || normalizedHeader.includes('primary image') || normalizedHeader.includes('main photo')) {
      mapping[header] = 'mainImage';
    } else if (normalizedHeader.includes('gallery') || normalizedHeader.includes('additional images') || normalizedHeader.includes('extra photos')) {
      mapping[header] = 'galleryImages';
    }
  });
  
  return mapping;
}

/**
 * Validate product data before import
 */
export function validateProductData(data: any[], mapping: ImportMapping): ImportValidation {
  const validation: ImportValidation = {
    isValid: true,
    errors: [],
    warnings: [],
    rowErrors: {}
  };

  // Check if required columns are mapped
  const requiredFields = EXCEL_COLUMNS.filter(col => col.required).map(col => col.field);
  const mappedFields = Object.values(mapping);
  
  requiredFields.forEach(field => {
    if (!mappedFields.includes(field)) {
      validation.errors.push(`Required field '${field}' is not mapped to any column`);
      validation.isValid = false;
    }
  });

  // Validate each row
  data.forEach((row, index) => {
    if (index === 0) return; // Skip header row
    
    const rowErrors: string[] = [];
    
    Object.entries(mapping).forEach(([excelCol, field]) => {
      const cellValue = row[Object.keys(mapping).indexOf(excelCol)];
      const column = EXCEL_COLUMNS.find(col => col.field === field);
      
      if (column?.required && (!cellValue || cellValue.toString().trim() === '')) {
        rowErrors.push(`${column.label} is required`);
      }
      
      if (field === 'price' && cellValue && isNaN(Number(cellValue))) {
        rowErrors.push('Price must be a valid number');
      }
    });
    
    if (rowErrors.length > 0) {
      validation.rowErrors[index + 1] = rowErrors;
      validation.isValid = false;
    }
  });

  return validation;
}

/**
 * Generate a unique product ID based on category and index
 */
function generateProductId(category: ProductCategory, index: number): string {
  const categoryPrefixes = {
    concrete: 'CON',
    wood: 'WOD', 
    ceramic: 'CER',
    custom: 'CUS'
  };
  
  const prefix = categoryPrefixes[category];
  const paddedIndex = (index + 1).toString().padStart(3, '0');
  return `LL-${prefix}-${paddedIndex}`;
}

/**
 * Convert Excel data to Product objects
 */
export function convertToProducts(data: any[][], mapping: ImportMapping): Partial<Product>[] {
  const products: Partial<Product>[] = [];
  const headers = data[0] || [];
  
  // Process each data row (skip header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const product: Partial<Product> = {
      id: '', // Will be generated later
      images: { main: '/images/products/placeholder.jpg' }, // Default placeholder
      features: [], // Default empty features
      inStock: true // Default to in stock
    };
    
    // Store dimension values separately to combine them
    const dimensions: { height?: string; diameter?: string; weight?: string } = {};
    
    Object.entries(mapping).forEach(([excelCol, field]) => {
      const colIndex = headers.indexOf(excelCol);
      const cellValue = row[colIndex];
      
      if (cellValue === undefined || cellValue === null) return;
      
      switch (field) {
        case 'name':
        case 'description':
          product[field] = cellValue.toString().trim();
          break;
          
        case 'category':
          // Validate category exists
          const categoryValue = cellValue.toString().toLowerCase().trim();
          if (['concrete', 'wood', 'ceramic', 'custom'].includes(categoryValue)) {
            product.category = categoryValue as ProductCategory;
          } else {
            product.category = 'concrete'; // Default fallback
          }
          break;
          
        case 'price':
          const numValue = Number(cellValue);
          if (!isNaN(numValue)) {
            product[field] = numValue;
          }
          break;
          
        case 'inStock':
          const stockValue = cellValue.toString().toLowerCase().trim();
          product.inStock = stockValue === 'true' || stockValue === 'yes' || stockValue === '1';
          break;
          
        case 'features':
          if (cellValue.toString().trim()) {
            product.features = cellValue.toString().split(',').map((f: string) => f.trim()).filter(Boolean);
          }
          break;
          
        case 'height':
        case 'diameter':
        case 'weight':
          dimensions[field] = cellValue.toString().trim();
          break;
          
        case 'mainImage':
          const imageUrl = cellValue.toString().trim();
          if (imageUrl) {
            product.images = {
              main: imageUrl,
              gallery: product.images?.gallery || []
            };
          }
          break;
          
        case 'galleryImages':
          if (cellValue.toString().trim()) {
            const galleryUrls = cellValue.toString().split(',').map((url: string) => url.trim()).filter(Boolean);
            if (galleryUrls.length > 0) {
              product.images = {
                main: product.images?.main || '/images/products/placeholder.jpg',
                gallery: galleryUrls
              };
            }
          }
          break;
      }
    });
    
    // Combine dimensions if any were provided
    if (dimensions.height || dimensions.diameter || dimensions.weight) {
      product.dimensions = {
        height: dimensions.height || '',
        diameter: dimensions.diameter || '',
        weight: dimensions.weight
      };
    }
    
    // Generate ID if we have required fields
    if (product.name && product.category) {
      product.id = generateProductId(product.category, products.length);
    }
    
    products.push(product);
  }
  
  return products;
}

/**
 * Create preview of import with validation
 */
export function createImportPreview(data: any[][], mapping: ImportMapping): ImportPreview {
  const validation = validateProductData(data, mapping);
  const products = convertToProducts(data, mapping);
  
  return {
    products,
    validation,
    totalRows: data.length - 1, // Exclude header
    validRows: products.filter(p => p.id).length
  };
}

/**
 * Generate Excel template for Limen Lakay products
 */
export function generateExcelTemplate(): { data: any[][]; filename: string } {
  const headers = EXCEL_COLUMNS.map(col => col.label);
  
  // Add sample data to help users understand the format
  const sampleData = [
    [
      'Vanilla Bliss Candle',
      'A soothing vanilla-scented candle perfect for relaxation and creating a cozy atmosphere.',
      'concrete',
      '25.99',
      'true',
      'Long-lasting, Natural wax, Hand-poured, Eco-friendly',
      '4 inches',
      '3.5 inches',
      '1.2 lbs',
      '/images/products/concrete/LL-CON-004-main.jpg',
      '/images/products/concrete/LL-CON-004-side.jpg, /images/products/concrete/LL-CON-004-top.jpg'
    ],
    [
      'Lavender Dreams Candle',
      'Calming lavender scented candle ideal for bedtime relaxation and stress relief.',
      'wood',
      '28.99',
      'true',
      'Aromatherapy, Natural wax, 8-hour burn time',
      '5 inches',
      '3 inches',
      '',
      '/images/products/wood/LL-WOD-004-main.jpg',
      '/images/products/wood/LL-WOD-004-gallery1.jpg'
    ]
  ];
  
  const data = [headers, ...sampleData];
  const filename = 'limen_lakay_products_template.xlsx';
  
  return { data, filename };
}

/**
 * Export data to Excel file for download
 */
export function exportToExcel(data: any[][], filename: string): void {
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  
  // Set column widths for better readability
  const colWidths = [
    { width: 25 }, // Product Name
    { width: 50 }, // Description
    { width: 15 }, // Category
    { width: 10 }, // Price
    { width: 12 }, // In Stock
    { width: 30 }, // Features
    { width: 12 }, // Height
    { width: 12 }, // Diameter
    { width: 12 }, // Weight
    { width: 35 }, // Main Image URL
    { width: 50 }  // Gallery Images
  ];
  ws['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  XLSX.writeFile(wb, filename);
}