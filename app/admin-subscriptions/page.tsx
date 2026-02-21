'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Home, Plus, Edit2, Trash2, Download, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  platform_service: string;
  category: string;
  date_paid: string;
  amount: number;
  length_of_subscription: string;
  expiration_date: string;
  renewal_date: string;
  renewal_method: string;
  notes: string | null;
  future_platform: string | null;
  created_at: string;
}

const CATEGORIES = [
  'Hosting & Infrastructure',
  'Database',
  'Payment Processing',
  'Email Services',
  'Marketing & Analytics',
  'Design & Creative',
  'Communication',
  'Productivity',
  'Security & Monitoring',
  'Other'
];

const RENEWAL_METHODS = [
  'Auto-renew',
  'Manual Payment',
  'Credit Card',
  'Invoice',
  'Free Trial'
];

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform_service: '',
    category: 'Other',
    date_paid: new Date().toISOString().split('T')[0],
    amount: '',
    length_of_subscription: '1 year',
    expiration_date: '',
    renewal_date: '',
    renewal_method: 'Auto-renew',
    notes: '',
    future_platform: '',
  });

  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('expiration_date', { ascending: true });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({ title: 'Error loading subscriptions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysUntilExpiration = (expirationDate: string): number => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (daysLeft: number): string => {
    if (daysLeft < 0) return 'bg-gray-100 border-gray-300 text-gray-700';
    if (daysLeft <= 7) return 'bg-red-100 border-red-300 text-red-700';
    if (daysLeft <= 30) return 'bg-yellow-100 border-yellow-300 text-yellow-700';
    return 'bg-green-100 border-green-300 text-green-700';
  };

  const getUrgencyBadge = (daysLeft: number) => {
    if (daysLeft < 0) return { label: 'Expired', color: 'bg-gray-600' };
    if (daysLeft <= 7) return { label: '🔴 Urgent', color: 'bg-red-600' };
    if (daysLeft <= 30) return { label: '🟡 Soon', color: 'bg-yellow-600' };
    return { label: '🟢 Safe', color: 'bg-green-600' };
  };

  const handleSave = async () => {
    try {
      if (!formData.platform_service || !formData.amount || !formData.expiration_date) {
        toast({ title: 'Please fill in all required fields', variant: 'destructive' });
        return;
      }

      const renewalDateObj = new Date(formData.expiration_date);
      renewalDateObj.setDate(renewalDateObj.getDate() + 1);

      const payload = {
        platform_service: formData.platform_service,
        category: formData.category,
        date_paid: formData.date_paid,
        amount: parseFloat(formData.amount as any),
        length_of_subscription: formData.length_of_subscription,
        expiration_date: formData.expiration_date,
        renewal_date: formData.renewal_date || renewalDateObj.toISOString().split('T')[0],
        renewal_method: formData.renewal_method,
        notes: formData.notes || null,
        future_platform: formData.future_platform || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('subscriptions')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Subscription updated successfully!' });
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert([payload]);
        if (error) throw error;
        toast({ title: 'Subscription added successfully!' });
      }

      resetForm();
      setIsOpen(false);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast({ title: 'Error saving subscription', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Subscription deleted' });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({ title: 'Error deleting subscription', variant: 'destructive' });
    }
  };

  const handleEdit = (sub: Subscription) => {
    setFormData({
      platform_service: sub.platform_service,
      category: sub.category,
      date_paid: sub.date_paid,
      amount: sub.amount.toString(),
      length_of_subscription: sub.length_of_subscription,
      expiration_date: sub.expiration_date,
      renewal_date: sub.renewal_date,
      renewal_method: sub.renewal_method,
      notes: sub.notes || '',
      future_platform: sub.future_platform || '',
    });
    setEditingId(sub.id);
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      platform_service: '',
      category: 'Other',
      date_paid: new Date().toISOString().split('T')[0],
      amount: '',
      length_of_subscription: '1 year',
      expiration_date: '',
      renewal_date: '',
      renewal_method: 'Auto-renew',
      notes: '',
      future_platform: '',
    });
    setEditingId(null);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.platform_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || sub.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalMonthlyAmount = subscriptions.reduce((sum, sub) => {
    if (sub.length_of_subscription.includes('month') || sub.length_of_subscription.includes('Month')) {
      return sum + sub.amount;
    }
    return sum;
  }, 0);

  const totalYearlyAmount = subscriptions.reduce((sum, sub) => {
    if (sub.length_of_subscription.includes('year') || sub.length_of_subscription.includes('Year')) {
      return sum + sub.amount;
    }
    return sum + (sub.amount * 12); // Estimate yearly
  }, 0);

  const upcomingRenewals = subscriptions.filter(sub => {
    const daysLeft = calculateDaysUntilExpiration(sub.expiration_date);
    return daysLeft >= 0 && daysLeft <= 30;
  }).length;

  const expiredSubs = subscriptions.filter(sub => {
    return calculateDaysUntilExpiration(sub.expiration_date) < 0;
  }).length;

  const handleExportCSV = () => {
    const headers = ['Platform/Service', 'Category', 'Date Paid', 'Amount', 'Length', 'Expiration Date', 'Renewal Date', 'Renewal Method', 'Notes'];
    const rows = filteredSubscriptions.map(sub => [
      sub.platform_service,
      sub.category,
      sub.date_paid,
      `$${sub.amount.toFixed(2)}`,
      sub.length_of_subscription,
      sub.expiration_date,
      sub.renewal_date,
      sub.renewal_method,
      sub.notes || ''
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                ADMIN MODE
              </div>
              <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                Subscription Tracking
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              💳 Subscription Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage all business subscriptions and recurring costs
            </p>
          </div>
          <Link href="/admin-hub">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Admin Hub
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Subscriptions</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{subscriptions.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Cost</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalMonthlyAmount.toFixed(2)}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Yearly</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalYearlyAmount.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Renewals (30 days)</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{upcomingRenewals}</p>
                  {expiredSubs > 0 && (
                    <p className="text-xs text-red-600 mt-1">⚠️ {expiredSubs} expired</p>
                  )}
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Button onClick={() => { resetForm(); setIsOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {filteredSubscriptions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No subscriptions found</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setIsOpen(true); }}>Add Your First Subscription</Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Expires On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Renewal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSubscriptions.map(sub => {
                    const daysLeft = calculateDaysUntilExpiration(sub.expiration_date);
                    const urgency = getUrgencyBadge(daysLeft);
                    return (
                      <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {sub.platform_service}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">{sub.category}</Badge>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">
                          ${sub.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {new Date(sub.expiration_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={urgency.color}>
                            {urgency.label} ({daysLeft > 0 ? `${daysLeft}d` : 'Expired'})
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            {sub.renewal_method === 'Auto-renew' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : null}
                            {sub.renewal_method}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(sub)}
                              className="flex items-center gap-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(sub.id)}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Add'} Subscription</DialogTitle>
            <DialogDescription>
              Enter the subscription details below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform/Service *</Label>
              <Input
                id="platform"
                placeholder="e.g., Vercel, Supabase, Stripe"
                value={formData.platform_service}
                onChange={(e) => setFormData({ ...formData, platform_service: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="datePaid">Date Paid *</Label>
                <Input
                  id="datePaid"
                  type="date"
                  value={formData.date_paid}
                  onChange={(e) => setFormData({ ...formData, date_paid: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="length">Length of Subscription *</Label>
              <select
                id="length"
                value={formData.length_of_subscription}
                onChange={(e) => setFormData({ ...formData, length_of_subscription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
              >
                <option>1 month</option>
                <option>3 months</option>
                <option>6 months</option>
                <option>1 year</option>
                <option>2 years</option>
                <option>3 years</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiration">Expiration Date *</Label>
                <Input
                  id="expiration"
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="renewal">Renewal Date</Label>
                <Input
                  id="renewal"
                  type="date"
                  value={formData.renewal_date}
                  onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="renewalMethod">Renewal Method</Label>
              <select
                id="renewalMethod"
                value={formData.renewal_method}
                onChange={(e) => setFormData({ ...formData, renewal_method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
              >
                {RENEWAL_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this subscription..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="future">Future Platform/Alternative</Label>
              <Input
                id="future"
                placeholder="e.g., 'Planning to move to...'"
                value={formData.future_platform}
                onChange={(e) => setFormData({ ...formData, future_platform: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6">
            <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              {editingId ? 'Update' : 'Add'} Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
