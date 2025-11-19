"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js').then(mod => mod.default), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64">Loading chart...</div>
});

interface FinanceChartProps {
  title?: string;
  height?: number;
}

const defaultLayout = {
  autosize: true,
  margin: { l: 60, r: 30, t: 50, b: 60 },
  font: { family: 'Inter, sans-serif', size: 12 },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  hovermode: 'closest',
  showlegend: true,
  legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' }
};

const defaultConfig = {
  responsive: true,
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
  toImageButtonOptions: {
    format: 'png',
    filename: 'finance-chart',
    height: 600,
    width: 1200,
    scale: 2
  }
};

/**
 * Cash Flow Trend Chart - Line chart showing cash flow over time
 */
export function CashFlowTrendChart({ 
  data, 
  title = 'Cash Flow Trend',
  height = 400 
}: FinanceChartProps & { 
  data: Array<{ period: string; operating: number; investing: number; financing: number; net: number }> 
}) {
  const traces = [
    {
      x: data.map(d => d.period),
      y: data.map(d => d.operating),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Operating',
      line: { color: '#10b981', width: 3, shape: 'spline' as const },
      marker: { size: 8, color: '#10b981' }
    },
    {
      x: data.map(d => d.period),
      y: data.map(d => d.investing),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Investing',
      line: { color: '#f59e0b', width: 3, shape: 'spline' as const },
      marker: { size: 8, color: '#f59e0b' }
    },
    {
      x: data.map(d => d.period),
      y: data.map(d => d.financing),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Financing',
      line: { color: '#3b82f6', width: 3, shape: 'spline' as const },
      marker: { size: 8, color: '#3b82f6' }
    },
    {
      x: data.map(d => d.period),
      y: data.map(d => d.net),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: 'Net Cash Flow',
      line: { color: '#8b5cf6', width: 4, shape: 'spline' as const, dash: 'dash' },
      marker: { size: 10, color: '#8b5cf6' }
    }
  ];

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 18, color: '#1f2937' } },
        xaxis: { 
          title: 'Period', 
          gridcolor: '#e5e7eb',
          showgrid: true
        },
        yaxis: { 
          title: 'Amount ($)', 
          gridcolor: '#e5e7eb',
          showgrid: true,
          tickformat: '$,.0f'
        },
        height,
        hovermode: 'x unified' as const
      }}
      config={defaultConfig}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/**
 * Financial Performance Bar Chart - Revenue vs Expenses
 */
export function FinancialPerformanceChart({ 
  data, 
  title = 'Financial Performance',
  height = 400 
}: FinanceChartProps & { 
  data: Array<{ period: string; revenue: number; expenses: number; profit: number }> 
}) {
  const traces = [
    {
      x: data.map(d => d.period),
      y: data.map(d => d.revenue),
      type: 'bar' as const,
      name: 'Revenue',
      marker: { color: '#10b981' }
    },
    {
      x: data.map(d => d.period),
      y: data.map(d => d.expenses),
      type: 'bar' as const,
      name: 'Expenses',
      marker: { color: '#ef4444' }
    },
    {
      x: data.map(d => d.period),
      y: data.map(d => d.profit),
      type: 'bar' as const,
      name: 'Profit',
      marker: { color: '#3b82f6' }
    }
  ];

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 18, color: '#1f2937' } },
        xaxis: { title: 'Period', gridcolor: '#e5e7eb' },
        yaxis: { 
          title: 'Amount ($)', 
          gridcolor: '#e5e7eb',
          tickformat: '$,.0f'
        },
        height,
        barmode: 'group' as const
      }}
      config={defaultConfig}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/**
 * Accounts Receivable/Payable Pie Chart
 */
