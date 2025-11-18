'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DebugPage() {
  const [vesselData, setVesselData] = useState<any>(null);
  const [imageData, setImageData] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  useEffect(() => {
    // Check localStorage data
    try {
      const vessels = localStorage.getItem('limen-lakay-vessels');
      const images = localStorage.getItem('limen-lakay-vessel-images');
      
      setVesselData(vessels ? JSON.parse(vessels) : null);
      setImageData(images ? JSON.parse(images) : null);
      
      // Calculate storage usage
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += new Blob([value]).size;
          }
        }
      }
      
      setStorageInfo({
        totalSize: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        itemCount: localStorage.length,
        vesselSize: vessels ? new Blob([vessels]).size : 0,
        imageSize: images ? new Blob([images]).size : 0
      });
      
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
  }, []);

  const clearStorage = () => {
    if (confirm('Clear all localStorage data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const testPDF = () => {
    // Create a simple test element
    const testDiv = document.createElement('div');
    testDiv.innerHTML = `
      <h1>PDF Test</h1>
      <p>This is a test PDF generation</p>
      <p>Current time: ${new Date().toLocaleString()}</p>
    `;
    testDiv.style.padding = '20px';
    testDiv.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(testDiv);

    // Load html2pdf library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      const opt = {
        margin: 0.5,
        filename: 'test-pdf.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      // @ts-ignore
      html2pdf().set(opt).from(testDiv).save().then(() => {
        document.body.removeChild(testDiv);
        console.log('PDF generated successfully');
      });
    };
    script.onerror = () => {
      console.error('Failed to load html2pdf library');
      document.body.removeChild(testDiv);
    };
    document.head.appendChild(script);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Debug Information</h1>
          <div className="flex gap-4 mb-6">
            <Button onClick={() => window.location.reload()}>Refresh Data</Button>
            <Button onClick={clearStorage} variant="outline">Clear Storage</Button>
            <Button onClick={testPDF} className="bg-green-600 hover:bg-green-700">Test PDF Generation</Button>
          </div>
        </div>

        {/* Storage Information */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Storage Information</h2>
          {storageInfo && (
            <div className="space-y-2">
              <p><strong>Total Storage:</strong> {storageInfo.totalSizeMB}MB</p>
              <p><strong>Items Count:</strong> {storageInfo.itemCount}</p>
              <p><strong>Vessel Data Size:</strong> {(storageInfo.vesselSize / 1024).toFixed(2)}KB</p>
              <p><strong>Image Data Size:</strong> {(storageInfo.imageSize / (1024 * 1024)).toFixed(2)}MB</p>
            </div>
          )}
        </Card>

        {/* Vessel Data */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Vessel Data</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <pre>{JSON.stringify(vesselData, null, 2)}</pre>
          </div>
        </Card>

        {/* Image Data */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Image Data</h2>
          <div className="space-y-4">
            {imageData && Object.keys(imageData).length > 0 ? (
              Object.entries(imageData).map(([key, value]) => (
                <div key={key} className="border p-4 rounded">
                  <h3 className="font-semibold mb-2">Vessel ID: {key}</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-32 border border-gray-300 rounded flex-shrink-0">
                      <img 
                        src={value as string} 
                        alt={`Vessel ${key}`}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          console.error(`Failed to load image for ${key}`);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <p><strong>Data size:</strong> {Math.round((value as string).length / 1024)}KB</p>
                      <p><strong>Format:</strong> {(value as string).startsWith('data:image/jpeg') ? 'JPEG' : 'Other'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No image data found</p>
            )}
          </div>
        </Card>

        {/* LocalStorage Keys */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">All LocalStorage Keys</h2>
          <div className="space-y-1">
            {Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
              .filter(Boolean)
              .map(key => (
                <div key={key} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <span>{key}</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(localStorage.getItem(key!)!.length / 1024)}KB
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}