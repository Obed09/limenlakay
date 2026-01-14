'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Send,
  Download,
  MoreVertical,
  Edit,
  CheckCircle,
  Copy,
  Trash2,
  ArrowLeft,
  Save,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_address: string | null;
  customer_phone: string | null;
  date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_percentage: number;
  discount_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string | null;
  terms: string | null;
  payment_method: string | null;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const printRef = useRef<HTMLDivElement>(null);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<Partial<Invoice>>({});

  useEffect(() => {
    if (params.id === 'new') {
      initializeNewInvoice();
    } else {
      fetchInvoice();
    }
  }, [params.id]);

  const initializeNewInvoice = () => {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    
    setInvoice({
      id: 'new',
      invoice_number: `INV-${Date.now()}`,
      customer_name: '',
      customer_email: '',
      customer_address: '',
      customer_phone: '',
      date: today,
      due_date: dueDate.toISOString().split('T')[0],
      subtotal: 0,
      tax_rate: 7,
      tax_amount: 0,
      discount_percentage: 0,
      discount_amount: 0,
      total: 0,
      status: 'draft',
      notes: 'Please send payment via Zelle to the following email address:\nLIMENLAKAYLLC@GMAIL.COM',
      terms: 'Payment Due: Payment is required within 7 days of the invoice date unless otherwise agreed.\n\nLate Fees: Unpaid balances incur a 2% late fee per week after the due date.\n\nPayment Methods: We accept bank transfer, debit/credit card, or approved digital payment platforms.\n\nDelivery Schedule: Work or deliverables will be provided according to the agreed project timeline.',
      payment_method: null,
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setIsEditing(true);
    setLoading(false);
  };

  const fetchInvoice = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      
      setInvoice({
        ...data,
        items: data.invoice_items || [],
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateInvoice = (items: InvoiceItem[], taxRate: number, discountPercentage: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discountAmount = (subtotal * discountPercentage) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
    const total = subtotalAfterDiscount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total,
    };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    if (!invoice) return;

    const newItems = [...invoice.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    const calculations = calculateInvoice(newItems, invoice.tax_rate, invoice.discount_percentage);
    
    setInvoice({
      ...invoice,
      items: newItems,
      ...calculations,
    });
  };

  const addItem = () => {
    if (!invoice) return;
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: '', quantity: 1, rate: 0, amount: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (!invoice || invoice.items.length <= 1) return;
    const newItems = invoice.items.filter((_, i) => i !== index);
    const calculations = calculateInvoice(newItems, invoice.tax_rate, invoice.discount_percentage);
    
    setInvoice({
      ...invoice,
      items: newItems,
      ...calculations,
    });
  };

  const handleTaxChange = (taxRate: number) => {
    if (!invoice) return;
    const calculations = calculateInvoice(invoice.items, taxRate, invoice.discount_percentage);
    setInvoice({ ...invoice, tax_rate: taxRate, ...calculations });
  };

  const handleDiscountChange = (discountPercentage: number) => {
    if (!invoice) return;
    const calculations = calculateInvoice(invoice.items, invoice.tax_rate, discountPercentage);
    setInvoice({ ...invoice, discount_percentage: discountPercentage, ...calculations });
  };

  const saveInvoice = async () => {
    if (!invoice) return;

    // Validate required fields
    if (!invoice.customer_name || !invoice.customer_email) {
      toast({
        title: 'Validation Error',
        description: 'Customer name and email are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (params.id === 'new') {
        const { data, error } = await supabase
          .from('invoices')
          .insert({
            invoice_number: invoice.invoice_number,
            customer_name: invoice.customer_name,
            customer_email: invoice.customer_email,
            customer_address: invoice.customer_address || null,
            customer_phone: invoice.customer_phone || null,
            date: invoice.date,
            due_date: invoice.due_date,
            subtotal: invoice.subtotal,
            tax_rate: invoice.tax_rate,
            tax_amount: invoice.tax_amount,
            discount_percentage: invoice.discount_percentage,
            discount_amount: invoice.discount_amount,
            total: invoice.total,
            status: invoice.status,
            notes: invoice.notes || null,
            terms: invoice.terms || null,
            payment_method: invoice.payment_method || null,
          })
          .select()
          .single();

        if (error) {
          console.error('Invoice insert error:', error);
          throw error;
        }

        // Insert items
        const itemsToInsert = invoice.items.map(item => ({
          invoice_id: data.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        toast({
          title: 'Success',
          description: 'Invoice created successfully',
        });

        router.push(`/admin-invoices/${data.id}`);
      } else {
        const { error } = await supabase
          .from('invoices')
          .update({
            customer_name: invoice.customer_name,
            customer_email: invoice.customer_email,
            customer_address: invoice.customer_address,
            customer_phone: invoice.customer_phone,
            date: invoice.date,
            due_date: invoice.due_date,
            subtotal: invoice.subtotal,
            tax_rate: invoice.tax_rate,
            tax_amount: invoice.tax_amount,
            discount_percentage: invoice.discount_percentage,
            discount_amount: invoice.discount_amount,
            total: invoice.total,
            status: invoice.status,
            notes: invoice.notes,
            terms: invoice.terms,
            payment_method: invoice.payment_method,
            updated_at: new Date().toISOString(),
          })
          .eq('id', params.id);

        if (error) throw error;

        // Delete existing items
        await supabase.from('invoice_items').delete().eq('invoice_id', params.id);

        // Insert updated items
        const itemsToInsert = invoice.items.map(item => ({
          invoice_id: params.id as string,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        toast({
          title: 'Success',
          description: 'Invoice updated successfully',
        });

        setIsEditing(false);
        fetchInvoice();
      }
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save invoice',
        variant: 'destructive',
      });
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;
    
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', params.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invoice sent successfully',
      });

      fetchInvoice();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invoice',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid', payment_method: 'Manual' })
        .eq('id', params.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invoice marked as paid',
      });

      fetchInvoice();
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark invoice as paid',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async () => {
    if (!invoice) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: `INV-${Date.now()}`,
          customer_name: invoice.customer_name,
          customer_email: invoice.customer_email,
          customer_address: invoice.customer_address,
          customer_phone: invoice.customer_phone,
          date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtotal: invoice.subtotal,
          tax_rate: invoice.tax_rate,
          tax_amount: invoice.tax_amount,
          discount_percentage: invoice.discount_percentage,
          discount_amount: invoice.discount_amount,
          total: invoice.total,
          status: 'draft',
          notes: invoice.notes,
          terms: invoice.terms,
        })
        .select()
        .single();

      if (error) throw error;

      // Duplicate items
      const itemsToInsert = invoice.items.map(item => ({
        invoice_id: data.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      }));

      await supabase.from('invoice_items').insert(itemsToInsert);

      toast({
        title: 'Success',
        description: 'Invoice duplicated successfully',
      });

      router.push(`/admin-invoices/${data.id}`);
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate invoice',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;

    try {
      // Delete items first
      await supabase.from('invoice_items').delete().eq('invoice_id', params.id);
      
      // Delete invoice
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', params.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invoice deleted successfully',
      });

      router.push('/admin-invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete invoice',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!printRef.current) return;

    // Use modern browser print API
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200';
      case 'sent':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200';
      case 'overdue':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200';
      case 'draft':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200';
      case 'cancelled':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Invoice not found</h2>
          <Button onClick={() => router.push('/admin-invoices')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="container mx-auto p-6 max-w-5xl">
        {/* Action Bar */}
        <div className="no-print mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin-invoices')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2 flex-wrap">
            {isEditing ? (
              <>
                <Button onClick={saveInvoice} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    if (params.id !== 'new') {
                      fetchInvoice();
                    } else {
                      router.push('/admin-invoices');
                    }
                  }}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSendInvoice}
                  disabled={invoice.status === 'paid'}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
                <Button onClick={handleDownload} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      More options
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleMarkAsPaid}
                      disabled={invoice.status === 'paid'}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Paid
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* Invoice */}
        <Card className="p-8" id="invoice-print-area" ref={printRef}>
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src="/images/limen-lakay-logo.png"
                  alt="Limen Lakay LLC"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <h2 className="text-lg font-semibold">Limen Lakay LLC</h2>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold mb-2">INVOICE</h1>
              <p className="text-muted-foreground">
                #{invoice.invoice_number}
              </p>
            </div>
          </div>

          {/* Customer & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <Label className="text-xs text-muted-foreground mb-2">Bill To</Label>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={invoice.customer_name}
                    onChange={(e) =>
                      setInvoice({ ...invoice, customer_name: e.target.value })
                    }
                    placeholder="Customer Name"
                  />
                  <Input
                    type="email"
                    value={invoice.customer_email}
                    onChange={(e) =>
                      setInvoice({ ...invoice, customer_email: e.target.value })
                    }
                    placeholder="customer@email.com"
                  />
                  <Input
                    value={invoice.customer_phone || ''}
                    onChange={(e) =>
                      setInvoice({ ...invoice, customer_phone: e.target.value })
                    }
                    placeholder="Phone (optional)"
                  />
                  <Textarea
                    value={invoice.customer_address || ''}
                    onChange={(e) =>
                      setInvoice({ ...invoice, customer_address: e.target.value })
                    }
                    placeholder="Address (optional)"
                    rows={2}
                  />
                </div>
              ) : (
                <div>
                  <p className="font-semibold">{invoice.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>
                  {invoice.customer_phone && (
                    <p className="text-sm text-muted-foreground">{invoice.customer_phone}</p>
                  )}
                  {invoice.customer_address && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {invoice.customer_address}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                {isEditing ? (
                  <Input
                    type="date"
                    value={invoice.date}
                    onChange={(e) =>
                      setInvoice({ ...invoice, date: e.target.value })
                    }
                    className="w-40 h-8"
                  />
                ) : (
                  <span className="font-medium">{formatDate(invoice.date)}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                {isEditing ? (
                  <Input
                    type="date"
                    value={invoice.due_date}
                    onChange={(e) =>
                      setInvoice({ ...invoice, due_date: e.target.value })
                    }
                    className="w-40 h-8"
                  />
                ) : (
                  <span className="font-medium">{formatDate(invoice.due_date)}</span>
                )}
              </div>
              {!isEditing && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-semibold">Balance Due</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-muted-foreground">
                    ITEM
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-muted-foreground w-24">
                    QUANTITY
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-muted-foreground w-32">
                    RATE
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-muted-foreground w-32">
                    AMOUNT
                  </th>
                  {isEditing && (
                    <th className="w-12"></th>
                  )}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4">
                      {isEditing ? (
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(index, 'description', e.target.value)
                          }
                          placeholder="Item description"
                        />
                      ) : (
                        <span>{item.description}</span>
                      )}
                    </td>
                    <td className="text-right py-4">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)
                          }
                          className="text-right"
                        />
                      ) : (
                        <span>{item.quantity}</span>
                      )}
                    </td>
                    <td className="text-right py-4">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)
                          }
                          className="text-right"
                        />
                      ) : (
                        <span>{formatCurrency(item.rate)}</span>
                      )}
                    </td>
                    <td className="text-right py-4 font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                    {isEditing && (
                      <td className="text-center py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={invoice.items.length <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={addItem}
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            )}
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-96 space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>

              {/* Discount */}
              <div className="flex justify-between py-2 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Discount</span>
                  {isEditing && (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={invoice.discount_percentage}
                      onChange={(e) =>
                        handleDiscountChange(parseFloat(e.target.value) || 0)
                      }
                      className="w-20 h-8"
                    />
                  )}
                  {!isEditing && invoice.discount_percentage > 0 && (
                    <span className="text-sm">({invoice.discount_percentage}%)</span>
                  )}
                </div>
                <span className="font-medium text-red-600">
                  {invoice.discount_amount > 0 && '-'}
                  {formatCurrency(invoice.discount_amount)}
                </span>
              </div>

              {/* Tax */}
              <div className="flex justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Tax</span>
                  {isEditing && (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={invoice.tax_rate}
                      onChange={(e) =>
                        handleTaxChange(parseFloat(e.target.value) || 0)
                      }
                      className="w-20 h-8"
                    />
                  )}
                  {!isEditing && (
                    <span className="text-sm">({invoice.tax_rate}%)</span>
                  )}
                </div>
                <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
              </div>

              <div className="flex justify-between py-3 border-t-2 border-gray-200">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 gap-6 pt-6 border-t">
            <div>
              <Label className="text-xs text-muted-foreground mb-2">Notes</Label>
              {isEditing ? (
                <Textarea
                  value={invoice.notes || ''}
                  onChange={(e) =>
                    setInvoice({ ...invoice, notes: e.target.value })
                  }
                  placeholder="Payment instructions or additional notes..."
                  rows={3}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {invoice.notes}
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2">Terms</Label>
              {isEditing ? (
                <Textarea
                  value={invoice.terms || ''}
                  onChange={(e) =>
                    setInvoice({ ...invoice, terms: e.target.value })
                  }
                  placeholder="Payment terms and conditions..."
                  rows={4}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {invoice.terms}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
