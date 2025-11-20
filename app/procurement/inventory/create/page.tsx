/**
 * Create Inventory Item Page
 * Connected to: POST /api/procurement/inventory
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
}

export default function CreateInventoryItemPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.lng || 'en';

  const [loading, setLoading] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    category: '',
    subcategory: '',
    description: '',
    sku: '',
    barcode: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 1000,
    reorderPoint: 0,
    unitPrice: 0,
    location: '',
    vendorId: '',
    unitOfMeasure: 'unit',
    currency: 'SAR',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/procurement/vendors', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });

      const data = await response.json();
      
      if (data.success && data.vendors) {
        const mappedVendors = data.vendors.map((v: any) => ({
          id: v.id || '',
          name: v.name || v.vendor_name || '',
        }));
        setVendors(mappedVendors);
      }
    } catch (err: any) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name) {
        throw new Error('Item name is required');
      }

      const response = await fetch('/api/procurement/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          name: formData.name,
          nameAr: formData.nameAr,
          category: formData.category,
          subcategory: formData.subcategory,
          description: formData.description,
          sku: formData.sku,
          barcode: formData.barcode,
          currentStock: formData.currentStock,
          minStock: formData.minStock,
          maxStock: formData.maxStock,
          reorderPoint: formData.reorderPoint || formData.minStock,
          unitPrice: formData.unitPrice,
          location: formData.location,
          vendorId: formData.vendorId || null,
          unitOfMeasure: formData.unitOfMeasure,
          currency: formData.currency,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create inventory item');
      }

      // Redirect to inventory list
      router.push(`/${locale}/procurement/inventory`);
    } catch (err: any) {
      console.error('Error creating inventory item:', err);
      setError(err.message || 'Failed to create inventory item');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotalValue = () => {
    return formData.currentStock * formData.unitPrice;
  };

  if (loadingVendors) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Inventory Item</h1>
            <p className="text-gray-600 mt-1">Add a new item to inventory</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Item Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name (English) *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="nameAr" className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name (Arabic)
                      </label>
                      <input
                        type="text"
                        id="nameAr"
                        name="nameAr"
                        value={formData.nameAr}
                        onChange={handleChange}
                        dir="rtl"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                        SKU
                      </label>
                      <input
                        type="text"
                        id="sku"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                        Barcode
                      </label>
                      <input
                        type="text"
                        id="barcode"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g., Office Supplies"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory
                      </label>
                      <input
                        type="text"
                        id="subcategory"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Vendor
                      </label>
                      <select
                        id="vendorId"
                        name="vendorId"
                        value={formData.vendorId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Warehouse A, Shelf 3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Item description..."
                    />
                  </div>

                  {/* Stock Management */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Stock Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-2">
                          Current Stock *
                        </label>
                        <input
                          type="number"
                          id="currentStock"
                          name="currentStock"
                          required
                          value={formData.currentStock}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-gray-700 mb-2">
                          Unit of Measure
                        </label>
                        <select
                          id="unitOfMeasure"
                          name="unitOfMeasure"
                          value={formData.unitOfMeasure}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="unit">Unit</option>
                          <option value="kg">Kilogram (kg)</option>
                          <option value="g">Gram (g)</option>
                          <option value="L">Liter (L)</option>
                          <option value="mL">Milliliter (mL)</option>
                          <option value="m">Meter (m)</option>
                          <option value="cm">Centimeter (cm)</option>
                          <option value="box">Box</option>
                          <option value="pack">Pack</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Stock Level *
                        </label>
                        <input
                          type="number"
                          id="minStock"
                          name="minStock"
                          required
                          value={formData.minStock}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="maxStock" className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Stock Level
                        </label>
                        <input
                          type="number"
                          id="maxStock"
                          name="maxStock"
                          value={formData.maxStock}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="reorderPoint" className="block text-sm font-medium text-gray-700 mb-2">
                          Reorder Point
                        </label>
                        <input
                          type="number"
                          id="reorderPoint"
                          name="reorderPoint"
                          value={formData.reorderPoint}
                          onChange={handleChange}
                          min="0"
                          placeholder="Auto-set to min stock if empty"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-2">
                          Unit Price *
                        </label>
                        <div className="relative">
                          <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="absolute left-0 top-0 bottom-0 px-3 py-2 border-r border-gray-300 rounded-l-lg bg-gray-50"
                          >
                            <option value="SAR">SAR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                          <input
                            type="number"
                            id="unitPrice"
                            name="unitPrice"
                            required
                            value={formData.unitPrice}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 pl-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Item Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Current Stock</span>
                      <span className="font-medium">{formData.currentStock} {formData.unitOfMeasure}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Unit Price</span>
                      <span className="font-medium">{formData.currency} {formData.unitPrice.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total Value</span>
                        <span>{formData.currency} {calculateTotalValue().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Create Item
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={loading}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

