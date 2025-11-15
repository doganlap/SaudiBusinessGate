import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  RefreshCw
} from 'lucide-react'
import { RealTimeDashboard, financialMetrics } from '@/components/enterprise/RealTimeDashboard'
import { useWebSocket } from '@/lib/websocket/useWebSocket'

export const metadata: Metadata = {
  title: 'Accounts Management - DoganHubStore Finance',
  description: 'Chart of accounts and account management',
}

const accountsData = [
  { id: 1, name: 'Cash & Cash Equivalents', type: 'Asset', balance: 125430, currency: 'USD', status: 'Active', lastUpdated: '2024-01-15' },
  { id: 2, name: 'Accounts Receivable', type: 'Asset', balance: 78450, currency: 'USD', status: 'Active', lastUpdated: '2024-01-15' },
  { id: 3, name: 'Inventory', type: 'Asset', balance: 45600, currency: 'USD', status: 'Active', lastUpdated: '2024-01-15' },
  { id: 4, name: 'Accounts Payable', type: 'Liability', balance: -32400, currency: 'USD', status: 'Active', lastUpdated: '2024-01-15' },
  { id: 5, name: 'Loans Payable', type: 'Liability', balance: -125000, currency: 'USD', status: 'Active', lastUpdated: '2024-01-15' },
  { id: 6, name: 'Equity', type: 'Equity', balance: 86480, currency: 'USD', status: 'Active', lastUpdated: '2024-01-15' },
]