export function AccountsDistributionChart({ 
  data, 
  title = 'Accounts Distribution',
  height = 400 
}: FinanceChartProps & { 
  data: Array<{ name: string; value: number; color?: string }> 
}) {
  const traces = [{
    values: data.map(d => d.value),
    labels: data.map(d => d.name),
    type: 'pie' as const,
    hole: 0.4,
    marker: {
      colors: data.map(d => d.color || '#3b82f6'),
      line: { color: '#ffffff', width: 2 }
    },
    textinfo: 'label+percent' as const,
    textposition: 'outside' as const,
    hovertemplate: '<b>%{label}</b><br>Amount: $%{value:,.0f}<br>Percentage: %{percent}<extra></extra>'
  }];

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 18, color: '#1f2937' } },
        height,
        showlegend: true,
        legend: { orientation: 'v' as const, x: 1.1, y: 0.5 }
      }}
      config={defaultConfig}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/**
 * Budget vs Actual Comparison Chart
 */
export function BudgetVsActualChart({ 
  data, 
  title = 'Budget vs Actual',
  height = 400 
}: FinanceChartProps & { 
  data: Array<{ name: string; budgeted: number; actual: number }> 
}) {
  const traces = [
    {
      x: data.map(d => d.name),
      y: data.map(d => d.budgeted),
      type: 'bar' as const,
      name: 'Budgeted',
      marker: { color: '#3b82f6' }
    },
    {
      x: data.map(d => d.name),
      y: data.map(d => d.actual),
      type: 'bar' as const,
      name: 'Actual',
      marker: { color: '#10b981' }
    }
  ];

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 18, color: '#1f2937' } },
        xaxis: { 
          title: 'Budget Category', 
          gridcolor: '#e5e7eb',
          tickangle: -45
        },
        yaxis: { 
          title: 'Amount ($)', 
          gridcolor: '#e5e7eb',
          tickformat: '$,.0f'
        },
        height,
        barmode: 'group' as const
      }}
      config={defaultConfig}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/**
 * Financial Candlestick Chart - For stock/price data
 */
export function FinancialCandlestickChart({ 
  data, 
  title = 'Financial Performance',
  height = 400 
}: FinanceChartProps & { 
  data: { dates: string[]; open: number[]; high: number[]; low: number[]; close: number[] } 
}) {
  const trace = {
    type: 'candlestick' as const,
    x: data.dates,
    open: data.open,
    high: data.high,
    low: data.low,
    close: data.close,
    increasing: { line: { color: '#10b981' }, fillcolor: '#10b981' },
    decreasing: { line: { color: '#ef4444' }, fillcolor: '#ef4444' }
  };

  return (
    <Plot
      data={[trace]}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 18, color: '#1f2937' } },
        xaxis: { 
          title: 'Date',
          rangeslider: { visible: false },
          gridcolor: '#e5e7eb'
        },
        yaxis: { 
          title: 'Price ($)', 
          gridcolor: '#e5e7eb',
          tickformat: '$,.2f'
        },
        height
      }}
      config={defaultConfig}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

/**
 * Waterfall Chart - For cash flow breakdown
 */
export function CashFlowWaterfallChart({ 
  data, 
  title = 'Cash Flow Breakdown',
  height = 400 
}: FinanceChartProps & { 
  data: Array<{ label: string; value: number; type: 'income' | 'expense' | 'net' }> 
}) {
  const traces = data.map((item, idx) => ({
    x: [item.label],
    y: [item.value],
    type: 'bar' as const,
    name: item.label,
    marker: {
      color: item.type === 'income' ? '#10b981' : item.type === 'expense' ? '#ef4444' : '#3b82f6',
      line: { color: '#ffffff', width: 1 }
    },
    text: [`$${Math.abs(item.value).toLocaleString()}`],
    textposition: 'outside' as const
  }));

  return (
    <Plot
      data={traces}
      layout={{
        ...defaultLayout,
        title: { text: title, font: { size: 18, color: '#1f2937' } },
        xaxis: { title: 'Category', gridcolor: '#e5e7eb' },
        yaxis: { 
          title: 'Amount ($)', 
          gridcolor: '#e5e7eb',
          tickformat: '$,.0f'
        },
        height,
        barmode: 'relative' as const,
        showlegend: false
      }}
      config={defaultConfig}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

