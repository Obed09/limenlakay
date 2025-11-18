// Vessel data service for sharing between admin and client components
export interface VesselStyle {
  id: string;
  name: string;
  description: string;
  image?: string;
  isVisible: boolean;
}

// Default vessel styles
export const defaultVesselStyles: VesselStyle[] = [
  {
    id: 'style1',
    name: 'Style #1',
    description: 'Decorative empty candle vessel with lid, crafted from light-colored concrete material. Features subtle purple marbling or swirling patterns.',
    isVisible: true
  },
  {
    id: 'style2', 
    name: 'Style #2',
    description: 'Empty candle vessel with textured, fluted exterior and golden rim. Light blue/teal color with splashes of gold, suggesting a marbling or distressed effect.',
    isVisible: true
  },
  {
    id: 'style3',
    name: 'Style #3', 
    description: 'Oval marbled blue/white/gold vessel with elegant curved profile and sophisticated color blending.',
    isVisible: true
  },
  {
    id: 'style4',
    name: 'Style #4',
    description: 'Assorted fluted marbled vessels featuring various color combinations and textured ridged exteriors.',
    isVisible: true
  },
  {
    id: 'style5',
    name: 'Style #5',
    description: 'Black/white/gold marbled vessel with rose-colored metallic lid, creating a luxurious contrast.',
    isVisible: true
  },
  {
    id: 'style6',
    name: 'Style #6',
    description: 'Earth-tone marbled vessel with warm brown and cream swirls, perfect for rustic or natural decor.',
    isVisible: true
  },
  {
    id: 'style7',
    name: 'Style #7',
    description: 'Geometric concrete vessel with clean lines and modern minimalist design in neutral gray tones.',
    isVisible: true
  },
  {
    id: 'style8',
    name: 'Style #8',
    description: 'Ceramic vessel with glossy finish and abstract paint drip patterns in multiple vibrant colors.',
    isVisible: true
  },
  {
    id: 'style9',
    name: 'Style #9',
    description: 'Natural wood vessel with live edge details and organic grain patterns, eco-friendly and sustainable.',
    isVisible: true
  },
  {
    id: 'style10',
    name: 'Style #10',
    description: 'Crystal-inspired vessel with faceted geometry and translucent material creating light refraction effects.',
    isVisible: true
  },
  {
    id: 'style11',
    name: 'Style #11',
    description: 'Vintage-inspired vessel with antique bronze finish and ornate decorative relief patterns.',
    isVisible: true
  },
  {
    id: 'style12',
    name: 'Style #12',
    description: 'Ocean-themed vessel with blue-green gradient and wave-like texture patterns reminiscent of sea glass.',
    isVisible: true
  },
  {
    id: 'style13',
    name: 'Style #13',
    description: 'Industrial-style vessel with raw metal finish and exposed welding seams for urban modern aesthetics.',
    isVisible: true
  },
  {
    id: 'style14',
    name: 'Style #14',
    description: 'Bohemian vessel with intricate mandala patterns and warm terracotta base with metallic accents.',
    isVisible: true
  },
  {
    id: 'style15',
    name: 'Style #15',
    description: 'Custom hybrid vessel combining multiple materials like concrete, wood, and metal for unique artistic appeal.',
    isVisible: true
  }
];

// Storage keys
export const VESSEL_STORAGE_KEY = 'limen-lakay-vessels';
export const VESSEL_IMAGES_STORAGE_KEY = 'limen-lakay-vessel-images';

