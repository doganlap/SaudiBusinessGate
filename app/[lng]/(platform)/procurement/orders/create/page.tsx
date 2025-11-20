/**
 * Create Purchase Order Page
 * Connected to: POST /api/procurement/orders
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Trash2, Calculator } from 'lucide-react';

interface OrderItem {
  itemId?: string;
  itemName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
  category?: string;
}

interface Vendor {
  id: string;
  name: string;
  vendorCode: string;
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.lng as string) || 'en';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [orderSummary, setOrderSummary] = useState({ subtotal: 0, tax: 0, total: 0 });

  const [formData, setFormData] = useState({
    vendorId: '',
    description: '',
    category: '',
    priority: 'medium',
    currency: 'SAR',
    paymentTerms: '',
    expectedDelivery: '',
    notes: '',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    calculateSummary();
  }, [items]);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/procurement/vendors', {
        headers: { 'tenant-id': 'default-tenant' }
      });
      const data = await response.json();
      if (data.success && data.vendors) {
        setVendors(data.vendors);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  };

  const calculateSummary = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.15; // 15% VAT
    const total = subtotal + tax;
    setOrderSummary({ subtotal, tax, total });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setItems([...items, {
      itemName: '',
      sku: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      description: '',
      category: '',
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = (newItems[index].quantity || 0) * (newItems[index].unitPrice || 0);
    }
    
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (items.length === 0) {
      setError('Please add at least one item to the order');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/procurement/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          ...formData,
          items: items.map(item => ({
            itemName: item.itemName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            description: item.description,
            category: item.category,
          })),
          totalAmount: orderSummary.total,
          status: 'draft',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create purchase order');
      }

      setSuccess('Purchase order created successfully!');
      setTimeout(() => {
        router.push(`/${locale}/procurement/orders`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Purchase Order</h1>
        <div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
                    <select
                      id="vendorId"
                      name="vendorId"
                      value={formData.vendorId}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name} ({vendor.vendorCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="SAR">SAR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="expectedDelivery" className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
                    <input
                      type="date"
                      id="expectedDelivery"
                      name="expectedDelivery"
                      value={formData.expectedDelivery}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                    <input
                      type="text"
                      id="paymentTerms"
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleChange}
                      placeholder="e.g., Net 30"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Order Items</h3>
                    <Button type="button" onClick={addItem} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Add Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Item {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                            <input
                              type="text"
                              value={item.itemName}
                              onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                              required
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input
                              type="text"
                              value={item.sku}
                              onChange={(e) => updateItem(index, 'sku', e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              required
                              min="1"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              required
                              min="0"
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                            <input
                              type="number"
                              value={item.totalPrice.toFixed(2)}
                              readOnly
                              className="w-full rounded-md border-gray-300 shadow-sm bg-gray-50 cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                              type="text"
                              value={item.category || ''}
                              onChange={(e) => updateItem(index, 'category', e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={item.description || ''}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No items added yet. Click "Add Item" to start.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  {error && <p className="text-red-500 text-sm self-center">{error}</p>}
                  {success && <p className="text-green-500 text-sm self-center">{success}</p>}
                  <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    {loading ? 'Creating...' : <><Save className="h-4 w-4" /> Create Order</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" /> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{orderSummary.subtotal.toFixed(2)} {formData.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (15%):</span>
                <span className="font-medium">{orderSummary.tax.toFixed(2)} {formData.currency}</span>
              </div>
              <div className="flex justify-between pt-4 border-t font-bold text-lg">
                <span>Total:</span>
                <span>{orderSummary.total.toFixed(2)} {formData.currency}</span>
              </div>
              <div className="pt-4">
                <p className="text-sm text-gray-500">
                  {items.length} item{items.length !== 1 ? 's' : ''} in this order
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

