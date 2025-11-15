/**
 * Component Tests for React Billing and License Management Pages
 * Tests user interactions, state management, and component integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock API services
jest.mock('../../apps/web/src/services/billingApi.js');
jest.mock('../../apps/web/src/services/licensesApi.js');
jest.mock('../../apps/web/src/services/usageApi.js');
jest.mock('../../apps/web/src/services/renewalsApi.js');

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/billing'
}));

// Import components
import BillingManagementPage from '../../apps/web/src/pages/BillingManagementPage.jsx';
import LicensesManagementPage from '../../apps/web/src/pages/LicensesManagementPage.jsx';
import UsageDashboardPage from '../../apps/web/src/pages/UsageDashboardPage.jsx';
import RenewalsPipelinePage from '../../apps/web/src/pages/RenewalsPipelinePage.jsx';

// Import API services
import * as billingApi from '../../apps/web/src/services/billingApi.js';
import * as licensesApi from '../../apps/web/src/services/licensesApi.js';
import * as usageApi from '../../apps/web/src/services/usageApi.js';
import * as renewalsApi from '../../apps/web/src/services/renewalsApi.js';

// Mock data
const mockSubscription = {
  id: 'sub_123',
  status: 'active',
  plan: {
    id: 'professional',
    name: 'Professional Plan',
    price: 299,
    features: ['advanced_analytics', 'api_access']
  },
  billingPeriod: 'monthly',
  currentPeriodStart: '2024-03-01',
  currentPeriodEnd: '2024-04-01',
  amount: 299,
  nextBillingDate: '2024-04-01'
};

const mockPaymentMethods = [
  {
    id: 'pm_123',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  },
  {
    id: 'pm_456',
    type: 'card',
    last4: '1234',
    brand: 'mastercard',
    expiryMonth: 6,
    expiryYear: 2026,
    isDefault: false
  }
];

const mockBillingHistory = {
  invoices: [
    {
      id: 'in_123',
      amount: 299,
      status: 'paid',
      date: '2024-03-01',
      downloadUrl: 'https://invoice.stripe.com/123'
    },
    {
      id: 'in_124',
      amount: 299,
      status: 'paid',
      date: '2024-02-01',
      downloadUrl: 'https://invoice.stripe.com/124'
    }
  ],
  subscriptionHistory: [
    {
      date: '2024-01-01',
      action: 'created',
      plan: 'professional',
      amount: 299
    }
  ]
};

const mockUsageData = {
  currentPlan: 'professional',
  limits: {
    users: 50,
    storage: 200,
    apiCalls: 50000
  },
  current: {
    users: 25,
    storage: 150,
    apiCalls: 35000
  },
  monthlyTrend: [
    { month: 'Jan', users: 20, storage: 100, apiCalls: 25000 },
    { month: 'Feb', users: 23, storage: 130, apiCalls: 30000 },
    { month: 'Mar', users: 25, storage: 150, apiCalls: 35000 }
  ]
};

const mockRenewals = [
  {
    id: 'lic-123',
    tenantName: 'Acme Corp',
    currentPlan: 'professional',
    expiryDate: '2024-04-15',
    daysToExpiry: 15,
    status: 'pending_renewal',
    annualValue: 3588,
    probability: 85
  },
  {
    id: 'lic-124',
    tenantName: 'Beta LLC',
    currentPlan: 'enterprise',
    expiryDate: '2024-05-20',
    daysToExpiry: 50,
    status: 'contact_needed',
    annualValue: 11988,
    probability: 60
  }
];

describe('BillingManagementPage', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default API responses
    billingApi.getCurrentSubscription.mockResolvedValue(mockSubscription);
    billingApi.getPaymentMethods.mockResolvedValue(mockPaymentMethods);
    billingApi.getBillingHistory.mockResolvedValue(mockBillingHistory);
    billingApi.getUsageAnalytics.mockResolvedValue(mockUsageData);
    billingApi.getLicensePlans.mockResolvedValue([
      { id: 'basic', name: 'Basic Plan', price: { monthly: 99 } },
      { id: 'professional', name: 'Professional Plan', price: { monthly: 299 } },
      { id: 'enterprise', name: 'Enterprise Plan', price: { monthly: 999 } }
    ]);
  });

  test('renders billing overview tab by default', async () => {
    render(<BillingManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Billing Management')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Professional Plan')).toBeInTheDocument();
      expect(screen.getByText('$299/month')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  test('switches between tabs correctly', async () => {
    render(<BillingManagementPage />);

    // Click on Subscription tab
    fireEvent.click(screen.getByText('Subscription'));
    
    await waitFor(() => {
      expect(screen.getByText('Plan Management')).toBeInTheDocument();
      expect(screen.getByText('Change Plan')).toBeInTheDocument();
    });

    // Click on Payment Methods tab
    fireEvent.click(screen.getByText('Payment Methods'));
    
    await waitFor(() => {
      expect(screen.getByText('Saved Payment Methods')).toBeInTheDocument();
      expect(screen.getByText('**** 4242')).toBeInTheDocument();
      expect(screen.getByText('**** 1234')).toBeInTheDocument();
    });
  });

  test('displays payment methods correctly', async () => {
    render(<BillingManagementPage />);

    // Switch to Payment Methods tab
    fireEvent.click(screen.getByText('Payment Methods'));

    await waitFor(() => {
      // Check for Visa card (default)
      const visaCard = screen.getByText('**** 4242');
      expect(visaCard).toBeInTheDocument();
      expect(screen.getByText('Default')).toBeInTheDocument();
      
      // Check for Mastercard
      const mastercardCard = screen.getByText('**** 1234');
      expect(mastercardCard).toBeInTheDocument();
    });
  });

  test('handles plan change correctly', async () => {
    billingApi.updateSubscription.mockResolvedValue({
      ...mockSubscription,
      plan: { id: 'enterprise', name: 'Enterprise Plan', price: 999 }
    });

    render(<BillingManagementPage />);

    // Switch to Subscription tab
    fireEvent.click(screen.getByText('Subscription'));

    await waitFor(() => {
      const changeButton = screen.getByText('Change Plan');
      fireEvent.click(changeButton);
    });

    // Select Enterprise plan
    await waitFor(() => {
      const enterprisePlan = screen.getByText('Enterprise Plan');
      fireEvent.click(enterprisePlan);
    });

    // Confirm change
    const confirmButton = screen.getByText('Confirm Change');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(billingApi.updateSubscription).toHaveBeenCalledWith({
        planId: 'enterprise',
        billingPeriod: 'monthly'
      });
    });
  });

  test('displays billing history correctly', async () => {
    render(<BillingManagementPage />);

    // Switch to Billing History tab
    fireEvent.click(screen.getByText('Billing History'));

    await waitFor(() => {
      expect(screen.getByText('Recent Invoices')).toBeInTheDocument();
      expect(screen.getByText('in_123')).toBeInTheDocument();
      expect(screen.getByText('in_124')).toBeInTheDocument();
      expect(screen.getByText('$299.00')).toBeInTheDocument();
      expect(screen.getByText('Paid')).toBeInTheDocument();
    });
  });

  test('handles invoice download', async () => {
    // Mock window.open
    const mockOpen = jest.fn();
    Object.defineProperty(window, 'open', { value: mockOpen });

    render(<BillingManagementPage />);

    // Switch to Billing History tab
    fireEvent.click(screen.getByText('Billing History'));

    await waitFor(() => {
      const downloadButton = screen.getAllByText('Download')[0];
      fireEvent.click(downloadButton);
    });

    expect(mockOpen).toHaveBeenCalledWith(
      'https://invoice.stripe.com/123',
      '_blank'
    );
  });

  test('displays usage analytics correctly', async () => {
    render(<BillingManagementPage />);

    // Switch to Usage & Analytics tab
    fireEvent.click(screen.getByText('Usage & Analytics'));

    await waitFor(() => {
      expect(screen.getByText('Current Usage')).toBeInTheDocument();
      expect(screen.getByText('Users: 25 / 50')).toBeInTheDocument();
      expect(screen.getByText('Storage: 150 / 200 GB')).toBeInTheDocument();
      expect(screen.getByText('API Calls: 35,000 / 50,000')).toBeInTheDocument();
    });
  });

  test('shows usage warning when approaching limits', async () => {
    const highUsageData = {
      ...mockUsageData,
      current: {
        users: 48, // 96% of limit
        storage: 190, // 95% of limit
        apiCalls: 47000 // 94% of limit
      }
    };
    
    billingApi.getUsageAnalytics.mockResolvedValue(highUsageData);

    render(<BillingManagementPage />);

    fireEvent.click(screen.getByText('Usage & Analytics'));

    await waitFor(() => {
      expect(screen.getByText('Warning: Approaching usage limits')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    billingApi.getCurrentSubscription.mockRejectedValue(new Error('API Error'));

    render(<BillingManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading billing information')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });
});

describe('LicensesManagementPage', () => {
  const mockLicenses = [
    {
      id: 'lic-123',
      tenantName: 'Acme Corp',
      type: 'professional',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      usage: { users: 25, storage: 150 },
      limits: { users: 50, storage: 200 }
    },
    {
      id: 'lic-124',
      tenantName: 'Beta LLC',
      type: 'enterprise',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      usage: { users: 75, storage: 500 },
      limits: { users: 200, storage: 1000 }
    }
  ];

  beforeEach(() => {
    licensesApi.getAllLicenses.mockResolvedValue(mockLicenses);
    licensesApi.getLicenseAnalytics.mockResolvedValue({
      totalLicenses: 150,
      activeLicenses: 120,
      expiredLicenses: 20,
      suspendedLicenses: 10,
      revenueThisMonth: 45000,
      revenueGrowth: 12.5
    });
  });

  test('renders license overview correctly', async () => {
    render(<LicensesManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('License Management')).toBeInTheDocument();
      expect(screen.getByText('Total Licenses')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Active Licenses')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
    });
  });

  test('displays license list correctly', async () => {
    render(<LicensesManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Beta LLC')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });
  });

  test('filters licenses by type', async () => {
    render(<LicensesManagementPage />);

    await waitFor(() => {
      const typeFilter = screen.getByDisplayValue('All Types');
      fireEvent.change(typeFilter, { target: { value: 'professional' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.queryByText('Beta LLC')).not.toBeInTheDocument();
    });
  });

  test('searches licenses by tenant name', async () => {
    render(<LicensesManagementPage />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search licenses...');
      fireEvent.change(searchInput, { target: { value: 'Acme' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.queryByText('Beta LLC')).not.toBeInTheDocument();
    });
  });

  test('opens license details modal', async () => {
    render(<LicensesManagementPage />);

    await waitFor(() => {
      const viewButton = screen.getAllByText('View Details')[0];
      fireEvent.click(viewButton);
    });

    await waitFor(() => {
      expect(screen.getByText('License Details')).toBeInTheDocument();
      expect(screen.getByText('lic-123')).toBeInTheDocument();
    });
  });
});

describe('UsageDashboardPage', () => {
  beforeEach(() => {
    usageApi.getUsageAnalytics.mockResolvedValue(mockUsageData);
    usageApi.getUsageTrends.mockResolvedValue({
      weekly: [
        { period: 'Week 1', users: 20, storage: 120, apiCalls: 25000 },
        { period: 'Week 2', users: 22, storage: 135, apiCalls: 30000 },
        { period: 'Week 3', users: 24, storage: 145, apiCalls: 32000 },
        { period: 'Week 4', users: 25, storage: 150, apiCalls: 35000 }
      ]
    });
  });

  test('renders usage overview correctly', async () => {
    render(<UsageDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Usage Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Current Plan: Professional')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('25 / 50')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument(); // Usage percentage
    });
  });

  test('displays usage progress bars correctly', async () => {
    render(<UsageDashboardPage />);

    await waitFor(() => {
      // Check that progress bars are rendered with correct percentages
      const userProgress = screen.getByTestId('users-progress');
      expect(userProgress).toHaveStyle('width: 50%');

      const storageProgress = screen.getByTestId('storage-progress');
      expect(storageProgress).toHaveStyle('width: 75%');

      const apiProgress = screen.getByTestId('api-progress');
      expect(apiProgress).toHaveStyle('width: 70%');
    });
  });

  test('switches between time periods', async () => {
    render(<UsageDashboardPage />);

    await waitFor(() => {
      const weeklyButton = screen.getByText('Weekly');
      fireEvent.click(weeklyButton);
    });

    await waitFor(() => {
      expect(usageApi.getUsageTrends).toHaveBeenCalledWith('weekly');
      expect(screen.getByText('Week 1')).toBeInTheDocument();
    });
  });
});

describe('RenewalsPipelinePage', () => {
  beforeEach(() => {
    renewalsApi.getRenewalsPipeline.mockResolvedValue(mockRenewals);
    renewalsApi.getRenewalAnalytics.mockResolvedValue({
      totalValue: 15576,
      averageDealSize: 7788,
      conversionRate: 72.5,
      renewalsThisMonth: 12,
      pipelineByStage: {
        pending_renewal: 1,
        contact_needed: 1,
        negotiation: 0,
        renewal_sent: 0,
        renewed: 0
      }
    });
  });

  test('renders renewals pipeline correctly', async () => {
    render(<RenewalsPipelinePage />);

    await waitFor(() => {
      expect(screen.getByText('Renewals Pipeline')).toBeInTheDocument();
      expect(screen.getByText('Total Pipeline Value')).toBeInTheDocument();
      expect(screen.getByText('$15,576')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Beta LLC')).toBeInTheDocument();
    });
  });

  test('filters renewals by urgency', async () => {
    render(<RenewalsPipelinePage />);

    await waitFor(() => {
      const urgentFilter = screen.getByText('Urgent (< 30 days)');
      fireEvent.click(urgentFilter);
    });

    await waitFor(() => {
      // Should show only Acme Corp (15 days to expiry)
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.queryByText('Beta LLC')).not.toBeInTheDocument();
    });
  });

  test('updates renewal status', async () => {
    renewalsApi.updateRenewalStatus.mockResolvedValue({ success: true });

    render(<RenewalsPipelinePage />);

    await waitFor(() => {
      const statusDropdown = screen.getAllByRole('combobox')[0];
      fireEvent.change(statusDropdown, { target: { value: 'negotiation' } });
    });

    await waitFor(() => {
      expect(renewalsApi.updateRenewalStatus).toHaveBeenCalledWith(
        'lic-123',
        'negotiation'
      );
    });
  });

  test('displays renewal probability with color coding', async () => {
    render(<RenewalsPipelinePage />);

    await waitFor(() => {
      const acmeProbability = screen.getByText('85%');
      expect(acmeProbability).toHaveClass('text-green-600'); // High probability

      const betaProbability = screen.getByText('60%');
      expect(betaProbability).toHaveClass('text-yellow-600'); // Medium probability
    });
  });
});

describe('Error Handling and Loading States', () => {
  test('shows loading spinner while fetching data', async () => {
    // Create a promise that never resolves to simulate loading
    billingApi.getCurrentSubscription.mockReturnValue(new Promise(() => {}));

    render(<BillingManagementPage />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('handles network errors gracefully', async () => {
    const networkError = new Error('Network Error');
    billingApi.getCurrentSubscription.mockRejectedValue(networkError);

    render(<BillingManagementPage />);

    await waitFor(() => {
      expect(screen.getByText(/error loading/i)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  test('retries failed API calls', async () => {
    billingApi.getCurrentSubscription
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce(mockSubscription);

    render(<BillingManagementPage />);

    await waitFor(() => {
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Professional Plan')).toBeInTheDocument();
      expect(billingApi.getCurrentSubscription).toHaveBeenCalledTimes(2);
    });
  });

  test('shows empty states when no data available', async () => {
    billingApi.getBillingHistory.mockResolvedValue({ invoices: [], subscriptionHistory: [] });

    render(<BillingManagementPage />);

    fireEvent.click(screen.getByText('Billing History'));

    await waitFor(() => {
      expect(screen.getByText('No billing history found')).toBeInTheDocument();
      expect(screen.getByText('Start using the platform to see billing activity')).toBeInTheDocument();
    });
  });
});