// Get vessels from localStorage or return defaults
export const getVessels = (): VesselStyle[] => {
  if (typeof window === 'undefined') return defaultVesselStyles;
  
  try {
    const stored = localStorage.getItem(VESSEL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultVesselStyles;
  } catch {
    return defaultVesselStyles;
  }
};

// Get vessel images from localStorage with recovery system
export const getVesselImages = (): {[key: string]: string} => {
  if (typeof window === 'undefined') return {};
  
  try {
    // Try to get main data
    let stored = localStorage.getItem(VESSEL_IMAGES_STORAGE_KEY);
    let images: {[key: string]: string} = {};
    
    if (stored) {
      try {
        images = JSON.parse(stored);
        console.log(`✅ Loaded ${Object.keys(images).length} vessel images from main storage`);
        return images;
      } catch (parseError) {
        console.error('❌ Failed to parse main image data:', parseError);
      }
    }
    
    // If main data failed, try backups
    console.log('🔄 Attempting to recover from backups...');
    
    const backupKeys = [
      VESSEL_IMAGES_STORAGE_KEY + '_backup_1',
      VESSEL_IMAGES_STORAGE_KEY + '_backup_2'
    ];
    
    for (const backupKey of backupKeys) {
      try {
        const backup = localStorage.getItem(backupKey);
        if (backup) {
          images = JSON.parse(backup);
          console.log(`✅ Recovered ${Object.keys(images).length} images from ${backupKey}`);
          
          // Restore main data from backup
          localStorage.setItem(VESSEL_IMAGES_STORAGE_KEY, backup);
          console.log('✅ Restored main storage from backup');
          
          return images;
        }
      } catch (backupError) {
        console.error(`❌ Failed to recover from ${backupKey}:`, backupError);
      }
    }
    
    // Try to recover from emergency backups
    console.log('🔄 Searching for emergency backups...');
    const allKeys = Object.keys(localStorage);
    const emergencyKeys = allKeys.filter(key => 
      key.includes(VESSEL_IMAGES_STORAGE_KEY) && key.includes('_emergency_')
    ).sort().reverse(); // Get most recent first
    
    for (const emergencyKey of emergencyKeys.slice(0, 3)) { // Try last 3 emergency backups
      try {
        const emergency = localStorage.getItem(emergencyKey);
        if (emergency) {
          images = JSON.parse(emergency);
          console.log(`✅ Recovered ${Object.keys(images).length} images from emergency backup: ${emergencyKey}`);
          
          // Restore main data from emergency backup
          localStorage.setItem(VESSEL_IMAGES_STORAGE_KEY, emergency);
          console.log('✅ Restored main storage from emergency backup');
          
          return images;
        }
      } catch (emergencyError) {
        console.error(`❌ Failed to recover from ${emergencyKey}:`, emergencyError);
      }
    }
    
    // Try to recover individual images
    console.log('🔄 Searching for individual image backups...');
    const individualKeys = allKeys.filter(key => key.startsWith('vessel-image-'));
    if (individualKeys.length > 0) {
      const recovered: {[key: string]: string} = {};
      
      individualKeys.forEach(key => {
        try {
          const vesselId = key.split('-')[2]; // Extract vessel ID from key
          const imageData = localStorage.getItem(key);
          if (vesselId && imageData) {
            recovered[vesselId] = imageData;
          }
        } catch (error) {
          console.error(`❌ Failed to recover individual image ${key}:`, error);
        }
      });
      
      if (Object.keys(recovered).length > 0) {
        console.log(`✅ Recovered ${Object.keys(recovered).length} individual images`);
        
        // Save recovered data as main storage
        saveVesselImages(recovered);
        return recovered;
      }
    }
    
    console.log('ℹ️ No vessel images found in storage or backups');
    return {};
    
  } catch (error) {
    console.error('❌ Failed to get vessel images:', error);
    return {};
  }
};

// Save vessels to localStorage
export const saveVessels = (vessels: VesselStyle[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(VESSEL_STORAGE_KEY, JSON.stringify(vessels));
    
    // Verify the save worked
    const saved = localStorage.getItem(VESSEL_STORAGE_KEY);
    if (!saved) {
      throw new Error('Failed to save to localStorage');
    }
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('vesselDataChanged', { 
      detail: { type: 'vessels', count: vessels.length } 
    }));
    
  } catch (error) {
    console.error('Failed to save vessels:', error);
    throw error;
  }
};

