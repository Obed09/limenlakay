'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Sparkles, FileText, Loader2, Upload, QrCode, Printer, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Vessel {
  id: string;
  name: string;
  color: string;
  size: string;
  price: number;
  image_url: string;
  is_available: boolean;
  stock_quantity: number;
  description: string | null;
  sku: string | null;
  mold_id: string | null;
  diameter_inches: number | null;
  height_inches: number | null;
  capacity_oz: number | null;
}

interface Mold {
  id: string;
  name: string;
  code: string;
  shape_type: string;
  diameter_inches: number;
  height_inches: number;
  capacity_oz: number | null;
  style_tags: string[];
  description: string | null;
}

interface Candle {
  id: string;
  vessel_id: string;
  scent_id: string;
  name: string;
  sku: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  stock_quantity: number;
  description: string | null;
  created_at: string;
  vessel?: Vessel;
  scent?: Scent;
}

interface Scent {
  id: string;
  name: string;
  name_english: string;
  notes: string;
  description: string;
  is_available: boolean;
  display_order: number;
}

interface BulkResult {
  success: boolean;
  fileName: string;
  imageUrl: string;
  analysis?: {
    color: string;
    description: string;
    shape: string;
    diameter: number;
    height: number;
    texture: string;
    style: string;
  };
  suggestedMold?: Mold;
  confidence?: number;
  error?: string;
}

