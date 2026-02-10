'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Package, Eye, Truck, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: string;
  payment_status: string;
  tracking_number: string | null;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  custom_order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  vessel: {
    name: string;
    color: string;
    size: string;
  };
  scent: {
    name: string;
    name_english: string;
    notes: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const supabase = createClient();

  // Update form
  const [updateData, setUpdateData] = useState({
    status: '',
    payment_status: '',
    tracking_number: '',
    admin_notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_orders')
        .select(`
          *,
          custom_order_items (
            *,
            vessel:candle_vessels (name, color, size),
            scent:candle_scents (name, name_english, notes)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('custom_orders')
        .update(updateData)
        .eq('id', selectedOrder.id);

      if (error) throw error;

      // If status changed to "shipped" and tracking number provided, send email
      if (updateData.status === 'shipped' && updateData.tracking_number) {
        try {
          const shippingAddress = `${selectedOrder.shipping_address}, ${selectedOrder.shipping_city}, ${selectedOrder.shipping_state} ${selectedOrder.shipping_zip}`;
          
          await fetch('/api/orders/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: selectedOrder.customer_email,
              type: 'shipped',
              orderNumber: selectedOrder.order_number,
              customerName: selectedOrder.customer_name,
              trackingNumber: updateData.tracking_number,
              shippingAddress: shippingAddress,
            }),
          });

          toast({
            title: 'Success!',
            description: 'Order updated and tracking email sent to customer',
          });
        } catch (emailError) {
          console.error('Email error:', emailError);
          toast({
            title: 'Order Updated',
            description: 'Order updated but email failed to send. You may need to notify customer manually.',
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: 'Success',
          description: 'Order updated successfully'
        });
      }

      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Order Management</h1>
          <p className="text-muted-foreground">
            Manage custom candle orders from customers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.status === 'pending').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.status === 'shipped').length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">
                  ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {order.order_number}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()} at{' '}
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Badge className={getPaymentStatusColor(order.payment_status)}>
                    {order.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium mb-1">Customer</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer_email}
                  </p>
                  {order.customer_phone && (
                    <p className="text-sm text-muted-foreground">
                      {order.customer_phone}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Order Total</p>
                  <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    Subtotal: ${order.subtotal.toFixed(2)} + Shipping: $
                    {order.shipping_cost.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4 mb-4">
                <p className="text-sm font-medium mb-2">Items:</p>
                <div className="space-y-2">
                  {order.custom_order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm bg-muted p-2 rounded"
                    >
                      <div>
                        <p className="font-medium">{item.vessel.name}</p>
                        <p className="text-muted-foreground">
                          Scent: {item.scent.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${item.unit_price.toFixed(2)} × {item.quantity}
                        </p>
                        <p className="text-muted-foreground">
                          ${item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.tracking_number && (
                <div className="mb-4">
                  <p className="text-sm font-medium">Tracking Number:</p>
                  <p className="text-sm text-muted-foreground">
                    {order.tracking_number}
                  </p>
                </div>
              )}

              {order.admin_notes && (
                <div className="mb-4 bg-yellow-50 p-3 rounded">
                  <p className="text-sm font-medium">Admin Notes:</p>
                  <p className="text-sm text-muted-foreground">
                    {order.admin_notes}
                  </p>
                </div>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setUpdateData({
                        status: order.status,
                        payment_status: order.payment_status,
                        tracking_number: order.tracking_number || '',
                        admin_notes: order.admin_notes || ''
                      });
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Update Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Update Order {order.order_number}</DialogTitle>
                    <DialogDescription>
                      Update order status, payment, and tracking information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Order Status</Label>
                        <Select
                          value={updateData.status}
                          onValueChange={(value) =>
                            setUpdateData({ ...updateData, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="payment_status">Payment Status</Label>
                        <Select
                          value={updateData.payment_status}
                          onValueChange={(value) =>
                            setUpdateData({
                              ...updateData,
                              payment_status: value
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tracking_number">Tracking Number</Label>
                      <Input
                        id="tracking_number"
                        value={updateData.tracking_number}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            tracking_number: e.target.value
                          })
                        }
                        placeholder="Enter tracking number..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="admin_notes">Admin Notes</Label>
                      <Textarea
                        id="admin_notes"
                        value={updateData.admin_notes}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            admin_notes: e.target.value
                          })
                        }
                        placeholder="Internal notes..."
                        rows={4}
                      />
                    </div>

                    <Button onClick={handleUpdateOrder} className="w-full">
                      Update Order
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'all'
                ? 'No orders have been placed yet'
                : `No ${statusFilter} orders found`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
