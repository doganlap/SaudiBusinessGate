import { Metadata } from 'next'
import Link from 'next/link'
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { RealTimeDashboard, financialMetrics } from '@/components/enterprise/RealTimeDashboard'
import { useWebSocket } from '@/lib/websocket/useWebSocket'

export const metadata: Metadata = {
  title: 'Transaction Management - DoganHubStore Finance',
  description: 'Manage financial transactions and journal entries',
}

const transactionsData = [
  { 
    id: 1, 
    date: '2024-01-15', 
    description: 'Office Supplies Purchase', 
    amount: 1250.00, 
    type: 'Expense', 
    account: 'Office Expenses',
    category: 'Supplies',
    status: 'Completed',
    reference: 'REF-001',
    createdBy: 'John Doe'
  },
  { 
    id: 2, 
    date: '2024-01-15', 
    description: 'Customer Payment - Global Tech', 
    amount: 8500.00, 
    type: 'Income', 
    account: 'Accounts Receivable',
    category: 'Services',
    status: 'Completed',
    reference: 'PAY-001',
    createdBy: 'Jane Smith'
  },
  { 
    id: 3, 
    date: '2024-01-14', 
    description: 'Vendor Payment - Cloud Services', 
    amount: -4500.00, 
    type: 'Expense', 
    account: 'Accounts Payable',
    category: 'Software',
    status: 'Pending',
    reference: 'PAY-002',
    createdBy: 'Mike Johnson'
  },
  { 
    id: 4, 
    date: '2024-01-13', 
    description: 'Equipment Purchase', 
    amount: -12000.00, 
    type: 'Expense', 
    account: 'Fixed Assets',
    category: 'Equipment',
    status: 'Completed',
    reference: 'PUR-001',
    createdBy: 'Sarah Wilson'
  },
  { 
    id: 5, 
    date: '2024-01-12', 
    description: 'Consulting Revenue', 
    amount: 12500.00, 
    type: 'Income', 
    account: 'Revenue',
    category: 'Consulting',
    status: 'Completed',
    reference: 'INV-002',
    createdBy: 'Robert Brown'
  },
]