// Save vessel images to localStorage with enhanced error handling and multiple backups
export const saveVesselImages = (images: {[key: string]: string}): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const imageData = JSON.stringify(images);
    const sizeInMB = new Blob([imageData]).size / (1024 * 1024);
    
    console.log(`Saving vessel images - Size: ${sizeInMB.toFixed(2)}MB, Count: ${Object.keys(images).length}`);
    
    // Check if we're approaching localStorage limits
    if (sizeInMB > 4) {
      console.warn('Image data is large, may cause storage issues');
      
      // Try to compress images further if too large
      const compressedImages = compressImageData(images);
      const compressedData = JSON.stringify(compressedImages);
      const compressedSize = new Blob([compressedData]).size / (1024 * 1024);
      
      if (compressedSize < sizeInMB) {
        console.log(`Compressed images from ${sizeInMB.toFixed(2)}MB to ${compressedSize.toFixed(2)}MB`);
        saveVesselImages(compressedImages); // Recursive call with compressed data
        return;
      }
    }
    
    // Save main data
    localStorage.setItem(VESSEL_IMAGES_STORAGE_KEY, imageData);
    
    // Create multiple backups for reliability
    const timestamp = Date.now();
    localStorage.setItem(VESSEL_IMAGES_STORAGE_KEY + '_backup_1', imageData);
    localStorage.setItem(VESSEL_IMAGES_STORAGE_KEY + '_backup_2', imageData);
    localStorage.setItem(VESSEL_IMAGES_STORAGE_KEY + '_timestamp', timestamp.toString());
    
    // Clean up old backups (keep only recent ones)
    cleanupOldBackups();
    
    // Verify the save worked
    const saved = localStorage.getItem(VESSEL_IMAGES_STORAGE_KEY);
    if (!saved || saved !== imageData) {
      throw new Error('Failed to save to localStorage - data mismatch');
    }
    
    console.log('✅ Images saved successfully with backups');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('vesselDataChanged', { 
      detail: { 
        type: 'images', 
        count: Object.keys(images).length,
        size: sizeInMB,
        timestamp: timestamp
      } 
    }));
    
  } catch (error) {
    console.error('❌ Failed to save vessel images:', error);
    
    // Try alternative storage methods
    try {
      const backupKey = VESSEL_IMAGES_STORAGE_KEY + '_emergency_' + Date.now();
      localStorage.setItem(backupKey, JSON.stringify(images));
      console.log('✅ Saved emergency backup to:', backupKey);
      
      // Show user notification about backup
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('vesselImageError', { 
          detail: { 
            message: 'Images saved to emergency backup. Please export data soon.',
            backupKey: backupKey
          } 
        }));
      }
      
    } catch (backupError) {
      console.error('❌ Failed to save emergency backup:', backupError);
      
      // Last resort: try to save individual images
      tryIndividualImageSave(images);
    }
    
    throw error;
  }
};

// Helper function to compress image data further
const compressImageData = (images: {[key: string]: string}): {[key: string]: string} => {
  const compressed: {[key: string]: string} = {};
  
  Object.entries(images).forEach(([key, value]) => {
    try {
      if (value.startsWith('data:image/')) {
        // Try to re-compress the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          const maxSize = 600; // Smaller than original 800px
          let { width, height } = img;
          
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // More aggressive compression
          compressed[key] = canvas.toDataURL('image/jpeg', 0.6);
        };
        
        img.src = value;
      } else {
        compressed[key] = value;
      }
    } catch (error) {
      console.error(`Failed to compress image ${key}:`, error);
      compressed[key] = value; // Keep original on failure
    }
  });
  
  return compressed;
};

// Clean up old backup data
const cleanupOldBackups = () => {
  try {
    const keys = Object.keys(localStorage);
    const backupKeys = keys.filter(key => 
      key.includes('vessel-images') && 
      (key.includes('_backup_') || key.includes('_emergency_'))
    );
    
    // Sort by timestamp and keep only recent ones
    backupKeys.sort().slice(0, -5).forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log('Cleaned up old backup:', key);
      } catch (error) {
        console.error('Failed to cleanup backup:', key, error);
      }
    });
  } catch (error) {
    console.error('Failed to cleanup old backups:', error);
  }
};

// Try to save individual images when bulk save fails
const tryIndividualImageSave = (images: {[key: string]: string}) => {
  Object.entries(images).forEach(([key, value]) => {
    try {
      const individualKey = `vessel-image-${key}-${Date.now()}`;
      localStorage.setItem(individualKey, value);
      console.log(`✅ Saved individual image: ${key}`);
    } catch (error) {
      console.error(`❌ Failed to save individual image ${key}:`, error);
    }
  });
};

// Get only visible vessels for client display
export const getVisibleVessels = (): VesselStyle[] => {
  return getVessels().filter(vessel => vessel.isVisible);
};

// Export all data for backup
export const exportVesselData = () => {
  const vessels = getVessels();
  const images = getVesselImages();
  
  return {
    vessels,
    images,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
};

// Import data from backup
export const importVesselData = (data: any): boolean => {
  try {
    if (data.vessels && Array.isArray(data.vessels)) {
      saveVessels(data.vessels);
    }
    
    if (data.images && typeof data.images === 'object') {
      saveVesselImages(data.images);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to import vessel data:', error);
    return false;
  }
};

// Clear all vessel data (for testing)
export const clearVesselData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(VESSEL_STORAGE_KEY);
  localStorage.removeItem(VESSEL_IMAGES_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('vesselDataChanged', { detail: { type: 'cleared' } }));
};