export default function AdminVesselsPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [scents, setScents] = useState<Scent[]>([]);
  const [molds, setMolds] = useState<Mold[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [editingCandle, setEditingCandle] = useState<Candle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCandleForm, setShowCandleForm] = useState(false);
  const [activeTab, setActiveTab] = useState('vessels');
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [suggestingMold, setSuggestingMold] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [labelData, setLabelData] = useState<{vessel: Vessel | null, qrCode: string, barcode: string}>({
    vessel: null,
    qrCode: '',
    barcode: ''
  });
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState(false);
  const { toast } = useToast();
  
  const supabase = useMemo(() => createClient(), []);

  const [formData, setFormData] = useState({
    name: '',
    color: '',
    size: '105',
    price: 39.00,
    image_url: '',
    stock_quantity: 0,
    is_available: true,
    description: '',
    sku: '',
    mold_id: '',
    diameter_inches: 0,
    height_inches: 0,
    capacity_oz: 0
  });

  const [candleFormData, setCandleFormData] = useState({
    name: '',
    vessel_id: '',
    scent_id: '',
    price: 0,
    image_url: '',
    stock_quantity: 0,
    is_available: true,
    description: '',
    sku: ''
  });

  useEffect(() => {
    loadVessels();
    loadCandles();
    loadScents();
    loadMolds();
  }, []);

  const loadVessels = async () => {
    const { data } = await supabase
      .from('candle_vessels')
      .select('*')
      .order('sku');
    
    if (data) setVessels(data);
    setLoading(false);
  };

  const loadMolds = async () => {
    const { data } = await supabase
      .from('candle_molds')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (data) setMolds(data);
  };

  const loadCandles = async () => {
    const { data } = await supabase
      .from('finished_candles')
      .select(`
        *,
        vessel:candle_vessels(id, name, color, size, price, image_url),
        scent:candle_scents(id, name, name_english, notes)
      `)
      .order('sku');
    
    if (data) setCandles(data);
  };

  const loadScents = async () => {
    const { data } = await supabase
      .from('candle_scents')
      .select('*')
      .eq('is_available', true)
      .order('display_order');
    
    if (data) setScents(data);
  };

  const generateNextSku = async () => {
    const { data } = await supabase.rpc('generate_next_sku');
    return data || 'LL-100';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size should be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `vessels/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vessel-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vessel-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));

      toast({
        title: 'Success',
        description: 'Image uploaded! Now click "AI Analyze"'
      });
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Could not upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCandleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size should be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `candle-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `candles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vessel-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vessel-images')
        .getPublicUrl(filePath);

      setCandleFormData(prev => ({ ...prev, image_url: publicUrl }));

      toast({
        title: 'Success',
        description: 'Image uploaded! Now click "AI Analyze"'
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Could not upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAIAnalyze = async () => {
    if (!formData.image_url) {
      toast({
        title: 'Error',
        description: 'Please upload or enter an image URL first',
        variant: 'destructive'
      });
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai-analyze-vessel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: formData.image_url })
      });

      const result = await response.json();
      
      if (result.success) {
        const analysis = result.analysis;
        let newSku = formData.sku;
        if (!editingVessel) {
          newSku = await generateNextSku();
        }
        
        // Update form with AI analysis
        setFormData(prev => ({
          ...prev,
          color: analysis.color || prev.color,
          description: analysis.description || prev.description,
          name: prev.name || `${analysis.color} Vessel`,
          sku: newSku
        }));

        // Now suggest a mold based on AI analysis
        setSuggestingMold(true);
        const moldResponse = await fetch('/api/suggest-mold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shape: analysis.shape,
            diameter: analysis.diameter,
            height: analysis.height,
            texture: analysis.texture
          })
        });

        const moldResult = await moldResponse.json();
        if (moldResult.success && moldResult.suggestedMold) {
          const mold = moldResult.suggestedMold;
          setFormData(prev => ({
            ...prev,
            mold_id: mold.id,
            diameter_inches: mold.diameter_inches,
            height_inches: mold.height_inches,
            capacity_oz: mold.capacity_oz || 0,
            size: mold.capacity_oz ? `${mold.capacity_oz}oz` : prev.size
          }));

          toast({
            title: '✨ AI Analysis Complete',
            description: `Suggested mold: ${mold.name} (${Math.round(moldResult.confidence)}% match)`
          });
        }
        setSuggestingMold(false);

      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'AI Analysis Failed',
        description: error.message || 'Could not analyze image',
        variant: 'destructive'
      });
    } finally {
      setAnalyzing(false);
      setSuggestingMold(false);
    }
  };

  // CANDLE AI ANALYSIS
  const handleAICandleAnalyze = async () => {
    if (!candleFormData.image_url) {
      toast({
        title: 'Error',
        description: 'Please upload or enter an image URL first',
        variant: 'destructive'
      });
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai-analyze-candle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: candleFormData.image_url })
      });

      const result = await response.json();

      if (result.success && result.analysis) {
        const analysis = result.analysis;
        
        // Try to match vessel by color
        const matchedVessel = vessels.find(v => 
          v.color.toLowerCase().includes(analysis.vesselColor?.toLowerCase() || '') ||
          analysis.vesselColor?.toLowerCase().includes(v.color.toLowerCase())
        );

        // Try to match scent by name
        const matchedScent = scents.find(s => 
          s.name_english.toLowerCase().includes(analysis.scent?.toLowerCase() || '') ||
          analysis.scent?.toLowerCase().includes(s.name_english.toLowerCase()) ||
          s.name.toLowerCase().includes(analysis.scent?.toLowerCase() || '')
        );

        setCandleFormData(prev => ({
          ...prev,
          name: analysis.name || prev.name,
          description: analysis.description || prev.description,
          vessel_id: matchedVessel?.id || prev.vessel_id,
          scent_id: matchedScent?.id || prev.scent_id,
          price: analysis.suggestedPrice || prev.price || 49.00
        }));

        toast({
          title: 'AI Analysis Complete!',
          description: `Detected: ${analysis.name || 'Candle'}${matchedVessel ? ` • Vessel: ${matchedVessel.name}` : ''}${matchedScent ? ` • Scent: ${matchedScent.name_english}` : ''}`,
        });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Could not analyze image',
        variant: 'destructive'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    window.open('/api/vessels-pdf', '_blank');
    toast({
      title: 'Catalog Generated',
      description: 'Opening PDF catalog in new tab'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const finalData = { ...formData };
      if (!editingVessel && !finalData.sku) {
        finalData.sku = await generateNextSku();
      }

      if (editingVessel) {
        const { error } = await supabase
          .from('candle_vessels')
          .update(finalData)
          .eq('id', editingVessel.id);
        
        if (error) throw error;
        
        toast({ title: 'Success', description: 'Vessel updated' });
      } else {
        const { error } = await supabase
          .from('candle_vessels')
          .insert([finalData]);
        
        if (error) throw error;
        
        toast({ title: 'Success', description: `Vessel created with SKU: ${finalData.sku}` });
      }

      resetForm();
      await loadVessels();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vessel?')) return;
    
    await supabase.from('candle_vessels').delete().eq('id', id);
    
    toast({ title: 'Success', description: 'Vessel deleted' });
    loadVessels();
  };

  const handleEdit = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setFormData({
      name: vessel.name,
      color: vessel.color,
      size: vessel.size,
      price: vessel.price,
      image_url: vessel.image_url,
      stock_quantity: vessel.stock_quantity,
      is_available: vessel.is_available,
      description: vessel.description || '',
      sku: vessel.sku || '',
      mold_id: vessel.mold_id || '',
      diameter_inches: vessel.diameter_inches || 0,
      height_inches: vessel.height_inches || 0,
      capacity_oz: vessel.capacity_oz || 0
    });
    setShowForm(true);
  };

  const toggleAvailability = async (vessel: Vessel) => {
    await supabase
      .from('candle_vessels')
      .update({ is_available: !vessel.is_available })
      .eq('id', vessel.id);
    
    loadVessels();
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    if (files.length > 20) {
      toast({
        title: 'Too many files',
        description: 'Please upload maximum 20 images at a time',
        variant: 'destructive'
      });
      return;
    }

    setBulkUploading(true);
    setBulkProgress({ current: 0, total: files.length });
    setBulkResults([]);
    setShowBulkModal(true);

    try {
      // Step 1: Upload all images to Supabase Storage
      const uploadedImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setBulkProgress({ current: i + 1, total: files.length });

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `vessels/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('vessel-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('vessel-images')
          .getPublicUrl(filePath);

        uploadedImages.push({
          name: file.name,
          url: publicUrl
        });
      }

      if (uploadedImages.length === 0) {
        throw new Error('No images were uploaded successfully');
      }

      // Step 2: Send to bulk AI analysis endpoint
      const response = await fetch('/api/bulk-analyze-vessels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: uploadedImages })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Bulk analysis failed');
      }

      setBulkResults(result.results);

      toast({
        title: 'Bulk Analysis Complete!',
        description: `${result.summary.successful}/${result.summary.total} vessels analyzed successfully`
      });

    } catch (error: any) {
      toast({
        title: 'Bulk Upload Failed',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setBulkUploading(false);
    }
  };

  const createBulkVessels = async () => {
    const successful = bulkResults.filter(r => r.success);
    
    if (successful.length === 0) {
      toast({
        title: 'No vessels to create',
        description: 'All analyses failed',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: currentMaxSku } = await supabase
        .from('candle_vessels')
        .select('sku')
        .order('sku', { ascending: false })
        .limit(1)
        .single();

      let skuNumber = 100;
      if (currentMaxSku?.sku) {
        const match = currentMaxSku.sku.match(/LL-(\d+)/);
        if (match) {
          skuNumber = parseInt(match[1]) + 1;
        }
      }

      const vesselsToCreate = successful.map((result, index) => ({
        name: `${result.analysis?.color || 'Unknown'} Vessel`,
        color: result.analysis?.color || 'Unknown',
        size: result.suggestedMold ? `${result.suggestedMold.capacity_oz}oz` : '105',
        price: 39.00,
        image_url: result.imageUrl,
        stock_quantity: 0,
        is_available: false,
        description: result.analysis?.description || '',
        sku: `LL-${skuNumber + index}`,
        mold_id: result.suggestedMold?.id || null,
        diameter_inches: result.analysis?.diameter || null,
        height_inches: result.analysis?.height || null,
        capacity_oz: result.suggestedMold?.capacity_oz || null
      }));

      const { error } = await supabase
        .from('candle_vessels')
        .insert(vesselsToCreate);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: `${vesselsToCreate.length} vessels created`
      });

      setShowBulkModal(false);
      setBulkResults([]);
      await loadVessels();

    } catch (error: any) {
      toast({
        title: 'Failed to create vessels',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // BULK CANDLE UPLOAD
  const handleBulkCandleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    if (files.length > 20) {
      toast({
        title: 'Too many files',
        description: 'Please upload maximum 20 images at a time',
        variant: 'destructive'
      });
      return;
    }

    setBulkUploading(true);
    setBulkProgress({ current: 0, total: files.length });

    try {
      const processedCandles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setBulkProgress({ current: i + 1, total: files.length });

        // Upload image
        const fileExt = file.name.split('.').pop();
        const fileName = `candle-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `candles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('vessel-images')
          .upload(filePath, file);

        if (uploadError) continue;

        const { data: { publicUrl } } = supabase.storage
          .from('vessel-images')
          .getPublicUrl(filePath);

        // Analyze with AI
        const response = await fetch('/api/ai-analyze-candle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: publicUrl })
        });

        const result = await response.json();

        if (result.success && result.analysis) {
          const analysis = result.analysis;
          
          // Match vessel and scent
          const matchedVessel = vessels.find(v => 
            v.color.toLowerCase().includes(analysis.vesselColor?.toLowerCase() || '')
          );

          const matchedScent = scents.find(s => 
            s.name_english.toLowerCase().includes(analysis.scent?.toLowerCase() || '') ||
            s.name.toLowerCase().includes(analysis.scent?.toLowerCase() || '')
          );

          if (matchedVessel && matchedScent) {
            // Generate SKU
            const { data: nextSku } = await supabase.rpc('generate_next_candle_sku');
            const candleSku = nextSku || `LL-${Date.now().toString().slice(-6)}-${i}`;
            
            // Create candle
            const candleData = {
              name: analysis.name || `${matchedVessel.name} - ${matchedScent.name_english}`,
              vessel_id: matchedVessel.id,
              scent_id: matchedScent.id,
              price: analysis.suggestedPrice || matchedVessel.price + 10,
              image_url: publicUrl,
              stock_quantity: 0,
              is_available: false,
              description: analysis.description,
              sku: candleSku
            };

            const { error } = await supabase
              .from('finished_candles')
              .insert([candleData]);

            if (!error) {
              processedCandles.push(candleData);
            }
          }
        }
      }

      if (processedCandles.length > 0) {
        toast({
          title: 'Bulk Upload Complete!',
          description: `${processedCandles.length}/${files.length} candles created successfully`
        });
        await loadCandles();
      } else {
        toast({
          title: 'No candles created',
          description: 'Could not match vessels and scents automatically',
          variant: 'destructive'
        });
      }

    } catch (error) {
      toast({
        title: 'Bulk Upload Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setBulkUploading(false);
      e.target.value = '';
    }
  };

  const handlePrintLabel = async (vessel: Vessel) => {
    if (!vessel.sku) {
      toast({
        title: 'No SKU',
        description: 'This vessel needs a SKU to generate labels',
        variant: 'destructive'
      });
      return;
    }

    setGeneratingLabel(true);
    try {
      const response = await fetch('/api/generate-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: vessel.sku,
          name: vessel.name,
          url: `${window.location.origin}/vessel/${vessel.sku}`
        })
      });

      const result = await response.json();

      if (result.success) {
        setLabelData({
          vessel,
          qrCode: result.qrCode,
          barcode: result.barcode
        });
        setShowLabelModal(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Failed to generate label',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setGeneratingLabel(false);
    }
  };

  const printLabel = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const labelContent = document.getElementById('label-preview');
    if (!labelContent) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label - ${labelData.vessel?.sku}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            @media print {
              body { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${labelContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // CANDLE MANAGEMENT FUNCTIONS
  const handleCandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candleFormData.vessel_id || !candleFormData.scent_id) {
      toast({
        title: 'Error',
        description: 'Please select both vessel and scent',
        variant: 'destructive'
      });
      return;
    }

    const vessel = vessels.find(v => v.id === candleFormData.vessel_id);
    const scent = scents.find(s => s.id === candleFormData.scent_id);
    
    const candleName = candleFormData.name || `${vessel?.name} - ${scent?.name_english}`;
    
    // Generate SKU if not provided (check for empty string too)
    let candleSku = candleFormData.sku?.trim();
    if (!candleSku || candleSku === '') {
      try {
        const { data: nextSku, error: skuError } = await supabase.rpc('generate_next_candle_sku');
        if (skuError) {
          console.error('SKU generation error:', skuError);
          // Fallback: get the highest LL number manually
          const { data: vesselData } = await supabase
            .from('candle_vessels')
            .select('sku')
            .like('sku', 'LL-%')
            .order('sku', { ascending: false })
            .limit(1);
          
          const { data: candleData } = await supabase
            .from('finished_candles')
            .select('sku')
            .like('sku', 'LL-%')
            .order('sku', { ascending: false })
            .limit(1);
          
          let maxNum = 99;
          if (vesselData && vesselData[0]?.sku) {
            const vesselNum = parseInt(vesselData[0].sku.replace('LL-', ''));
            if (!isNaN(vesselNum)) maxNum = Math.max(maxNum, vesselNum);
          }
          if (candleData && candleData[0]?.sku) {
            const candleNum = parseInt(candleData[0].sku.replace('LL-', ''));
            if (!isNaN(candleNum)) maxNum = Math.max(maxNum, candleNum);
          }
          candleSku = `LL-${maxNum + 1}`;
          console.log('Generated SKU manually:', candleSku);
        } else {
          candleSku = nextSku;
          console.log('Generated SKU from function:', candleSku);
        }
      } catch (error) {
        console.error('Error generating SKU:', error);
        // Ultimate fallback
        const timestamp = Date.now().toString().slice(-6);
        candleSku = `LL-${timestamp}`;
      }
    }
    
    console.log('Final SKU:', candleSku);
    
    // Double-check SKU is not empty
    if (!candleSku || candleSku.trim() === '') {
      candleSku = `LL-${Date.now().toString().slice(-6)}`;
      console.log('Emergency fallback SKU:', candleSku);
    }
    
    const candleData = {
      vessel_id: candleFormData.vessel_id,
      scent_id: candleFormData.scent_id,
      name: candleName,
      sku: candleSku,
      price: candleFormData.price,
      image_url: candleFormData.image_url,
      stock_quantity: candleFormData.stock_quantity,
      is_available: candleFormData.is_available,
      description: candleFormData.description
    };
    
    console.log('Candle data to insert:', candleData);

    if (editingCandle) {
      const { error } = await supabase
        .from('finished_candles')
        .update(candleData)
        .eq('id', editingCandle.id);
      
      if (error) {
        console.error('Update error:', error);
        toast({ 
          title: 'Error', 
          description: error.message,
          variant: 'destructive' 
        });
        return;
      }
      toast({ title: 'Success', description: 'Candle updated!' });
    } else {
      const { error } = await supabase
        .from('finished_candles')
        .insert([candleData]);
      
      if (error) {
        console.error('Insert error:', error);
        toast({ 
          title: 'Error', 
          description: error.message,
          variant: 'destructive' 
        });
        return;
      }
      toast({ title: 'Success', description: `Candle added with SKU: ${candleSku}` });
    }

    resetCandleForm();
    loadCandles();
  };

  const handleCandleEdit = (candle: Candle) => {
    setEditingCandle(candle);
    setCandleFormData({
      name: candle.name,
      vessel_id: candle.vessel_id,
      scent_id: candle.scent_id,
      price: candle.price,
      image_url: candle.image_url || '',
      stock_quantity: candle.stock_quantity,
      is_available: candle.is_available,
      description: candle.description || '',
      sku: candle.sku
    });
    setShowCandleForm(true);
  };

  const handleCandleDelete = async (id: string) => {
    if (!confirm('Delete this candle?')) return;
    
    await supabase.from('finished_candles').delete().eq('id', id);
    
    toast({ title: 'Success', description: 'Candle deleted' });
    loadCandles();
  };

  const toggleCandleAvailability = async (candle: Candle) => {
    await supabase
      .from('finished_candles')
      .update({ is_available: !candle.is_available })
      .eq('id', candle.id);
    
    loadCandles();
  };

  const handlePrintCandleLabel = async (candle: Candle) => {
    console.log('Print label clicked for candle:', candle);
    console.log('Candle vessel:', candle.vessel);
    console.log('Candle scent:', candle.scent);
    
    if (!candle.sku) {
      toast({
        title: 'No SKU',
        description: 'This candle needs a SKU to generate labels',
        variant: 'destructive'
      });
      return;
    }

    setGeneratingLabel(true);
    try {
      console.log('Calling generate-label API...');
      const response = await fetch('/api/generate-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: candle.sku,
          name: candle.name,
          url: `${window.location.origin}/track?sku=${candle.sku}`
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Label API result:', result);

      if (result.success) {
        // Find the full vessel and scent data to ensure we have all fields
        const vessel = vessels.find(v => v.id === candle.vessel_id);
        const scent = scents.find(s => s.id === candle.scent_id);
        
        console.log('Found vessel:', vessel);
        console.log('Found scent:', scent);
        
        // Create a compatible vessel object for the label with candle data
        const candleAsVessel: Vessel = {
          id: candle.id,
          name: candle.name,
          color: vessel?.color || candle.vessel?.color || 'Unknown',
          size: scent?.name_english || candle.scent?.name_english || 'Scented',
          price: candle.price,
          image_url: candle.image_url || vessel?.image_url || '',
          is_available: candle.is_available,
          stock_quantity: candle.stock_quantity,
          description: candle.description,
          sku: candle.sku,
          mold_id: null,
          diameter_inches: null,
          height_inches: null,
          capacity_oz: null
        };
        
        console.log('Setting label data and showing modal...', candleAsVessel);
        setLabelData({
          vessel: candleAsVessel,
          qrCode: result.qrCode,
          barcode: result.barcode
        });
        // Use setTimeout to ensure state is updated before showing modal
        setTimeout(() => {
          console.log('Opening modal now...');
          setShowLabelModal(true);
        }, 10);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Label generation error:', error);
      toast({
        title: 'Failed to generate label',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setGeneratingLabel(false);
    }
  };

  const resetCandleForm = () => {
    setCandleFormData({
      name: '',
      vessel_id: '',
      scent_id: '',
      price: 0,
      image_url: '',
      stock_quantity: 0,
      is_available: true,
      description: '',
      sku: ''
    });
    setEditingCandle(null);
    setShowCandleForm(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '',
      size: '105',
      price: 39.00,
      image_url: '',
      stock_quantity: 0,
      is_available: true,
      description: '',
      sku: '',
      mold_id: '',
      diameter_inches: 0,
      height_inches: 0,
      capacity_oz: 0
    });
    setEditingVessel(null);
    setShowForm(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Product Management</h1>
        <p className="text-muted-foreground">AI-powered vessel and candle cataloging system</p>
      </div>

      <Tabs defaultValue="vessels" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="vessels" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Vessels
          </TabsTrigger>
          <TabsTrigger value="candles" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Finished Candles
          </TabsTrigger>
        </TabsList>

        {/* VESSELS TAB */}
        <TabsContent value="vessels">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">Empty Vessels</h2>
          <p className="text-sm text-muted-foreground">Manage vessel inventory</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            onClick={() => document.getElementById('bulk-upload-input')?.click()}
            disabled={bulkUploading}
          >
            {bulkUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing {bulkProgress.current}/{bulkProgress.total}...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Bulk Upload (10-20)
              </>
            )}
          </Button>
          <input
            id="bulk-upload-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleBulkUpload}
            className="hidden"
          />
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Add Vessel'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingVessel ? 'Edit Vessel' : 'Add New Vessel'}</CardTitle>
            <CardDescription>
              Upload image and use AI to auto-fill details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="image">Image *</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="Upload from computer or paste URL"
                    required
                  />
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={uploading}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading...</> : <><Upload className="h-4 w-4 mr-2" />Upload</>}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAIAnalyze}
                    disabled={analyzing || !formData.image_url}
                    className="whitespace-nowrap"
                  >
                    {analyzing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" />AI Analyze</>}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload image or paste URL, then click "AI Analyze"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Auto-generated"
                    disabled={editingVessel !== null}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Vessel Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mold">Mold Type {suggestingMold && <span className="text-xs text-muted-foreground">(AI suggesting...)</span>}</Label>
                <select
                  id="mold"
                  value={formData.mold_id}
                  onChange={(e) => {
                    const selectedMold = molds.find(m => m.id === e.target.value);
                    if (selectedMold) {
                      setFormData(prev => ({
                        ...prev,
                        mold_id: selectedMold.id,
                        diameter_inches: selectedMold.diameter_inches,
                        height_inches: selectedMold.height_inches,
                        capacity_oz: selectedMold.capacity_oz || 0,
                        size: selectedMold.capacity_oz ? `${selectedMold.capacity_oz}oz` : prev.size
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select a mold (or let AI suggest)</option>
                  {molds.map((mold) => (
                    <option key={mold.id} value={mold.id}>
                      {mold.name} - {mold.diameter_inches}" × {mold.height_inches}" ({mold.capacity_oz}oz)
                    </option>
                  ))}
                </select>
                {formData.mold_id && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Dimensions: {formData.diameter_inches}" diameter × {formData.height_inches}" height • Capacity: {formData.capacity_oz}oz
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">Color *</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="AI will detect"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="size">Size *</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="AI will generate"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
                />
                <Label htmlFor="available">Available for customers to order</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingVessel ? 'Update Vessel' : 'Create Vessel'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bulk Upload Results Modal */}
      {showBulkModal && (
        <Card className="mb-8 border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Bulk Upload Results ({bulkResults.filter(r => r.success).length}/{bulkResults.length} successful)
            </CardTitle>
            <CardDescription>
              Review AI-analyzed vessels and create them in batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bulkUploading ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-500" />
                <p className="text-lg font-medium">Analyzing vessels with AI...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Processing {bulkProgress.current} of {bulkProgress.total} images
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-[500px] overflow-y-auto">
                  {bulkResults.map((result, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${
                        result.success ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'
                      }`}
                    >
                      <div className="aspect-square mb-3 rounded overflow-hidden bg-gray-100">
                        <img
                          src={result.imageUrl}
                          alt={result.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs font-mono mb-2 truncate">{result.fileName}</p>
                      {result.success ? (
                        <>
                          <p className="text-sm font-semibold mb-1">{result.analysis?.color || 'Unknown'} Vessel</p>
                          <p className="text-xs text-muted-foreground mb-2">{result.analysis?.description || 'No description'}</p>
                          {result.suggestedMold && (
                            <div className="bg-white dark:bg-gray-900 rounded p-2 mb-2">
                              <p className="text-xs font-medium">{result.suggestedMold.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {result.suggestedMold.diameter_inches}" × {result.suggestedMold.height_inches}" • {result.suggestedMold.capacity_oz}oz
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                {result.confidence}% match
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-red-600">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={createBulkVessels}
                    disabled={bulkResults.filter(r => r.success).length === 0}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create {bulkResults.filter(r => r.success).length} Vessels
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBulkModal(false);
                      setBulkResults([]);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vessels.map((vessel) => (
          <Card key={vessel.id} className="overflow-hidden">
            <div className="aspect-square relative bg-gray-100">
              {vessel.image_url ? (
                <img
                  src={vessel.image_url}
                  alt={vessel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              <div className="absolute top-2 right-2 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                <span className="text-xs font-medium">
                  {vessel.is_available ? 'Available' : 'Hidden'}
                </span>
                <Switch
                  checked={vessel.is_available}
                  onCheckedChange={() => toggleAvailability(vessel)}
                />
              </div>
              {vessel.sku && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
                  {vessel.sku}
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1">{vessel.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {vessel.color} • Size {vessel.size}
              </p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xl font-bold">${vessel.price.toFixed(2)}</span>
                <span className="text-sm text-green-600">Stock: {vessel.stock_quantity}</span>
              </div>
              {vessel.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{vessel.description}</p>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(vessel)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(vessel.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {vessel.sku && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePrintLabel(vessel)}
                    disabled={generatingLabel}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 border-0"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Print Label
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </TabsContent>

      {/* CANDLES TAB */}
      <TabsContent value="candles">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">Finished Candles</h2>
              <p className="text-sm text-muted-foreground">Manage finished candle inventory</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                onClick={() => document.getElementById('bulk-candle-upload-input')?.click()}
                disabled={bulkUploading}
              >
                {bulkUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing {bulkProgress.current}/{bulkProgress.total}...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Bulk Upload Candles
                  </>
                )}
              </Button>
              <input
                id="bulk-candle-upload-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleBulkCandleUpload}
                className="hidden"
              />
              <Button onClick={() => setShowCandleForm(!showCandleForm)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {showCandleForm ? 'Cancel' : 'Add Candle'}
              </Button>
            </div>
          </div>

          {showCandleForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingCandle ? 'Edit Candle' : 'Add New Candle'}</CardTitle>
                <CardDescription>Create finished candles by combining vessels and scents</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCandleSubmit} className="space-y-4">
                  {/* Image Upload Section */}
                  <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
                    <Label>Candle Image</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleCandleImageUpload}
                          disabled={uploading}
                          className="cursor-pointer"
                        />
                      </div>
                      <span className="text-muted-foreground">or</span>
                      <div className="flex-1">
                        <Input
                          placeholder="Paste image URL"
                          value={candleFormData.image_url}
                          onChange={(e) => setCandleFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleAICandleAnalyze}
                        disabled={analyzing || !candleFormData.image_url}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Analyze
                          </>
                        )}
                      </Button>
                    </div>
                    {candleFormData.image_url && (
                      <div className="mt-2">
                        <img src={candleFormData.image_url} alt="Preview" className="h-32 w-32 object-cover rounded-lg border-2 border-white shadow-md" />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Upload image of your finished candle, then click &quot;AI Analyze&quot; to auto-fill details
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vessel">Vessel *</Label>
                      <select
                        id="vessel"
                        value={candleFormData.vessel_id}
                        onChange={(e) => {
                          const vessel = vessels.find(v => v.id === e.target.value);
                          setCandleFormData(prev => ({
                            ...prev,
                            vessel_id: e.target.value,
                            price: vessel ? vessel.price + 10 : 0,
                            image_url: prev.image_url || vessel?.image_url || ''
                          }));
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        required
                      >
                        <option value="">Select Vessel</option>
                        {vessels.filter(v => v.is_available).map((vessel) => (
                          <option key={vessel.id} value={vessel.id}>
                            {vessel.name} - {vessel.color} (${vessel.price})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="scent">Scent *</Label>
                      <select
                        id="scent"
                        value={candleFormData.scent_id}
                        onChange={(e) => setCandleFormData(prev => ({ ...prev, scent_id: e.target.value }))}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        required
                      >
                        <option value="">Select Scent</option>
                        {scents.map((scent) => (
                          <option key={scent.id} value={scent.id}>
                            {scent.name} ({scent.name_english})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="candle-name">Candle Name</Label>
                      <Input
                        id="candle-name"
                        value={candleFormData.name}
                        onChange={(e) => setCandleFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Auto-generated if left empty"
                      />
                    </div>
                    <div>
                      <Label htmlFor="candle-sku">SKU</Label>
                      <Input
                        id="candle-sku"
                        value={candleFormData.sku}
                        onChange={(e) => setCandleFormData(prev => ({ ...prev, sku: e.target.value }))}
                        placeholder="Auto-generated if left empty"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="candle-price">Price ($)</Label>
                      <Input
                        id="candle-price"
                        type="number"
                        step="0.01"
                        value={candleFormData.price}
                        onChange={(e) => setCandleFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="candle-stock">Stock Quantity</Label>
                      <Input
                        id="candle-stock"
                        type="number"
                        value={candleFormData.stock_quantity}
                        onChange={(e) => setCandleFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="candle-description">Description</Label>
                    <Textarea
                      id="candle-description"
                      value={candleFormData.description}
                      onChange={(e) => setCandleFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="candle-available"
                      checked={candleFormData.is_available}
                      onCheckedChange={(checked) => setCandleFormData(prev => ({ ...prev, is_available: checked }))}
                    />
                    <Label htmlFor="candle-available">Available for sale</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingCandle ? 'Update Candle' : 'Add Candle'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetCandleForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Candles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candles.map((candle) => (
              <Card key={candle.id} className="overflow-hidden">
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={candle.image_url || candle.vessel?.image_url || '/images/placeholder.jpg'}
                    alt={candle.name}
                    className="w-full h-full object-cover"
                  />
                  {candle.sku && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono">
                      {candle.sku}
                    </div>
                  )}
                  {!candle.is_available && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      UNAVAILABLE
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{candle.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {candle.scent?.name_english || 'No scent'}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Vessel: {candle.vessel?.name} - {candle.vessel?.color}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold">${candle.price.toFixed(2)}</span>
                    <span className="text-sm text-green-600">Stock: {candle.stock_quantity}</span>
                  </div>
                  {candle.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{candle.description}</p>
                  )}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm font-medium">Available for Sale</span>
                      <Switch
                        checked={candle.is_available}
                        onCheckedChange={() => toggleCandleAvailability(candle)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleCandleEdit(candle)} className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleCandleDelete(candle.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {candle.sku && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePrintCandleLabel(candle)}
                        disabled={generatingLabel}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 border-0"
                      >
                        <Flame className="h-4 w-4 mr-2" />
                        Print Label
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {candles.length === 0 && !showCandleForm && (
            <Card className="p-12 text-center">
              <Flame className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No finished candles yet</h3>
              <p className="text-muted-foreground mb-4">Start adding candles to your inventory</p>
              <Button onClick={() => setShowCandleForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Candle
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Label Preview Modal - Outside tabs so it works for both vessels and candles */}
      {showLabelModal && labelData.vessel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Product Label - {labelData.vessel.sku}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setShowLabelModal(false)}>
                  ✕
                </Button>
              </CardTitle>
              <CardDescription>Review and print label</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="label-preview" className="bg-white rounded-lg p-8 max-w-md mx-auto" style={{fontFamily: 'Arial, sans-serif'}}>
                {/* Limen Lakay Logo - Centered */}
                <div className="text-center mb-6">
                  <img src="/images/limen-lakay-logo.png" alt="Limen Lakay" className="w-32 h-32 mx-auto mb-3" />
                </div>

                {/* Product Name */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">{labelData.vessel.name}</h3>
                </div>

                {/* Warning Icons - Centered */}
                <div className="flex justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border-2 border-amber-400">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border-2 border-amber-400">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border-2 border-amber-400">
                    <span className="text-2xl">👶</span>
                  </div>
                </div>

                {/* Warning Text - Centered */}
                <div className="text-center mb-6">
                  <p className="font-bold text-amber-800 mb-2 flex items-center justify-center gap-1">
                    <span className="text-lg">⚠️</span> WARNING
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Burn within sight. Keep away from flammable objects. Keep away from children and pets.
                  </p>
                </div>

                {/* Burning Instructions - Centered */}
                <div className="mb-6 text-center border-t border-b border-gray-300 py-4">
                  <h4 className="font-bold mb-3 text-gray-800 text-sm">BURNING INSTRUCTIONS</h4>
                  <p className="text-xs text-gray-700 leading-relaxed text-left px-4">
                    Trim wick to 1/4&quot; before lighting. Keep candle free of any foreign materials including matches and wick trimmings. Only burn the candle on a level, fire-resistant surface. Do not burn candle for more than four hours at a time. Stop use when only 1/4&quot; of wax remains.
                  </p>
                </div>

                {/* QR Code and Barcode - Centered */}
                <div className="flex flex-col items-center gap-3 mb-6">
                  <img src={labelData.qrCode} alt="QR Code" className="w-36 h-36" />
                  <div className="text-center">
                    <div className="font-mono text-xl font-bold tracking-widest mb-1">{labelData.barcode}</div>
                  </div>
                </div>

                {/* Product Info - Centered */}
                <div className="text-center mb-6 py-3 border-t border-b border-amber-300">
                  <p className="font-bold text-gray-800 mb-1">{labelData.vessel.name}</p>
                  <p className="text-sm text-gray-600">{labelData.vessel.color} • {labelData.vessel.size}</p>
                </div>

                {/* Contact Information - Centered */}
                <div className="text-center text-xs text-gray-600 space-y-1">
                  <p className="flex items-center justify-center gap-1">
                    <span>📞</span> 561 593 0238
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <span>📧</span> info@limenlakay.com
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <span>🌐</span> www.limenlakay.com
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <Button onClick={printLabel} className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Label
                </Button>
                <Button variant="outline" onClick={() => setShowLabelModal(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
