'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Edit, Trash2, Plus, Save, X, Eye, EyeOff } from 'lucide-react';
import { 
  VesselStyle, 
  getVessels, 
  getVesselImages, 
  saveVessels, 
  saveVesselImages,
  exportVesselData,
  importVesselData,
  clearVesselData
} from '@/lib/vessel-data';

export default function VesselManager() {
  const [vessels, setVessels] = useState<VesselStyle[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [images, setImages] = useState<{[key: string]: string}>({});
  const [saveStatus, setSaveStatus] = useState<{[key: string]: 'saving' | 'saved' | 'error'}>({});
  const [recoveryStatus, setRecoveryStatus] = useState<string | null>(null);
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  const [showPreview, setShowPreview] = useState(false);

  // Load data on component mount
  useEffect(() => {
    setVessels(getVessels());
    const loadedImages = getVesselImages();
    setImages(loadedImages);
    
    // Check if any images were recovered
    const imageCount = Object.keys(loadedImages).length;
    if (imageCount > 0) {
      setRecoveryStatus(`✅ Successfully loaded ${imageCount} vessel images`);
      setTimeout(() => setRecoveryStatus(null), 5000); // Clear after 5 seconds
    }
  }, []);

  // Listen for recovery events
  useEffect(() => {
    const handleImageError = (event: any) => {
      const { message, backupKey } = event.detail;
      setRecoveryStatus(`⚠️ ${message} (Backup: ${backupKey})`);
      setTimeout(() => setRecoveryStatus(null), 10000);
    };

    window.addEventListener('vesselImageError', handleImageError);
    return () => window.removeEventListener('vesselImageError', handleImageError);
  }, []);

  // Save vessels whenever they change
  useEffect(() => {
    if (vessels.length > 0) {
      saveVessels(vessels);
    }
  }, [vessels]);

  // Save images whenever they change with error handling
  useEffect(() => {
    const saveImagesWithRetry = async () => {
      try {
        // Check localStorage size before saving
        const currentSize = new Blob([JSON.stringify(images)]).size;
        console.log(`Saving images - Size: ${(currentSize / 1024).toFixed(2)}KB`);
        
        saveVesselImages(images);
        
        // Update save status for all images
        const newStatus: {[key: string]: 'saving' | 'saved' | 'error'} = {};
        Object.keys(images).forEach(key => {
          newStatus[key] = 'saved';
        });
        setSaveStatus(newStatus);
        
      } catch (error) {
        console.error('Failed to save images:', error);
        // Mark all as error
        const errorStatus: {[key: string]: 'saving' | 'saved' | 'error'} = {};
        Object.keys(images).forEach(key => {
          errorStatus[key] = 'error';
        });
        setSaveStatus(errorStatus);
      }
    };

    if (Object.keys(images).length > 0) {
      saveImagesWithRetry();
    }
  }, [images]);

  // Compress image to reduce storage size
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleEdit = (vessel: VesselStyle) => {
    setEditingId(vessel.id);
    setEditForm({ name: vessel.name, description: vessel.description });
  };

  const handleSave = (vesselId: string) => {
    setVessels(prev => prev.map(vessel => 
      vessel.id === vesselId 
        ? { ...vessel, name: editForm.name, description: editForm.description }
        : vessel
    ));
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  const handleDelete = (vesselId: string) => {
    if (confirm('Are you sure you want to delete this vessel style?')) {
      setVessels(prev => prev.filter(vessel => vessel.id !== vesselId));
      // Remove image if exists
      setImages(prev => {
        const newImages = { ...prev };
        delete newImages[vesselId];
        return newImages;
      });
    }
  };

  const handleToggleVisibility = (vesselId: string) => {
    setVessels(prev => prev.map(vessel =>
      vessel.id === vesselId 
        ? { ...vessel, isVisible: !vessel.isVisible }
        : vessel
    ));
  };

  const handleAddNew = () => {
    const newId = `style${vessels.length + 1}`;
    const newVessel: VesselStyle = {
      id: newId,
      name: `Style #${vessels.length + 1}`,
      description: 'New vessel style - click edit to add description',
      isVisible: true
    };
    setVessels(prev => [...prev, newVessel]);
    setEditingId(newId);
    setEditForm({ name: newVessel.name, description: newVessel.description });
  };

  const handleImageUpload = async (vesselId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSaveStatus(prev => ({ ...prev, [vesselId]: 'saving' }));
      
      try {
        // Compress the image before saving
        const compressedImage = await compressImage(file);
        
        setImages(prev => ({
          ...prev,
          [vesselId]: compressedImage
        }));
        
        console.log(`Image uploaded and compressed for vessel ${vesselId}`);
        
      } catch (error) {
        console.error('Failed to process image:', error);
        setSaveStatus(prev => ({ ...prev, [vesselId]: 'error' }));
      }
    }
  };

  const handleDrop = async (vesselId: string, event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      setSaveStatus(prev => ({ ...prev, [vesselId]: 'saving' }));
      
      try {
        // Compress the image before saving
        const compressedImage = await compressImage(files[0]);
        
        setImages(prev => ({
          ...prev,
          [vesselId]: compressedImage
        }));
        
        console.log(`Image dropped and compressed for vessel ${vesselId}`);
        
      } catch (error) {
        console.error('Failed to process dropped image:', error);
        setSaveStatus(prev => ({ ...prev, [vesselId]: 'error' }));
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const removeImage = (vesselId: string) => {
    setImages(prev => {
      const newImages = { ...prev };
      delete newImages[vesselId];
      return newImages;
    });
  };

  const exportConfiguration = () => {
    const config = exportVesselData();
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `limen-lakay-vessels-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Vessel configuration exported');
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const success = importVesselData(data);
          
          if (success) {
            // Reload data
            setVessels(getVessels());
            setImages(getVesselImages());
            alert('Configuration imported successfully!');
          } else {
            alert('Failed to import configuration');
          }
        } catch (error) {
          console.error('Import error:', error);
          alert('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear ALL vessel data and images? This cannot be undone!')) {
      clearVesselData();
      setVessels(getVessels());
      setImages(getVesselImages());
      setSaveStatus({});
    }
  };

  const forceRecovery = () => {
    console.log('🔄 Starting manual recovery process...');
    setRecoveryStatus('🔄 Attempting to recover lost images...');
    
    // Force reload from all possible backup sources
    const recoveredImages = getVesselImages();
    setImages(recoveredImages);
    
    const imageCount = Object.keys(recoveredImages).length;
    if (imageCount > 0) {
      setRecoveryStatus(`✅ Recovered ${imageCount} images successfully!`);
      setTimeout(() => setRecoveryStatus(null), 5000);
    } else {
      setRecoveryStatus('❌ No images could be recovered from backups');
      setTimeout(() => setRecoveryStatus(null), 5000);
    }
  };

  const clearAllBackups = () => {
    if (confirm('Clear all backup data? This will remove emergency backups but keep current images.')) {
      try {
        const keys = Object.keys(localStorage);
        const backupKeys = keys.filter(key => 
          key.includes('vessel-image') && 
          (key.includes('_backup_') || key.includes('_emergency_') || key.startsWith('vessel-image-'))
        );
        
        backupKeys.forEach(key => localStorage.removeItem(key));
        setRecoveryStatus(`✅ Cleared ${backupKeys.length} backup entries`);
        setTimeout(() => setRecoveryStatus(null), 3000);
      } catch (error) {
        console.error('Failed to clear backups:', error);
        setRecoveryStatus('❌ Failed to clear backups');
        setTimeout(() => setRecoveryStatus(null), 3000);
      }
    }
  };

  const visibleVessels = vessels.filter(vessel => vessel.isVisible);
  const imageCount = Object.keys(images).length;
  
  // Calculate storage usage
  const getStorageInfo = () => {
    if (typeof window === 'undefined') return { used: 0, total: 0 };
    
    try {
      const vesselData = JSON.stringify(vessels);
      const imageData = JSON.stringify(images);
      const totalSize = vesselData.length + imageData.length;
      const totalSizeMB = totalSize / (1024 * 1024);
      
      return {
        used: totalSizeMB,
        total: 5, // Approximate localStorage limit
        vesselSize: vesselData.length / 1024,
        imageSize: imageData.length / (1024 * 1024)
      };
    } catch {
      return { used: 0, total: 5 };
    }
  };

  const storageInfo = getStorageInfo();

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#5D4037] mb-2">Vessel Style Manager</h2>
          <p className="text-gray-600">Manage vessel styles that appear in the bulk order questionnaire</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button 
            onClick={handleAddNew}
            className="bg-[#8B6F47] hover:bg-[#6D4C41] flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Style
          </Button>
          <Button 
            onClick={exportConfiguration}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Export Backup
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importConfiguration}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Import vessel configuration"
            />
            <Button 
              variant="outline"
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100"
            >
              📁 Import Backup
            </Button>
          </div>
          <Button 
            onClick={handleClearAll}
            variant="outline"
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            🗑️ Clear All
          </Button>
          <Button 
            onClick={forceRecovery}
            variant="outline"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            🔄 Recover Images
          </Button>
          <Button 
            onClick={clearAllBackups}
            variant="outline"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            🧹 Clear Backups
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-[#8B6F47]">{vessels.length}</div>
          <div className="text-sm text-gray-600">Total Styles</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{visibleVessels.length}</div>
          <div className="text-sm text-gray-600">Visible Styles</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{imageCount}</div>
          <div className="text-sm text-gray-600">Images Uploaded</div>
        </Card>
        <Card className="p-4">
          <div className={`text-2xl font-bold ${storageInfo.used > 4 ? 'text-red-600' : 'text-purple-600'}`}>
            {storageInfo.used.toFixed(1)}MB
          </div>
          <div className="text-sm text-gray-600">Storage Used</div>
          {storageInfo.used > 4 && (
            <div className="text-xs text-red-500 mt-1">Near limit!</div>
          )}
        </Card>
      </div>

      {/* Recovery Status */}
      {recoveryStatus && (
        <Card className={`p-4 mb-6 ${
          recoveryStatus.includes('✅') 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{recoveryStatus}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRecoveryStatus(null)}
              className="ml-auto p-1 h-6 w-6"
            >
              <X size={12} />
            </Button>
          </div>
        </Card>
      )}

      {/* Storage Warning */}
      {storageInfo.used > 3.5 && (
        <Card className="p-4 border-yellow-500 bg-yellow-50">
          <div className="flex items-center space-x-2 text-yellow-800">
            <span>⚠️</span>
            <div>
              <div className="font-semibold">Storage Warning</div>
              <div className="text-sm">
                You're using {storageInfo.used.toFixed(1)}MB of ~5MB localStorage limit. 
                Consider exporting a backup and clearing old data.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Preview Mode */}
      {showPreview && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Client Form Preview</h3>
          <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
            <div className="bg-[#8B6F47] text-white px-4 py-2 font-semibold rounded-r-lg inline-block mb-6">
              SECTION 3: VESSEL/CONTAINER SELECTION
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleVessels.map((vessel) => (
                <Card key={vessel.id} className="p-4 border-2 border-dashed border-gray-300">
                  <div className="text-center mb-3">
                    <strong>{vessel.name}</strong>
                  </div>
                  <div className="w-full h-32 border border-gray-200 rounded bg-gray-50 mb-3 flex items-center justify-center">
                    {images[vessel.id] ? (
                      <img 
                        src={images[vessel.id]} 
                        alt={vessel.name}
                        className="max-w-full max-h-full rounded object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No Image</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-3 min-h-[40px]">
                    {vessel.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Vessel Management Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vessels.map((vessel) => (
          <Card key={vessel.id} className={`p-4 ${!vessel.isVisible ? 'opacity-50 border-gray-300' : 'border-[#8B6F47]'}`}>
            <div className="space-y-4">
              {/* Header with controls */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${vessel.isVisible ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {editingId === vessel.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="font-semibold text-lg border-b border-[#8B6F47] bg-transparent outline-none"
                    />
                  ) : (
                    <h3 className="font-semibold text-lg">{vessel.name}</h3>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleVisibility(vessel.id)}
                    className="p-1 h-8 w-8"
                  >
                    {vessel.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </Button>
                  {editingId === vessel.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(vessel.id)}
                        className="p-1 h-8 w-8 bg-green-600 hover:bg-green-700"
                      >
                        <Save size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        className="p-1 h-8 w-8"
                      >
                        <X size={14} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(vessel)}
                        className="p-1 h-8 w-8"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(vessel.id)}
                        className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Image upload area */}
              <div className="relative">
                <div
                  className="w-full h-48 border-2 border-dashed border-gray-400 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#8B6F47] transition-colors"
                  onClick={() => fileInputRefs.current[vessel.id]?.click()}
                  onDrop={(e) => handleDrop(vessel.id, e)}
                  onDragOver={handleDragOver}
                >
                  {images[vessel.id] ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={images[vessel.id]} 
                        alt={vessel.name}
                        className="max-w-full max-h-full rounded-md object-contain mx-auto"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(vessel.id);
                        }}
                        className="absolute top-2 right-2 p-1 h-6 w-6 bg-red-500 text-white hover:bg-red-600 border-none"
                      >
                        <X size={12} />
                      </Button>
                      
                      {/* Save Status Indicator */}
                      {saveStatus[vessel.id] && (
                        <div className={`absolute bottom-2 right-2 px-2 py-1 text-xs rounded-full ${
                          saveStatus[vessel.id] === 'saved' 
                            ? 'bg-green-500 text-white' 
                            : saveStatus[vessel.id] === 'saving'
                            ? 'bg-blue-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {saveStatus[vessel.id] === 'saved' && '✓ Saved'}
                          {saveStatus[vessel.id] === 'saving' && '⏳ Saving...'}
                          {saveStatus[vessel.id] === 'error' && '❌ Error'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click or Drag Image</p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
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
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description:</label>
                {editingId === vessel.id ? (
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md h-24 resize-none text-sm"
                    placeholder="Enter vessel description..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 min-h-[60px] p-2 bg-gray-50 rounded border">
                    {vessel.description}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>ID: {vessel.id}</span>
                <span className={vessel.isVisible ? 'text-green-600' : 'text-gray-400'}>
                  {vessel.isVisible ? 'Visible to clients' : 'Hidden from clients'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Usage Instructions */}
      <Card className="p-6 bg-amber-50 border-amber-200">
        <h3 className="text-lg font-semibold mb-3 text-amber-800">How to Use Vessel Manager</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
          <div>
            <h4 className="font-semibold mb-2">Editing:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Click edit icon to modify name and description</li>
              <li>Click/drag images to upload or replace</li>
              <li>Save changes with the save button</li>
              <li>Cancel editing to discard changes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Management:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Toggle eye icon to show/hide from clients</li>
              <li>Delete styles you no longer offer</li>
              <li>Add new styles with custom details</li>
              <li>Export configuration for backup</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}