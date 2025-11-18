"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Building2, 
  Users, 
  DollarSign, 
  AlertCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

interface CostCenter {
  id: string;
  name: string;
  code: string;
  manager: string;
  budget: number;
  spent: number;
  status: 'active' | 'inactive';
  department: string;
}

export function CostCentersManager() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    loadCostCenters();
  }, []);

  const loadCostCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/finance/cost-centers', {
        headers: { 'x-tenant-id': 'demo-tenant' }
      });
      
      if (!response.ok) throw new Error('Failed to fetch cost centers');
      
      const data = await response.json();
      setCostCenters(data.data || data.costCenters || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cost centers');
      // Fallback demo data
      setCostCenters([
        {
          id: '1',
          name: 'Sales Department',
          code: 'CC-001',
          manager: 'John Smith',
          budget: 50000,
          spent: 35000,
          status: 'active',
          department: 'Sales'
        },
        {
          id: '2',
          name: 'Marketing Team',
          code: 'CC-002',
          manager: 'Sarah Johnson',
          budget: 25000,
          spent: 18000,
          status: 'active',
          department: 'Marketing'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationPercentage = (spent: number, budget: number) => {
    return budget > 0 ? (spent / budget) * 100 : 0;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredCostCenters = costCenters.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         center.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         center.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || center.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(costCenters.map(center => center.department))];

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
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cost centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Cost Center
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredCostCenters.map((center) => {
          const utilizationPercentage = getUtilizationPercentage(center.spent, center.budget);
          
          return (
            <Card key={center.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{center.name}</CardTitle>
                    <CardDescription>Code: {center.code}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(center.status)}
                    <span className="text-sm text-gray-600">{center.department}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      Manager: {center.manager}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget Utilization</span>
                      <span className="font-medium">
                        ${center.spent.toLocaleString()} / ${center.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getUtilizationColor(utilizationPercentage)}`}
                        style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {utilizationPercentage.toFixed(1)}% utilized
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <DollarSign className="h-4 w-4 mr-1" />
                      View Expenses
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCostCenters.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No cost centers found matching your criteria</p>
        </div>
      )}
    </div>
  );
}