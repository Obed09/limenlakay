'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';

interface Scent {
  id: string;
  name: string;
  name_english: string;
  notes: string;
  description: string;
  is_available: boolean;
}

export default function AdminScentsPage() {
  const [scents, setScents] = useState<Scent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_english: '',
    notes: '',
    description: '',
    is_available: true
  });

  const supabase = createClient();

  useEffect(() => {
    fetchScents();
  }, []);

  async function fetchScents() {
    const { data, error } = await supabase
      .from('scents')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setScents(data);
    }
    setLoading(false);
  }

  const handleAdd = async () => {
    const { error } = await supabase
      .from('scents')
      .insert([formData]);

    if (!error) {
      fetchScents();
      setShowAddForm(false);
      setFormData({
        name: '',
        name_english: '',
        notes: '',
        description: '',
        is_available: true
      });
    }
  };

  const handleUpdate = async (scent: Scent) => {
    const { error } = await supabase
      .from('scents')
      .update(scent)
      .eq('id', scent.id);

    if (!error) {
      setEditingId(null);
      fetchScents();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this scent?')) {
      const { error } = await supabase
        .from('scents')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchScents();
      }
    }
  };

  const toggleAvailability = async (scent: Scent) => {
    const { error } = await supabase
      .from('scents')
      .update({ is_available: !scent.is_available })
      .eq('id', scent.id);

    if (!error) {
      fetchScents();
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/admin" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Scent Management</h1>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Scent
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Add New Scent
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name (Creole/French)</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Chimen Lakay"
                  />
                </div>
                <div>
                  <Label>Name (English)</Label>
                  <Input
                    value={formData.name_english}
                    onChange={(e) => setFormData({ ...formData, name_english: e.target.value })}
                    placeholder="e.g., Path Home"
                  />
                </div>
              </div>
              <div>
                <Label>Scent Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g., Vanilla, Sandalwood, Amber"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the scent..."
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
                <Label>Available on website</Label>
              </div>
              <Button onClick={handleAdd} className="w-full bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Scent
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Scents List */}
        <div className="grid gap-4">
          {scents.map((scent) => (
            <Card key={scent.id} className={!scent.is_available ? 'opacity-60' : ''}>
              <CardContent className="pt-6">
                {editingId === scent.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name (Creole/French)</Label>
                        <Input
                          value={scent.name}
                          onChange={(e) => setScents(scents.map(s => 
                            s.id === scent.id ? { ...s, name: e.target.value } : s
                          ))}
                        />
                      </div>
                      <div>
                        <Label>Name (English)</Label>
                        <Input
                          value={scent.name_english}
                          onChange={(e) => setScents(scents.map(s => 
                            s.id === scent.id ? { ...s, name_english: e.target.value } : s
                          ))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Scent Notes</Label>
                      <Input
                        value={scent.notes}
                        onChange={(e) => setScents(scents.map(s => 
                          s.id === scent.id ? { ...s, notes: e.target.value } : s
                        ))}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={scent.description}
                        onChange={(e) => setScents(scents.map(s => 
                          s.id === scent.id ? { ...s, description: e.target.value } : s
                        ))}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdate(scent)} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={() => setEditingId(null)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{scent.name}</h3>
                        {scent.name_english && (
                          <span className="text-sm text-gray-500">({scent.name_english})</span>
                        )}
                        {!scent.is_available && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Hidden</span>
                        )}
                      </div>
                      <p className="text-sm text-amber-600 mb-2">{scent.notes}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{scent.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center gap-2 border-r pr-4">
                        <Switch
                          checked={scent.is_available}
                          onCheckedChange={() => toggleAvailability(scent)}
                        />
                        <span className="text-sm text-gray-600">
                          {scent.is_available ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(scent.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(scent.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {scents.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No scents found. Add your first scent to get started!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
