'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Upload, Edit2, Save, X, RefreshCw } from 'lucide-react';
import { getVisibleVessels, getVesselImages, VesselStyle } from '@/lib/vessel-data';
import { getQuestionnaireContent, QuestionnaireContent } from '@/lib/questionnaire-data';

interface BulkOrderQuestionnaireProps {
  adminMode?: boolean;
}

export default function BulkOrderQuestionnaire({ adminMode = false }: BulkOrderQuestionnaireProps) {
  const [clientImages, setClientImages] = useState<{[key: string]: string}>({});
  const [vesselStyles, setVesselStyles] = useState<VesselStyle[]>([]);
  const [adminImages, setAdminImages] = useState<{[key: string]: string}>({});
  const [content, setContent] = useState<QuestionnaireContent | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  // Load vessel data and content on component mount
  useEffect(() => {
    setVesselStyles(getVisibleVessels());
    setAdminImages(getVesselImages());
    setContent(getQuestionnaireContent());
  }, []);

  // Listen for vessel data changes (from vessel manager)
  useEffect(() => {
    const handleVesselDataChanged = () => {
      console.log('Vessel data changed - refreshing...');
      setVesselStyles(getVisibleVessels());
      setAdminImages(getVesselImages());
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && adminMode) {
        console.log('Page became visible - refreshing vessel data...');
        setVesselStyles(getVisibleVessels());
        setAdminImages(getVesselImages());
      }
    };

    window.addEventListener('vesselDataChanged', handleVesselDataChanged);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVesselDataChanged); // Refresh on window focus
    
    return () => {
      window.removeEventListener('vesselDataChanged', handleVesselDataChanged);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVesselDataChanged);
    };
  }, [adminMode]);

  // Refresh vessel data when in admin mode (for live updates)
  useEffect(() => {
    if (adminMode) {
      const interval = setInterval(() => {
        setVesselStyles(getVisibleVessels());
        setAdminImages(getVesselImages());
      }, 2000); // Check for updates every 2 seconds

      return () => clearInterval(interval);
    }
  }, [adminMode]);

  const handleImageUpload = (styleId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setClientImages(prev => ({
          ...prev,
          [styleId]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (styleId: string, event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setClientImages(prev => ({
          ...prev,
          [styleId]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Admin editing functions
  const startEdit = (field: string, currentValue: string) => {
    setEditing(field);
    setEditValue(currentValue);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue('');
  };

  const saveEdit = () => {
    if (!editing || !content) return;
    
    const updatedContent = { ...content };
    
    if (editing === 'title') {
      updatedContent.title = editValue;
    } else if (editing === 'subtitle') {
      updatedContent.subtitle = editValue;
    } else if (editing === 'logoText') {
      updatedContent.logoText = editValue;
    }
    
    // Save to localStorage (simplified for now)
    if (typeof window !== 'undefined') {
      localStorage.setItem('limen-lakay-questionnaire-data', JSON.stringify(updatedContent));
    }
    
    setContent(updatedContent);
    setEditing(null);
    setEditValue('');
  };

  // Refresh vessel data manually
  const refreshVesselData = () => {
    setVesselStyles(getVisibleVessels());
    setAdminImages(getVesselImages());
    console.log('Vessel data refreshed');
  };

  // Render editable text
  const renderEditableText = (field: string, value: string, className: string = '') => {
    // Force no editing for non-admin mode
    if (!adminMode) {
      return <span className={className}>{value}</span>;
    }

    const isEditing = editing === field;

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`${className} border border-blue-300 rounded px-2 py-1 bg-blue-50`}
            autoFocus
          />
          <Button
            size="sm"
            onClick={saveEdit}
            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={cancelEdit}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 group">
        <span className={className}>{value}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => startEdit(field, value)}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-yellow-100 hover:bg-yellow-200 border border-yellow-300"
          title="Click to edit (Admin only)"
        >
          <Edit2 className="h-3 w-3 text-yellow-700" />
        </Button>
      </div>
    );
  };

  const generatePDF = () => {
    // Load html2pdf library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    
    script.onload = () => {
      console.log('Starting PDF generation...');
      
      const element = document.querySelector('.pdf-container');
      if (!element) {
        console.error('PDF container not found');
        alert('Error: Could not find content to convert to PDF');
        return;
      }

      // Wait a moment for any images to load
      setTimeout(() => {
        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: 'LimenLakay_Bulk_Order_Questionnaire.pdf',
          image: { 
            type: 'jpeg', 
            quality: 0.95
          },
          html2canvas: { 
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            removeContainer: true
          },
          jsPDF: { 
            unit: 'in', 
            format: 'letter', 
            orientation: 'portrait',
            compress: true
          }
        };

        try {
          // @ts-ignore
          html2pdf()
            .set(opt)
            .from(element)
            .toPdf()
            .get('pdf')
            .then((pdf: any) => {
              console.log('PDF generated successfully');
              pdf.save('LimenLakay_Bulk_Order_Questionnaire.pdf');
            })
            .catch((error: any) => {
              console.error('PDF generation failed:', error);
              alert('Failed to generate PDF. Please try again.');
            });
        } catch (error) {
          console.error('HTML2PDF error:', error);
          alert('PDF generation error. Please refresh the page and try again.');
        }
      }, 1000);
    };

    script.onerror = () => {
      console.error('Failed to load html2pdf library');
      alert('Failed to load PDF library. Please check your internet connection.');
    };

    document.head.appendChild(script);
  };

  // Alternative PDF generation using browser print
  const generatePrintPDF = () => {
    const printContent = document.querySelector('.pdf-container')?.cloneNode(true) as HTMLElement;
    if (!printContent) {
      alert('Error: Could not find content to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups and try again');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Limen Lakay Bulk Order Questionnaire</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.5in;
            background: white;
          }
          .pdf-container {
            background: white;
            box-shadow: none;
            border-radius: 0;
            padding: 0;
          }
          @media print {
            body { margin: 0; padding: 0.5in; }
            .no-print { display: none; }
          }
          h1, h2, h3, h4 { color: #5D4037; }
          .bg-\\[\\#8B6F47\\] { background-color: #8B6F47 !important; }
          .text-white { color: white !important; }
          .border-\\[\\#8B6F47\\] { border-color: #8B6F47 !important; }
          .text-\\[\\#5D4037\\] { color: #5D4037 !important; }
          .rounded-xl, .rounded-lg, .rounded { border-radius: 8px; }
          .shadow-lg { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .mb-8 { margin-bottom: 2rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .p-8 { padding: 2rem; }
          .p-6 { padding: 1.5rem; }
          .p-4 { padding: 1rem; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .gap-6 { gap: 1.5rem; }
          .gap-4 { gap: 1rem; }
          .space-y-6 > * + * { margin-top: 1.5rem; }
          .space-y-4 > * + * { margin-top: 1rem; }
          .space-y-2 > * + * { margin-top: 0.5rem; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .text-center { text-align: center; }
          .text-sm { font-size: 0.875rem; }
          .text-xs { font-size: 0.75rem; }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          input[type="text"], input[type="number"], textarea {
            border: 1px solid #ddd;
            border-bottom: 2px solid #8B6F47;
            padding: 0.5rem;
            width: 100%;
            background: transparent;
          }
          input[type="checkbox"], input[type="radio"] {
            margin-right: 0.5rem;
          }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#f9f5f0] py-8">
      <div className="pdf-container max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 flex items-center justify-center">
              {/* Enhanced Circular Logo matching the uploaded design */}
              <div className="w-28 h-28 rounded-full flex items-center justify-center border-4 border-[#DAA520] shadow-xl relative bg-gradient-to-br from-[#F5F5DC] to-[#FFFACD] overflow-hidden">
                {/* Outer ring text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Top arc text: LIMEN LAKAY */}
                    <path id="top-arc" d="M 15 50 A 35 35 0 0 1 85 50" fill="none" />
                    <text className="fill-[#DAA520] text-[8px] font-bold tracking-wider">
                      <textPath href="#top-arc" startOffset="50%" textAnchor="middle">
                        LIMEN LAKAY
                      </textPath>
                    </text>
                    
                    {/* Bottom arc text: CANDLES */}
                    <path id="bottom-arc" d="M 85 50 A 35 35 0 0 1 15 50" fill="none" />
                    <text className="fill-[#DAA520] text-[8px] font-bold tracking-wider">
                      <textPath href="#bottom-arc" startOffset="50%" textAnchor="middle">
                        CANDLES
                      </textPath>
                    </text>
                  </svg>
                </div>
                
                {/* Center LL monogram */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[#DAA520] text-3xl font-bold font-serif italic transform">
                    LL
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#5D4037] font-serif mb-2">
            {renderEditableText('title', content?.title || '📋 BULK ORDER CLIENT QUESTIONNAIRE', 'text-4xl font-bold text-[#5D4037] font-serif')}
          </h1>
          <h2 className="text-xl text-[#8D6E63] mb-2">
            {renderEditableText('subtitle', content?.subtitle || 'Limen Lakay LLC - Custom Order Information', 'text-xl text-[#8D6E63]')}
          </h2>
          {adminMode && (
            <div className="mt-4 flex items-center justify-center space-x-4">
              <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded px-3 py-1">
                🎨 Admin Mode: Hover over text to edit | Loaded: {vesselStyles.length} vessels
              </div>
              <Button
                onClick={refreshVesselData}
                size="sm"
                variant="outline"
                className="text-xs border-green-500 text-green-600 hover:bg-green-50"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh Vessels ({vesselStyles.length})
              </Button>
            </div>
          )}
          <hr className="border-2 border-[#8B6F47] my-6" />
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-semibold mb-1">Date:</label>
            <input 
              type="text" 
              defaultValue={new Date().toLocaleDateString()}
              className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Client Name:</label>
            <input 
              type="text" 
              className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Business/Organization Name (if applicable):</label>
            <input 
              type="text" 
              className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
            />
          </div>
        </div>

        {/* Section 1: Order Details */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 1: ORDER DETAILS & QUANTITIES
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">1.1 What is your desired order quantity?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>50-100 candles</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>101-200 candles</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>201-500 candles</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>500+ candles</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>vessels</span>
                </label>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Exact quantity (if known):</label>
                <input 
                  type="text" 
                  className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">1.2 Is this a one-time order, or do you anticipate recurring orders?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>One-time order</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Recurring orders (monthly, quarterly, etc.)</span>
                </label>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">If recurring, estimated frequency:</label>
                <input 
                  type="text" 
                  className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">1.3 When do you need this order delivered by? (Note: Standard lead time is 2 months)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target delivery date:</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Is this date flexible?</span>
                    <input type="radio" name="flexible" value="yes" />
                    <span className="text-sm">Yes</span>
                    <input type="radio" name="flexible" value="no" />
                    <span className="text-sm">No</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Is this a rush order?</span>
                    <input type="radio" name="rush" value="yes" />
                    <span className="text-sm">Yes</span>
                    <input type="radio" name="rush" value="no" />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Product Specifications */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 2: PRODUCT SPECIFICATIONS
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">2.1 What candle size(s) are you interested in?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Small (4-6 oz)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Medium (8-10 oz)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Large (12-16 oz)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Multiple sizes (please specify):</span>
                </label>
              </div>
              <input 
                type="text" 
                className="w-full p-2 mt-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
              />
            </div>

            <div>
              <h4 className="font-semibold mb-3">2.2 Container/Vessel preference</h4>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>Cement vessels</span>
              </label>
            </div>

            <div>
              <h4 className="font-semibold mb-3">2.3 What scent(s) would you like?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Choose from your existing collection (which ones?):</span>
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 ml-6 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                />
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Custom scent blend (describe):</span>
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 ml-6 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                />
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Unscented</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Multiple scents (please specify breakdown):</span>
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 ml-6 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">2.4 Color preferences?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Natural/cream (no added color)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Specific colors (list):</span>
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 ml-6 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                />
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Match my brand colors (provide color codes):</span>
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 ml-6 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">2.5 Finish/Style preferences?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Plain/smooth</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Marble effect</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Gold flakes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Dried flowers/botanicals</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Layered colors</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Other special effects:</span>
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 ml-6 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Vessel Selection (Keeping as requested) */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 3: VESSEL/CONTAINER SELECTION
          </div>

          <Card className="p-3 mb-6 bg-[#FFF8E1] border-l-4 border-[#FFB300]">
            <p className="text-sm">
              <strong>Instructions:</strong> Click or drag & drop images of vessel styles you like. 
              Check the box and enter quantity for each style you want to order.
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vesselStyles.map((vessel) => (
              <Card key={vessel.id} className="p-4 border-2 border-dashed border-gray-300 hover:border-[#8B6F47] transition-colors">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="absolute top-0 left-0 z-10"
                  />
                  <div className="text-center mb-3">
                    <strong>{vessel.name}</strong>
                  </div>
                  
                  <div
                    className="w-full h-48 border-2 border-dashed border-gray-400 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#8B6F47] transition-colors mb-3"
                    onClick={() => fileInputRefs.current[vessel.id]?.click()}
                    onDrop={(e) => handleDrop(vessel.id, e)}
                    onDragOver={handleDragOver}
                  >
                    {clientImages[vessel.id] || adminImages[vessel.id] ? (
                      <img 
                        src={clientImages[vessel.id] || adminImages[vessel.id]} 
                        alt={vessel.name}
                        className="max-w-full max-h-full rounded-md object-contain"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click or Drag Image Here</p>
                        <p className="text-xs text-gray-400">Drop your image or click to browse</p>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => {
                      fileInputRefs.current[vessel.id] = el;
                    }}
                    onChange={(e) => handleImageUpload(vessel.id, e)}
                    className="hidden"
                  />
                  
                  <p className="text-xs text-gray-600 mb-3 min-h-[60px]">
                    {vessel.description}
                  </p>
                  
                  <div className="flex items-center justify-center">
                    <label className="text-sm font-medium mr-2">Quantity:</label>
                    <input 
                      type="number" 
                      defaultValue={0}
                      min={0}
                      className="w-20 p-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Section 4: Customization & Branding */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 4: CUSTOMIZATION & BRANDING
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">4.1 Do you want custom labels or branding?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Yes, custom labels with our branding</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Yes, but use Limen Lakay branding</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>No labels needed</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Private labeling (completely custom)</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">4.2 If custom branding, please provide:</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Business/brand name:</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Logo (attach file or describe):</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color scheme/brand colors:</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Any specific text/messaging:</label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-md h-20 resize-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">4.3 Packaging preferences?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Individual boxes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Bulk packaging</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Gift packaging</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Custom packaging design</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Eco-friendly packaging only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Budget & Pricing */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 5: BUDGET & PRICING
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">5.1 What's your budget range for this order?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Under $500</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>$500 - $1,000</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>$1,000 - $2,500</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>$2,500 - $5,000</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>$5,000+</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Price per unit is more important than total budget</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">5.2 Have you researched bulk candle pricing elsewhere?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="pricing" value="yes" />
                  <span>Yes, I have quotes from other suppliers</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="pricing" value="no" />
                  <span>No, Limen Lakay is my first inquiry</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="pricing" value="some" />
                  <span>I've done some basic research</span>
                </label>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">If yes, what price range have you found? (This helps us provide competitive pricing)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">5.3 Payment preferences?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>50% deposit, 50% on completion</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Payment plan options</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Full payment upfront (if discount available)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Net 30 terms (established businesses)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Timeline & Project Details */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 6: TIMELINE & PROJECT DETAILS
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">6.1 What's the intended use for these candles?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Retail resale</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Corporate gifts/events</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Wedding favors</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Party/event favors</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Personal use/gifts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Hotel/hospitality amenities</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Spa/wellness center</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Other:</span>
                </label>
              </div>
              <input 
                type="text" 
                placeholder="Please describe the intended use"
                className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none mt-3"
              />
            </div>

            <div>
              <h4 className="font-semibold mb-3">6.2 Are you flexible with the timeline?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="timeline" value="flexible" />
                  <span>Yes, very flexible - quality is most important</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="timeline" value="somewhat" />
                  <span>Somewhat flexible - have some wiggle room</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="timeline" value="firm" />
                  <span>Firm deadline - cannot be late</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">6.3 Do you need a rush order? (Additional fees apply)</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="rush" value="yes" />
                  <span>Yes, willing to pay rush fees</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="rush" value="no" />
                  <span>No, standard timeline is fine</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="rush" value="maybe" />
                  <span>Depends on cost - please provide rush pricing</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: Samples & Quality */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 7: SAMPLES & QUALITY ASSURANCE
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">7.1 Would you like samples before placing the full order?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="samples" value="yes" />
                  <span>Yes, definitely need samples first</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="samples" value="no" />
                  <span>No, ready to proceed based on description</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="samples" value="maybe" />
                  <span>Maybe - depends on pricing and lead time</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">7.2 If samples are needed, how many styles/scents?</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Number of vessel styles:</label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of scent samples:</label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">7.3 Quality priorities (rank in order of importance):</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Scent throw/strength</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Burn time/longevity</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Visual appearance/aesthetics</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Eco-friendly/sustainable materials</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Price point</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Consistency across batch</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 8: Special Requirements */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 8: SPECIAL REQUIREMENTS & CERTIFICATIONS
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">8.1 Do you have any specific requirements?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Vegan products only</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Soy wax only (no paraffin)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Lead-free wicks required</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Phthalate-free fragrances</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Cruelty-free certification</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Organic ingredients preferred</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Allergen-free options</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">8.2 Any ingredients or materials to avoid?</h4>
              <textarea 
                placeholder="Please list any specific ingredients, materials, or allergens to avoid"
                className="w-full p-2 border border-gray-300 rounded-md h-20 resize-none"
              />
            </div>

            <div>
              <h4 className="font-semibold mb-3">8.3 Do you need any certifications or documentation?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Certificate of Analysis (COA)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Material Safety Data Sheet (MSDS)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Ingredient list documentation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Insurance/liability documentation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Business license verification</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 9: Terms & Conditions */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 9: TERMS & CONDITIONS UNDERSTANDING
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">9.1 Order terms acknowledgment:</h4>
              <div className="space-y-3">
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I understand that bulk orders require a 50% non-refundable deposit to begin production</span>
                </label>
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I understand the standard lead time is 2 months from deposit receipt</span>
                </label>
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I understand that changes to the order after production begins may incur additional fees</span>
                </label>
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I understand that custom orders are final sale (no returns/exchanges)</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">9.2 Quality assurance:</h4>
              <div className="space-y-3">
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I understand that handmade products may have slight variations</span>
                </label>
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I understand that color variations may occur between batches</span>
                </label>
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I agree to inspect products within 48 hours of delivery and report any issues</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">9.3 Shipping and delivery:</h4>
              <div className="space-y-3">
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I understand that shipping costs are additional and calculated based on weight/distance</span>
                </label>
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I understand that delivery timing may be affected by shipping carrier delays</span>
                </label>
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I will provide accurate delivery address and be available to receive shipment</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 10: Production Capacity */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 10: PRODUCTION CAPACITY & SCHEDULING
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">10.1 How did you hear about Limen Lakay?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Social media (Instagram, Facebook, etc.)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Google search</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Word of mouth/referral</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Previous customer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Local market/craft fair</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Online marketplace (Etsy, etc.)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Other:</span>
                </label>
              </div>
              <input 
                type="text" 
                placeholder="Please specify"
                className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none mt-3"
              />
            </div>

            <div>
              <h4 className="font-semibold mb-3">10.2 Have you ordered bulk candles before?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="experience" value="first-time" />
                  <span>First-time bulk order</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="experience" value="experienced" />
                  <span>Experienced with bulk orders</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="experience" value="some" />
                  <span>Some experience with bulk orders</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">10.3 What's most important for this partnership?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Competitive pricing</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Consistent quality</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Reliable delivery times</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Good communication</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Flexibility with changes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Supporting small business</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Eco-friendly practices</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 11: Communication Preferences */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 11: COMMUNICATION & PROJECT MANAGEMENT
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">11.1 Preferred communication method:</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Email</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Phone calls</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Text messaging</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Video calls (for complex orders)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Project management platform</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">11.2 Update frequency preference:</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="updates" value="weekly" />
                  <span>Weekly progress updates</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="updates" value="bi-weekly" />
                  <span>Bi-weekly check-ins</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="updates" value="milestones" />
                  <span>Only at major milestones</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="updates" value="minimal" />
                  <span>Minimal communication - just start and finish</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">11.3 Best times to contact you:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Time zone:</label>
                  <input 
                    type="text" 
                    placeholder="EST, PST, etc."
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Best hours:</label>
                  <input 
                    type="text" 
                    placeholder="9am-5pm, evenings, etc."
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">11.4 Decision maker information:</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Who makes final decisions on this project?</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Their contact information (if different):</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">How long does your approval process typically take?</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border-b-2 border-gray-300 bg-transparent focus:border-[#8B6F47] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 12: Additional Information */}
        <div className="mb-8 pt-6 border-t-4 border-[#8B6F47]">
          <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
            SECTION 12: ADDITIONAL INFORMATION & FINAL DETAILS
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">12.1 Anything else we should know about your project?</h4>
              <textarea 
                placeholder="Special considerations, unique requirements, inspiration, or any other details that would help us create the perfect candles for you..."
                className="w-full p-3 border border-gray-300 rounded-md h-32 resize-none"
              />
            </div>

            <div>
              <h4 className="font-semibold mb-3">12.2 Questions for Limen Lakay?</h4>
              <textarea 
                placeholder="Any questions about our process, capabilities, pricing, timeline, etc.?"
                className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
              />
            </div>

            <div>
              <h4 className="font-semibold mb-3">12.3 How did you envision working together?</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>One-time project</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Ongoing partnership</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Seasonal orders</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Test order first, then larger orders</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>White-label/private label partnership</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">12.4 Final checklist:</h4>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I have completed all relevant sections of this questionnaire</span>
                </label>
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I have uploaded any reference images to Section 3</span>
                </label>
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I understand this is an inquiry and not a binding order</span>
                </label>
                <label className="flex items-start space-x-2">
                  <input type="checkbox" className="rounded mt-1" />
                  <span className="text-sm">I am ready to move forward with samples and/or quotes</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center pt-8 border-t-4 border-[#8B6F47]">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#5D4037] mb-2">
              {content?.footer.thankYouTitle || 'Thank You for Your Interest!'}
            </h3>
            <p className="text-[#8D6E63] mb-4">
              {content?.footer.thankYouMessage || "We're excited about the possibility of working together to create beautiful, eco-friendly candles for your project."}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={generatePDF}
              className="bg-[#8B6F47] hover:bg-[#6F5539] text-white px-8 py-3 text-lg font-semibold flex items-center gap-2"
            >
              <Download size={20} />
              Generate & Download PDF
            </Button>
            <Button 
              onClick={generatePrintPDF}
              variant="outline"
              className="border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47] hover:text-white px-8 py-3 text-lg font-semibold flex items-center gap-2"
            >
              🖨️ Print to PDF
            </Button>
          </div>

          <div className="mt-6 p-4 bg-[#E8F5E8] rounded-lg border-l-4 border-[#4CAF50]">
            <p className="text-sm font-semibold text-[#2E7D32]">
              {content?.footer.nextStepsTitle || 'Next Steps:'}
            </p>
            <div className="text-sm text-[#2E7D32] mt-1">
              {content?.footer.nextSteps?.map((step, index) => (
                <div key={index}>{index + 1}. {step}</div>
              )) || (
                <>
                  <div>1. Download this completed PDF</div>
                  <div>2. Email it to: <strong>info@limenlakay.com</strong></div>
                  <div>3. We'll respond within 24-48 hours with a custom quote and timeline</div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            {content?.footer.contactInfo?.map((info, index) => (
              <p key={index}>{info}</p>
            )) || (
              <>
                <p>Limen Lakay LLC • Handmade Eco-Friendly Candles</p>
                <p>📧 info@limenlakay.com • 🌐 www.limenlakay.com</p>
              </>
            )}
            <p className="mt-2 italic">{content?.footer.tagline || '"Illuminating spaces, naturally."'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}