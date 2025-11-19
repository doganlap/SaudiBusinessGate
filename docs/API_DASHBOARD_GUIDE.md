# API Dashboard - Visual API Connectivity Guide

## Overview

The **API Dashboard** (`/api-dashboard`) is a comprehensive visual interface that displays API endpoints, their connections to pages, and status information using custom colors and interactive indicators.

## Features

### 🎯 Core Functionality

- **Visual API Mapping**: See all API endpoints and their connected pages
- **Color-Coded Modules**: Each module has distinct colors for easy identification
- **Status Indicators**: Real-time status with visual dots and badges
- **Interactive Filtering**: Search, filter by module, and filter by status
- **Response Time Monitoring**: Performance metrics with color indicators

### 🎨 Color Scheme

#### Module Colors

- **Dashboard**: Blue (`bg-blue-100`, `border-blue-300`, `text-blue-800`)
- **Finance**: Green (`bg-green-100`, `border-green-300`, `text-green-800`)
- **Sales**: Purple (`bg-purple-100`, `border-purple-300`, `text-purple-800`)
- **HR**: Orange (`bg-orange-100`, `border-orange-300`, `text-orange-800`)
- **Analytics**: Indigo (`bg-indigo-100`, `border-indigo-300`, `text-indigo-800`)
- **Auth**: Red (`bg-red-100`, `border-red-300`, `text-red-800`)
- **Billing**: Yellow (`bg-yellow-100`, `border-yellow-300`, `text-yellow-800`)
- **System**: Gray (`bg-gray-100`, `border-gray-300`, `text-gray-800`)
- **Workflows**: Teal (`bg-teal-100`, `border-teal-300`, `text-teal-800`)

#### Status Colors

- **Active**: Green backgrounds with green dots
- **Inactive**: Gray backgrounds with gray dots
- **Deprecated**: Red backgrounds with red dots
- **Testing**: Yellow backgrounds with yellow dots

#### Connection Status

- **Connected**: Green with CheckCircle icon
- **Partial**: Yellow with AlertTriangle icon
- **Disconnected**: Red with XCircle icon

### 📊 Dashboard Views

#### 1. APIs View

- Grid layout of API endpoint cards
- Shows method, module, status, and connected pages
- Response time indicators with color coding:
  - Green: < 100ms (excellent)
  - Yellow: 100-200ms (good)
  - Red: > 200ms (needs attention)

#### 2. Pages View

- Shows pages and their API connections
- Lists connected APIs and components used
- Connection status indicators

#### 3. Connections View

- Matrix view showing module-to-page relationships
- Grouped by module with color coding
- Shows API-page connection patterns

### 🔍 Interactive Features

#### Search & Filtering

- **Search Bar**: Search by API path or description
- **Module Filter**: Filter by specific modules
- **Status Filter**: Filter by API status
- **Real-time Updates**: Refresh button for live data

#### Visual Indicators

- **Status Dots**: Color-coded status indicators
- **Module Icons**: Unique icons for each module
- **Method Badges**: Different colors for HTTP methods
- **Performance Metrics**: Response time with color coding

### 📈 Statistics Overview

- **Total APIs**: Count of all API endpoints
- **Active APIs**: Count of currently active endpoints
- **Connected Pages**: Number of pages with API connections
- **Modules**: Total number of modules

### 🛠 Technical Implementation

#### Data Structure

```typescript
interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  module: string;
  status: 'active' | 'inactive' | 'deprecated' | 'testing';
  connectedPages: string[];
  responseTime?: number;
  lastUsed?: string;
  description: string;
}

interface PageConnection {
  page: string;
  apis: string[];
  status: 'connected' | 'partial' | 'disconnected';
  components: string[];
}
```

#### Color Configuration

The dashboard uses a centralized color scheme object for consistent theming:

```typescript
const colorScheme = {
  modules: { /* module-specific colors */ },
  status: { /* status-specific colors */ },
  connection: { /* connection-specific colors */ }
};
```

### 📋 API Endpoints Tracked

#### Dashboard Module

- `/api/dashboard/stats` - Real-time statistics
- `/api/dashboard/activity` - Activity feed

#### Finance Module

- `/api/finance/transactions` - Transaction data
- `/api/finance/accounts` - Account management
- `/api/finance/stats` - Financial KPIs

#### Sales Module

- `/api/sales/leads` - Lead management
- `/api/sales/deals` - Deal pipeline
- `/api/sales/rfqs` - RFQ processing

#### HR Module

- `/api/hr/employees` - Employee data
- `/api/hr/payroll` - Payroll processing

#### Analytics Module

- `/api/analytics/kpis/business` - Business KPIs
- `/api/analytics/trend-analysis` - Trend analysis

#### Auth Module

- `/api/auth/me` - User authentication

#### Billing Module

- `/api/billing/plans` - Billing plans
- `/api/billing/send-activation` - License activation

#### System Module

- `/api/themes/demo-org` - Theme management

#### Workflows Module

- `/api/workflows` - Workflow management

### 🎯 Usage Instructions

1. **Access**: Navigate to `/api-dashboard`
2. **View Selection**: Choose between APIs, Pages, or Connections view
3. **Filtering**: Use search and filters to find specific information
4. **Monitoring**: Check response times and status indicators
5. **Analysis**: Use the connections view to understand system architecture

### 🔧 Customization

#### Adding New Modules

1. Add module to `colorScheme.modules` with colors and icon
2. Update the data fetching to include new module APIs
3. The dashboard will automatically display the new module

#### Modifying Colors

Update the `colorScheme` object to change colors:

- `bg`: Background color class
- `border`: Border color class
- `text`: Text color class
- `dot`: Status dot color class
- `icon`: Icon component

### 📱 Responsive Design

- Mobile-friendly grid layouts
- Responsive cards and components
- Touch-friendly interactive elements
- Optimized for all screen sizes

## Benefits

1. **Visual Clarity**: Instant understanding of API ecosystem
2. **Performance Monitoring**: Quick identification of slow APIs
3. **Architecture Overview**: Clear view of system connections
4. **Development Aid**: Helps developers understand API usage
5. **Maintenance Tool**: Easy identification of unused or problematic APIs

The API Dashboard provides a comprehensive, visually appealing way to monitor and understand your application's API ecosystem with custom colors and intuitive indicators.
