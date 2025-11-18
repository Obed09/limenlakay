'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, X, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  parseExcelFile,
  detectColumnMapping,
  createImportPreview,
  generateExcelTemplate,
  exportToExcel,
  EXCEL_COLUMNS,
  ImportMapping,
  ImportPreview,
  ExcelImportColumn
} from '../lib/excel-import';

interface BulkImportProps {
  onImportComplete?: (products: any[]) => void;
  className?: string;
}

export default function BulkImport({ onImportComplete, className }: BulkImportProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[][]>([]);
  const [mapping, setMapping] = useState<ImportMapping>({});
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const [importing, setImporting] = useState(false);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle dropped files
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.includes('sheet')) {
      processFile(droppedFile);
    }
  }, []);

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  // Process uploaded file
  const processFile = async (file: File) => {
    try {
      setFile(file);
      const data = await parseExcelFile(file);
      setExcelData(data);
      
      if (data.length > 0) {
        const autoMapping = detectColumnMapping(data[0]);
        setMapping(autoMapping);
        setStep('mapping');
      }
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert('Error parsing Excel file. Please make sure it\'s a valid Excel file.');
    }
  };

  // Update column mapping
  const updateMapping = (excelColumn: string, field: ExcelImportColumn['field'] | '') => {
    setMapping(prev => {
      const newMapping = { ...prev };
      if (field === '') {
        delete newMapping[excelColumn];
      } else {
        newMapping[excelColumn] = field;
      }
      return newMapping;
    });
  };

  // Generate preview
  const generatePreview = () => {
    const previewData = createImportPreview(excelData, mapping);
    setPreview(previewData);
    setStep('preview');
  };

  // Download Excel template
  const downloadTemplate = () => {
    const { data, filename } = generateExcelTemplate();
    exportToExcel(data, filename);
  };

  // Import products
  const importProducts = async () => {
    if (!preview || !preview.validation.isValid) return;
    
    setImporting(true);
    setStep('importing');
    
    try {
      // Send to API endpoint
      const response = await fetch('/api/products/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: preview.products,
          filename: file?.name
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onImportComplete?.(result.products);
        resetImport();
      } else {
        throw new Error('Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  // Reset import process
  const resetImport = () => {
    setFile(null);
    setExcelData([]);
    setMapping({});
    setPreview(null);
    setStep('upload');
    setImporting(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bulk Product Import
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload an Excel file to import multiple products at once
          </p>
        </div>
        <Button
          onClick={downloadTemplate}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download Template</span>
        </Button>
      </div>

      {/* Step 1: File Upload */}
      {step === 'upload' && (
        <Card className="p-8">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 transition-colors text-center
              ${dragActive 
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Drop your Excel file here
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Or click to browse and select a file
                </p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p><strong>Supported formats:</strong> Excel (.xlsx, .xls)</p>
            <p><strong>Expected columns:</strong> Product Name, Description, Category, Price, Features, etc.</p>
            <p><strong>Tip:</strong> Download our template for the exact format</p>
          </div>
        </Card>
      )}

      {/* Step 2: Column Mapping */}
      {step === 'mapping' && excelData.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Map Columns
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {file?.name} ({excelData.length - 1} rows)
                </span>
                <Button onClick={resetImport} variant="outline" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400">
              Map your Excel columns to product fields. Required fields are marked with an asterisk.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {excelData[0]?.map((header: string, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {header}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Sample: {excelData[1]?.[index] || 'No data'}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <select
                    value={mapping[header] || ''}
                    onChange={(e) => updateMapping(header, e.target.value as any)}
                    className="border rounded px-3 py-2 text-sm min-w-[160px] bg-white dark:bg-gray-800"
                  >
                    <option value="">-- Not Mapped --</option>
                    {EXCEL_COLUMNS.map((col) => (
                      <option key={col.field} value={col.field}>
                        {col.label} {col.required ? '*' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button onClick={resetImport} variant="outline">
                Cancel
              </Button>
              <Button 
                onClick={generatePreview}
                disabled={Object.keys(mapping).length === 0}
              >
                Generate Preview
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Preview & Validation */}
      {step === 'preview' && preview && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Import Preview
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant={preview.validation.isValid ? "default" : "destructive"}>
                  {preview.validation.isValid ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Valid</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 mr-1" /> Errors Found</>
                  )}
                </Badge>
                <Button onClick={() => setStep('mapping')} variant="outline" size="sm">
                  Back to Mapping
                </Button>
              </div>
            </div>

            {/* Validation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {preview.totalRows}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Rows</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {preview.validRows}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Valid Products</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {Object.keys(preview.validation.rowErrors).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
              </div>
            </div>

            {/* Validation Errors */}
            {preview.validation.errors.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Import Errors:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                  {preview.validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Row Errors */}
            {Object.keys(preview.validation.rowErrors).length > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg max-h-60 overflow-y-auto">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Row Errors:
                </h4>
                {Object.entries(preview.validation.rowErrors).map(([row, errors]) => (
                  <div key={row} className="mb-2">
                    <div className="font-medium text-yellow-800 dark:text-yellow-200">
                      Row {row}:
                    </div>
                    <ul className="list-disc list-inside ml-4 text-yellow-700 dark:text-yellow-300">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Product Preview */}
            <div className="max-h-80 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Price</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {preview.products.slice(0, 10).map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {product.name || 'Missing Name'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {product.category || 'Missing Category'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        ${product.price || 'Missing Price'}
                      </td>
                      <td className="px-4 py-3">
                        {preview.validation.rowErrors[index + 2] ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : (
                          <Badge variant="default">Valid</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.products.length > 10 && (
                <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400 border-t">
                  ... and {preview.products.length - 10} more products
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button onClick={resetImport} variant="outline">
                Cancel
              </Button>
              <Button 
                onClick={importProducts}
                disabled={!preview.validation.isValid || importing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {importing ? 'Importing...' : `Import ${preview.validRows} Products`}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Importing */}
      {step === 'importing' && (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Importing Products...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we process your products. This may take a few moments.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}