export default function TransactionsPage() {
  // Real-time WebSocket connection for live transaction updates
  const { isConnected, data: realTimeData } = useWebSocket({
    channel: 'transactions',
    onMessage: (update) => {
      if (update.type === 'transaction-update') {
        console.log('Real-time transaction update:', update);
        // In a real app, you would update the local state with the new transaction data
      }
    }
  });

  const totalIncome = transactionsData.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactionsData.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const netAmount = totalIncome - totalExpense

  return (
    <div className="enterprise-container">
      <div className="enterprise-card enterprise-fade-in">
        <div className="enterprise-card-body">
          <div className="enterprise-flex enterprise-justify-between enterprise-items-center enterprise-mb-6">
            <div>
              <h1 className="enterprise-font-bold enterprise-text-3xl enterprise-text-gray-900 enterprise-mb-2">
                Transaction Management
              </h1>
              <p className="enterprise-text-gray-600">
                Manage all financial transactions and journal entries
              </p>
            </div>
            <Link
              href="/finance/transactions/new"
              className="enterprise-btn enterprise-btn-primary enterprise-flex enterprise-items-center enterprise-gap-2"
            >
              <Plus className="h-4 w-4" />
              New Transaction
            </Link>
          </div>

          {/* Financial Overview */}
          <div className="enterprise-grid enterprise-grid-cols-3 enterprise-gap-6 enterprise-mb-8">
            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <TrendingUp className="h-6 w-6 text-success" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Total Income
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-success enterprise-mb-2">
                ${totalIncome.toLocaleString()}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                This month
              </div>
            </div>

            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <TrendingUp className="h-6 w-6 text-danger" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Total Expenses
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-danger enterprise-mb-2">
                ${totalExpense.toLocaleString()}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                This month
              </div>
            </div>

            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Net Amount
                </h3>
              </div>
              <p className={`enterprise-font-bold enterprise-text-3xl enterprise-mb-2 ${
                netAmount >= 0 ? 'enterprise-text-success' : 'enterprise-text-danger'
              }`}>
                ${Math.abs(netAmount).toLocaleString()}
                {netAmount >= 0 ? ' Profit' : ' Loss'}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                This month
              </div>
            </div>
          </div>

          {/* Real-Time Analytics Dashboard */}
          <div className="enterprise-mb-8">
            <RealTimeDashboard 
              metrics={financialMetrics.filter(metric => 
                ['total-revenue', 'total-expenses', 'net-income', 'pending-transactions'].includes(metric.id)
              )}
              channel="transaction-metrics"
              autoRefresh={true}
              refreshInterval={15000}
            />
          </div>

          {/* Connection Status */}
          <div className="enterprise-flex enterprise-items-center enterprise-gap-2 enterprise-mb-6 enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg">
            <div className={`enterprise-w-3 enterprise-h-3 enterprise-rounded-full ${
              isConnected ? 'enterprise-bg-green-500' : 'enterprise-bg-red-500'
            }`} />
            <span className="enterprise-text-sm enterprise-text-gray-600">
              {isConnected ? 'Live transaction updates enabled' : 'Offline - showing cached transactions'}
            </span>
            <RefreshCw className="enterprise-h-4 enterprise-w-4 enterprise-text-gray-400 enterprise-animate-spin" />
          </div>

          {/* Search and Filters */}
          <div className="enterprise-flex enterprise-items-center enterprise-gap-4 enterprise-mb-6">
            <div className="enterprise-flex-1 enterprise-relative">
              <Search className="enterprise-absolute enterprise-left-3 enterprise-top-1/2 enterprise-transform -enterprise-translate-y-1/2 enterprise-h-4 enterprise-w-4 enterprise-text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="enterprise-input enterprise-pl-10 enterprise-w-full"
              />
            </div>
            <select className="enterprise-select enterprise-w-40" aria-label="Filter by transaction type">
              <option>All Types</option>
              <option>Income</option>
              <option>Expense</option>
              <option>Transfer</option>
            </select>
            <select className="enterprise-select enterprise-w-40" aria-label="Filter by transaction status">
              <option>All Status</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
            <button className="enterprise-btn enterprise-btn-secondary enterprise-flex enterprise-items-center enterprise-gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="enterprise-btn enterprise-btn-outline enterprise-flex enterprise-items-center enterprise-gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {/* Transactions Table */}
          <div className="enterprise-card enterprise-overflow-hidden">
            <div className="enterprise-table-container">
              <table className="enterprise-table enterprise-w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Account</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Reference</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsData.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.date}</td>
                      <td>
                        <div className="enterprise-font-medium enterprise-text-gray-900">
                          {transaction.description}
                        </div>
                      </td>
                      <td className={`enterprise-font-semibold ${
                        transaction.amount >= 0 ? 'enterprise-text-success' : 'enterprise-text-danger'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </td>
                      <td>
                        <span className={`enterprise-badge ${
                          transaction.type === 'Income' ? 'enterprise-badge-success' :
                          transaction.type === 'Expense' ? 'enterprise-badge-warning' :
                          'enterprise-badge-info'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td>{transaction.account}</td>
                      <td>
                        <span className="enterprise-badge enterprise-badge-outline">
                          {transaction.category}
                        </span>
                      </td>
                      <td>
                        <span className={`enterprise-badge ${
                          transaction.status === 'Completed' ? 'enterprise-badge-success' :
                          transaction.status === 'Pending' ? 'enterprise-badge-warning' :
                          'enterprise-badge-danger'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td>{transaction.reference}</td>
                      <td>{transaction.createdBy}</td>
                      <td>
                        <div className="enterprise-flex enterprise-gap-2">
                          <button className="enterprise-btn enterprise-btn-icon enterprise-btn-outline" aria-label="View transaction">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="enterprise-btn enterprise-btn-icon enterprise-btn-outline" aria-label="Edit transaction">
                            <Edit className="h-4 w-4" />
                          </button>
                          {transaction.status === 'Pending' && (
                            <>
                              <button className="enterprise-btn enterprise-btn-icon enterprise-btn-success" aria-label="Approve transaction">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button className="enterprise-btn enterprise-btn-icon enterprise-btn-danger" aria-label="Reject transaction">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
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
              <Link href="/finance/transactions/new" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <Plus className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">New Transaction</span>
              </Link>
              <Link href="/finance/transactions/batch" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <Download className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Batch Import</span>
              </Link>
              <Link href="/finance/reports/transactions" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <ArrowRightLeft className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Transaction Reports</span>
              </Link>
              <Link href="/finance/dashboard" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <Calendar className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Financial Calendar</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}