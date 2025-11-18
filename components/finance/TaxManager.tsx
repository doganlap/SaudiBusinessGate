"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Calculator, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  RefreshCw,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: 'sales' | 'income' | 'property' | 'payroll';
  jurisdiction: string;
  effectiveDate: string;
  status: 'active' | 'inactive';
}

interface TaxCalculation {
  period: string;
  taxType: string;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  status: 'calculated' | 'filed' | 'paid';
}

export function TaxManager() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [taxCalculations, setTaxCalculations] = useState<TaxCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTaxData();
  }, []);

  const loadTaxData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load tax rates
      const ratesRes = await fetch('/api/finance/tax/rates', {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      if (!ratesRes.ok) throw new Error('Failed to fetch tax rates');
      
      const ratesData = await ratesRes.json();
      setTaxRates(ratesData.data || ratesData.rates || []);

      // Load tax calculations
      const calculationsRes = await fetch('/api/finance/tax/calculations?limit=12', {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      if (!calculationsRes.ok) throw new Error('Failed to fetch tax calculations');
      
      const calculationsData = await calculationsRes.json();
      setTaxCalculations(calculationsData.data || calculationsData.calculations || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tax data');
      // Fallback demo data
      setTaxRates([
        {
          id: '1',
          name: 'Sales Tax',
          rate: 8.25,
          type: 'sales',
          jurisdiction: 'State of California',
          effectiveDate: '2024-01-01',
          status: 'active'
        },
        {
          id: '2',
          name: 'Corporate Income Tax',
          rate: 21.0,
          type: 'income',
          jurisdiction: 'Federal',
          effectiveDate: '2024-01-01',
          status: 'active'
        },
        {
          id: '3',
          name: 'Property Tax',
          rate: 1.2,
          type: 'property',
          jurisdiction: 'County',
          effectiveDate: '2024-01-01',
          status: 'active'
        }
      ]);
      
      setTaxCalculations([
        {
          period: '2024-Q1',
          taxType: 'Sales Tax',
          taxableAmount: 125000,
          taxRate: 8.25,
          taxAmount: 10312.50,
          status: 'paid'
        },
        {
          period: '2024-Q1',
          taxType: 'Income Tax',
          taxableAmount: 75000,
          taxRate: 21.0,
          taxAmount: 15750.00,
          status: 'filed'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTaxTypeColor = (type: string) => {
    switch (type) {
      case 'sales': return '#3B82F6';
      case 'income': return '#10B981';
      case 'property': return '#F59E0B';
      case 'payroll': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'filed':
        return <Badge className="bg-blue-100 text-blue-800">Filed</Badge>;
      case 'calculated':
        return <Badge className="bg-yellow-100 text-yellow-800">Calculated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const taxTypeData = taxRates.map(rate => ({
    name: rate.name,
    rate: rate.rate,
    fill: getTaxTypeColor(rate.type)
  }));

  const monthlyTaxData = [
    { month: 'Jan', sales: 8500, income: 12000, property: 2500 },
    { month: 'Feb', sales: 9200, income: 13500, property: 2500 },
    { month: 'Mar', sales: 10100, income: 15750, property: 2500 },
    { month: 'Apr', sales: 8800, income: 14200, property: 2500 },
    { month: 'May', sales: 9500, income: 13800, property: 2500 },
    { month: 'Jun', sales: 10300, income: 16200, property: 2500 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Liability</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$26,062.50</div>
            <p className="text-xs text-muted-foreground">Current quarter</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tax Rates</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxRates.length}</div>
            <p className="text-xs text-muted-foreground">Configured rates</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">On-time filings</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Rates */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Tax Rates</CardTitle>
              <CardDescription>Current tax rates and jurisdictions</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taxRates.map((rate) => (
              <div key={rate.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getTaxTypeColor(rate.type) }}
                  />
                  <div>
                    <p className="font-medium">{rate.name}</p>
                    <p className="text-sm text-gray-600">{rate.jurisdiction}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">{rate.rate}%</p>
                    <p className="text-sm text-gray-600">
                      Effective: {new Date(rate.effectiveDate).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(rate.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tax Distribution</CardTitle>
            <CardDescription>Breakdown by tax type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taxTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="rate"
                >
                  {taxTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Tax Trends</CardTitle>
            <CardDescription>Tax payments over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTaxData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3B82F6" name="Sales Tax" />
                <Line type="monotone" dataKey="income" stroke="#10B981" name="Income Tax" />
                <Line type="monotone" dataKey="property" stroke="#F59E0B" name="Property Tax" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calculations */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Tax Calculations</CardTitle>
              <CardDescription>Latest tax calculations and filings</CardDescription>
            </div>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {taxCalculations.map((calculation, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{calculation.taxType} - {calculation.period}</p>
                  <p className="text-sm text-gray-600">
                    Taxable: ${calculation.taxableAmount.toLocaleString()} @ {calculation.taxRate}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${calculation.taxAmount.toLocaleString()}</p>
                  {getStatusBadge(calculation.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}