export default function AccountsPage() {
  // Real-time WebSocket connection for live updates
  const { isConnected, data: realTimeData } = useWebSocket({
    channel: 'accounts',
    onMessage: (update) => {
      if (update.type === 'account-update') {
        console.log('Real-time account update:', update);
        // In a real app, you would update the local state with the new data
      }
    }
  });

  const totalAssets = accountsData.filter(a => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0)
  const totalLiabilities = accountsData.filter(a => a.type === 'Liability').reduce((sum, a) => sum + Math.abs(a.balance), 0)
  const totalEquity = accountsData.filter(a => a.type === 'Equity').reduce((sum, a) => sum + a.balance, 0)

  return (
    <div className="enterprise-container">
      <div className="enterprise-card enterprise-fade-in">
        <div className="enterprise-card-body">
          <div className="enterprise-flex enterprise-justify-between enterprise-items-center enterprise-mb-6">
            <div>
              <h1 className="enterprise-font-bold enterprise-text-3xl enterprise-text-gray-900 enterprise-mb-2">
                Chart of Accounts
              </h1>
              <p className="enterprise-text-gray-600">
                Manage your organization's financial accounts and balances
              </p>
            </div>
            <Link
              href="/finance/accounts/new"
              className="enterprise-btn enterprise-btn-primary enterprise-flex enterprise-items-center enterprise-gap-2"
            >
              <Plus className="h-4 w-4" />
              New Account
            </Link>
          </div>

          {/* Financial Overview */}
          <div className="enterprise-grid enterprise-grid-cols-3 enterprise-gap-6 enterprise-mb-8">
            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Total Assets
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-primary enterprise-mb-2">
                ${totalAssets.toLocaleString()}
              </p>
              <div className="enterprise-flex enterprise-items-center enterprise-gap-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="enterprise-text-success enterprise-text-sm">
                  +8% from last month
                </span>
              </div>
            </div>

            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <Building2 className="h-6 w-6 text-accent" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Total Liabilities
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-accent enterprise-mb-2">
                ${totalLiabilities.toLocaleString()}
              </p>
              <div className="enterprise-flex enterprise-items-center enterprise-gap-1">
                <TrendingUp className="h-4 w-4 text-warning" />
                <span className="enterprise-text-warning enterprise-text-sm">
                  +5% from last month
                </span>
              </div>
            </div>

            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <Users className="h-6 w-6 text-secondary" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Total Equity
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-secondary enterprise-mb-2">
                ${totalEquity.toLocaleString()}
              </p>
              <div className="enterprise-flex enterprise-items-center enterprise-gap-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="enterprise-text-success enterprise-text-sm">
                  +12% from last month
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Analytics Dashboard */}
          <div className="enterprise-mb-8">
            <RealTimeDashboard 
              metrics={financialMetrics}
              channel="financial-metrics"
              autoRefresh={true}
              refreshInterval={30000}
            />
          </div>

          {/* Connection Status */}
          <div className="enterprise-flex enterprise-items-center enterprise-gap-2 enterprise-mb-6 enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg">
            <div className={`enterprise-w-3 enterprise-h-3 enterprise-rounded-full ${
              isConnected ? 'enterprise-bg-green-500' : 'enterprise-bg-red-500'
            }`} />
            <span className="enterprise-text-sm enterprise-text-gray-600">
              {isConnected ? 'Live connection established' : 'Offline - showing cached data'}
            </span>
            <RefreshCw className="enterprise-h-4 enterprise-w-4 enterprise-text-gray-400 enterprise-animate-spin" />
          </div>

          {/* Search and Filters */}
          <div className="enterprise-flex enterprise-items-center enterprise-gap-4 enterprise-mb-6">
            <div className="enterprise-flex-1 enterprise-relative">
              <Search className="enterprise-absolute enterprise-left-3 enterprise-top-1/2 enterprise-transform -enterprise-translate-y-1/2 enterprise-h-4 enterprise-w-4 enterprise-text-gray-400" />
              <input
                type="text"
                placeholder="Search accounts..."
                className="enterprise-input enterprise-pl-10 enterprise-w-full"
              />
            </div>
            <button className="enterprise-btn enterprise-btn-secondary enterprise-flex enterprise-items-center enterprise-gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="enterprise-btn enterprise-btn-outline enterprise-flex enterprise-items-center enterprise-gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {/* Accounts Table */}
          <div className="enterprise-card enterprise-overflow-hidden">
            <div className="enterprise-table-container">
              <table className="enterprise-table enterprise-w-full">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Type</th>
                    <th>Balance</th>
                    <th>Currency</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accountsData.map((account) => (
                    <tr key={account.id}>
                      <td>
                        <div className="enterprise-font-medium enterprise-text-gray-900">
                          {account.name}
                        </div>
                      </td>
                      <td>
                        <span className={`enterprise-badge ${
                          account.type === 'Asset' ? 'enterprise-badge-success' :
                          account.type === 'Liability' ? 'enterprise-badge-warning' :
                          'enterprise-badge-info'
                        }`}>
                          {account.type}
                        </span>
                      </td>
                      <td className={`enterprise-font-semibold ${
                        account.balance >= 0 ? 'enterprise-text-success' : 'enterprise-text-danger'
                      }`}>
                        {account.balance >= 0 ? '+' : ''}${Math.abs(account.balance).toLocaleString()}
                      </td>
                      <td>{account.currency}</td>
                      <td>
                        <span className="enterprise-badge enterprise-badge-success">
                          {account.status}
                        </span>
                      </td>
                      <td>{account.lastUpdated}</td>
                      <td>
                        <div className="enterprise-flex enterprise-gap-2">
                          <button className="enterprise-btn enterprise-btn-icon enterprise-btn-outline" aria-label="View account">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="enterprise-btn enterprise-btn-icon enterprise-btn-outline" aria-label="Edit account">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="enterprise-btn enterprise-btn-icon enterprise-btn-outline enterprise-text-danger" aria-label="Delete account">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="enterprise-mt-8 enterprise-border-t enterprise-pt-6">
            <h2 className="enterprise-text-xl enterprise-font-semibold enterprise-text-gray-900 enterprise-mb-4">
              Quick Actions
            </h2>
            <div className="enterprise-grid enterprise-grid-cols-1 md:enterprise-grid-cols-2 lg:enterprise-grid-cols-4 enterprise-gap-4">
              <Link href="/finance/accounts/new" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <Plus className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Create Account</span>
              </Link>
              <Link href="/finance/reports" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <Download className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Account Reports</span>
              </Link>
              <Link href="/finance/transactions" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <DollarSign className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">View Transactions</span>
              </Link>
              <Link href="/finance/dashboard" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <TrendingUp className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Financial Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}