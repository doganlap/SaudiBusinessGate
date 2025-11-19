'use client';

/**
 * Cash Flow Statement Component
 * Displays operating, investing, and financing cash flows
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-react';
// Using fetch directly for client component

interface CashFlowData {
  operating: number;
  investing: number;
  financing: number;
  netChange: number;
  beginningBalance: number;
  endingBalance: number;
  period: string;
}

export function CashFlowStatement() {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadCashFlow();
  }, [period]);

  const loadCashFlow = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/finance/cash-flow?period=${period}`).then(r => r.json());

      if (response.data) {
        setData(response.data);
      } else if (response.operating !== undefined) {
        setData(response);
      } else {
        // Default empty state
        setData({
          operating: 0,
          investing: 0,
          financing: 0,
          netChange: 0,
          beginningBalance: 0,
          endingBalance: 0,
          period: period
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load cash flow data');
      console.error('Error loading cash flow:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
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

  const cashFlow = data || {
    operating: 0,
    investing: 0,
    financing: 0,
    netChange: 0,
    beginningBalance: 0,
    endingBalance: 0,
    period: period
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Cash Flow Statement
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Operating, investing, and financing cash flows
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Select period for cash flow statement"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" onClick={loadCashFlow}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating Cash Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {cashFlow.operating.toLocaleString()} SAR
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Change</CardTitle>
            {cashFlow.netChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cashFlow.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {cashFlow.netChange.toLocaleString()} SAR
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ending Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cashFlow.endingBalance.toLocaleString()} SAR
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Statement</CardTitle>
          <CardDescription>Period: {period}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Beginning Cash Balance</span>
              <span className="font-bold">{cashFlow.beginningBalance.toLocaleString()} SAR</span>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="font-semibold text-lg">Operating Activities</h3>
              <div className="flex justify-between items-center py-2 pl-4">
                <span>Net cash from operations</span>
                <span className="font-medium text-green-600">
                  {cashFlow.operating.toLocaleString()} SAR
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="font-semibold text-lg">Investing Activities</h3>
              <div className="flex justify-between items-center py-2 pl-4">
                <span>Net cash from investing</span>
                <span className="font-medium">
                  {cashFlow.investing.toLocaleString()} SAR
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="font-semibold text-lg">Financing Activities</h3>
              <div className="flex justify-between items-center py-2 pl-4">
                <span>Net cash from financing</span>
                <span className="font-medium">
                  {cashFlow.financing.toLocaleString()} SAR
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-t-2 font-bold text-lg">
              <span>Net Change in Cash</span>
              <span className={cashFlow.netChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {cashFlow.netChange.toLocaleString()} SAR
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-t font-bold text-xl">
              <span>Ending Cash Balance</span>
              <span>{cashFlow.endingBalance.toLocaleString()} SAR</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CashFlowStatement;

