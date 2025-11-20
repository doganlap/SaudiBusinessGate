'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import { 
  Users, 
  Plus, 
  Search, 
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  Activity,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'prospect';
  totalValue: number;
  lastContact: string;
  assignedTo: string;
  createdAt: string;
}

export default function CRMPage() {
  const params = useParams();
  const lng = params.lng as string;
  const { t } = useTranslation(lng, 'crm', {});
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crm/customers', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      if (data.success && data.customers) {
        // Map API response to component format
        const mappedCustomers = data.customers.map((customer: any) => ({
          id: customer.id,
          name: customer.name,
          company: customer.company,
          email: customer.email,
          phone: customer.phone,
          status: customer.status,
          totalValue: customer.totalValue || 0,
          lastContact: customer.lastOrder ? new Date(customer.lastOrder).toISOString() : customer.createdAt,
          assignedTo: customer.assignedTo || '',
          createdAt: customer.createdAt
        }));
        setCustomers(mappedCustomers);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      // Keep empty array on error
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{lng === 'ar' ? 'جاري تحميل بيانات إدارة العملاء...' : 'Loading CRM data...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lng === 'ar' ? 'إدارة علاقات العملاء' : 'Customer Relationship Management'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {lng === 'ar' ? 'إدارة علاقات العملاء وتتبع التفاعلات' : 'Manage customer relationships and track interactions'}
              </p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 rtl:flex-row-reverse">
              <Plus className="h-4 w-4" />
              {lng === 'ar' ? 'إضافة عميل' : 'Add Customer'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 rtl:ml-0 rtl:mr-4">
                <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 rtl:ml-0 rtl:mr-4">
                <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'العملاء النشطين' : 'Active Customers'}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 rtl:ml-0 rtl:mr-4">
                <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'إجمالي القيمة' : 'Total Value'}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.totalValue, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4 rtl:ml-0 rtl:mr-4">
                <p className="text-sm font-medium text-gray-600">{lng === 'ar' ? 'العملاء المحتملين' : 'Prospects'}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'prospect').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
                <input
                  type="text"
                  placeholder={lng === 'ar' ? 'البحث في العملاء...' : 'Search customers...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl:pl-4 rtl:pr-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label={lng === 'ar' ? 'تصفية حسب الحالة' : 'Filter by status'}
              >
                <option value="all">{lng === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                <option value="active">{lng === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="inactive">{lng === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                <option value="prospect">{lng === 'ar' ? 'محتمل' : 'Prospect'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lng === 'ar' ? 'العميل' : 'Customer'}
                  </th>
                  <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lng === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lng === 'ar' ? 'إجمالي القيمة' : 'Total Value'}
                  </th>
                  <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lng === 'ar' ? 'آخر اتصال' : 'Last Contact'}
                  </th>
                  <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lng === 'ar' ? 'مُسند إلى' : 'Assigned To'}
                  </th>
                  <th className="px-6 py-3 text-right rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lng === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-right rtl:text-right">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 rtl:flex-row-reverse">
                          <Building className="h-3 w-3" />
                          {customer.company}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 rtl:flex-row-reverse">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 rtl:flex-row-reverse">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                        {lng === 'ar' ? (customer.status === 'active' ? 'نشط' : customer.status === 'inactive' ? 'غير نشط' : customer.status === 'prospect' ? 'محتمل' : customer.status) : customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-right">
                      {formatCurrency(customer.totalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right rtl:text-right">
                      <div className="flex items-center gap-1 rtl:flex-row-reverse">
                        <Calendar className="h-3 w-3" />
                        {formatDate(customer.lastContact)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right rtl:text-right">
                      {customer.assignedTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right rtl:text-right">
                      <div className="flex items-center gap-2 rtl:flex-row-reverse">
                        <button className="p-1 text-blue-600 hover:text-blue-700" title={lng === 'ar' ? 'عرض العميل' : 'View customer'}>
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-gray-700" title={lng === 'ar' ? 'تعديل العميل' : 'Edit customer'}>
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:text-red-700" title={lng === 'ar' ? 'حذف العميل' : 'Delete customer'}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{lng === 'ar' ? 'لم يتم العثور على عملاء' : 'No customers found'}</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? (lng === 'ar' ? 'جرب تعديل البحث أو المرشحات' : 'Try adjusting your search or filters')
                  : (lng === 'ar' ? 'ابدأ بإضافة عميلك الأول' : 'Get started by adding your first customer')
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
