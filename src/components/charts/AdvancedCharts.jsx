import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * ==========================================
 * ADVANCED CHARTS COMPONENTS
 * ==========================================
 * 
 * Full-featured chart components with Chart.js
 */

// Default chart options
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

// Line Chart Component
export function LineChart({ data, options = {} }) {
  const chartOptions = { ...defaultOptions, ...options };
  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={chartOptions} />
    </div>
  );
}

// Bar Chart Component
export function BarChart({ data, options = {} }) {
  const chartOptions = { ...defaultOptions, ...options };
  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={chartOptions} />
    </div>
  );
}

// Pie Chart Component
export function PieChart({ data, options = {} }) {
  const chartOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      legend: {
        position: 'bottom',
      },
    },
  };
  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Pie data={data} options={chartOptions} />
    </div>
  );
}

// Doughnut Chart Component
export function DoughnutChart({ data, options = {} }) {
  const chartOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      legend: {
        position: 'bottom',
      },
    },
  };
  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Doughnut data={data} options={chartOptions} />
    </div>
  );
}

// Area Chart Component
export function AreaChart({ data, options = {} }) {
  const chartOptions = {
    ...defaultOptions,
    ...options,
    elements: {
      line: {
        fill: true,
      },
    },
  };
  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={chartOptions} />
    </div>
  );
}

// Multi-line Chart Component
export function MultiLineChart({ data, options = {} }) {
  const chartOptions = { ...defaultOptions, ...options };
  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={chartOptions} />
    </div>
  );
}

// Stacked Bar Chart Component
export function StackedBarChart({ data, options = {} }) {
  const chartOptions = {
    ...defaultOptions,
    ...options,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={chartOptions} />
    </div>
  );
}

// Mini Chart Component
export function MiniChart({ type = 'line', data, height = '60px' }) {
  const miniOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  return (
    <div style={{ height, width: '100%' }}>
      {type === 'bar' ? (
        <Bar data={data} options={miniOptions} />
      ) : (
        <Line data={data} options={miniOptions} />
      )}
    </div>
  );
}

// Control Effectiveness Gauge
export function ControlEffectivenessGauge({ effectiveness = 0 }) {
  const data = {
    labels: ['Effectiveness', 'Gap'],
    datasets: [
      {
        data: [effectiveness, 100 - effectiveness],
        backgroundColor: [
          effectiveness >= 80 ? '#10b981' : effectiveness >= 50 ? '#f59e0b' : '#ef4444',
          '#e5e7eb',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div style={{ position: 'relative', height: '250px', width: '100%' }}>
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>
          {effectiveness}%
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>Effective</div>
      </div>
    </div>
  );
}

// Multi-Framework Radar Chart
export function MultiFrameworkRadar({ data, options = {} }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    ...options,
    plugins: {
      legend: {
        position: 'top',
      },
      ...options.plugins,
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Radar data={data} options={chartOptions} />
    </div>
  );
}

// Compliance Heatmap (using Bar chart)
export function ComplianceHeatmap({ data, options = {} }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    ...options,
    plugins: {
      legend: {
        display: false,
      },
      ...options.plugins,
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={chartOptions} />
    </div>
  );
}

// Risk Matrix 3D (using bubble chart approach)
export function RiskMatrix3D({ data, options = {} }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    ...options,
    plugins: {
      legend: {
        position: 'top',
      },
      ...options.plugins,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Likelihood',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Impact',
        },
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Bar data={data} options={chartOptions} />
    </div>
  );
}

// Export all components
const AdvancedCharts = {
  LineChart,
  BarChart,
  PieChart,
  DoughnutChart,
  AreaChart,
  MultiLineChart,
  StackedBarChart,
  MiniChart,
  ControlEffectivenessGauge,
  MultiFrameworkRadar,
  ComplianceHeatmap,
  RiskMatrix3D,
};

export default AdvancedCharts;
