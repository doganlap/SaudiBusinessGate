import { Metadata } from 'next'
import Link from 'next/link'
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Accounts Payable - DoganHubStore Finance',
  description: 'Manage vendor payments and bills payable',
}

const payableData = [
  { 
    id: 1, 
    vendor: 'Tech Supplies Inc.', 
    invoice: 'INV-2024-001', 
    amount: 1250.00, 
    currency: 'USD', 
    dueDate: '2024-01-20', 
    status: 'Pending', 
    category: 'Office Supplies',
    createdAt: '2024-01-05'
  },
  { 
    id: 2, 
    vendor: 'Cloud Services Ltd.', 
    invoice: 'INV-2024-002', 
    amount: 4500.00, 
    currency: 'USD', 
    dueDate: '2024-01-25', 
    status: 'Approved', 
    category: 'Software Services',
    createdAt: '2024-01-07'
  },
  { 
    id: 3, 
    vendor: 'Utilities Corp', 
    invoice: 'INV-2024-003', 
    amount: 1200.00, 
    currency: 'USD', 
    dueDate: '2024-01-18', 
    status: 'Overdue', 
    category: 'Utilities',
    createdAt: '2024-01-02'
  },
  { 
    id: 4, 
    vendor: 'Marketing Agency', 
    invoice: 'INV-2024-004', 
    amount: 7800.00, 
    currency: 'USD', 
    dueDate: '2024-02-05', 
    status: 'Pending', 
    category: 'Marketing',
    createdAt: '2024-01-10'
  },
  { 
    id: 5, 
    vendor: 'Office Rent', 
    invoice: 'INV-2024-005', 
    amount: 15000.00, 
    currency: 'USD', 
    dueDate: '2024-01-30', 
    status: 'Scheduled', 
    category: 'Rent',
    createdAt: '2024-01-01'
  },
]

export default function AccountsPayablePage() {
  const totalPending = payableData.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0)
  const totalApproved = payableData.filter(p => p.status === 'Approved').reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = payableData.filter(p => p.status === 'Overdue').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="enterprise-container">
      <div className="enterprise-card enterprise-fade-in">
        <div className="enterprise-card-body">
          <div className="enterprise-flex enterprise-justify-between enterprise-items-center enterprise-mb-6">
            <div>
              <h1 className="enterprise-font-bold enterprise-text-3xl enterprise-text-gray-900 enterprise-mb-2">
                Accounts Payable
              </h1>
              <p className="enterprise-text-gray-600">
                Manage vendor invoices, payments, and outstanding bills
              </p>
            </div>
            <Link
              href="/finance/accounts-payable/new"
              className="enterprise-btn enterprise-btn-primary enterprise-flex enterprise-items-center enterprise-gap-2"
            >
              <Plus className="h-4 w-4" />
              New Bill
            </Link>
          </div>

          {/* Financial Overview */}
          <div className="enterprise-grid enterprise-grid-cols-3 enterprise-gap-6 enterprise-mb-8">
            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <Clock className="h-6 w-6 text-warning" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Pending Approval
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-warning enterprise-mb-2">
                ${totalPending.toLocaleString()}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                {payableData.filter(p => p.status === 'Pending').length} invoices
              </div>
            </div>

            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Approved
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-success enterprise-mb-2">
                ${totalApproved.toLocaleString()}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                Ready for payment
              </div>
            </div>

            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <AlertCircle className="h-6 w-6 text-danger" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Overdue
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-danger enterprise-mb-2">
                ${totalOverdue.toLocaleString()}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                Requires immediate attention
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="enterprise-flex enterprise-items-center enterprise-gap-4 enterprise-mb-6">
            <div className="enterprise-flex-1 enterprise-relative">
              <Search className="enterprise-absolute enterprise-left-3 enterprise-top-1/2 enterprise-transform -enterprise-translate-y-1/2 enterprise-h-4 enterprise-w-4 enterprise-text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors or invoices..."
                className="enterprise-input enterprise-pl-10 enterprise-w-full"
              />
            </div>
            <select className="enterprise-select enterprise-w-40">
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Overdue</option>
              <option>Scheduled</option>
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

          {/* Payable Table */}
          <div className="enterprise-card enterprise-overflow-hidden">
            <div className="enterprise-table-container">
              <table className="enterprise-table enterprise-w-full">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Invoice #</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payableData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="enterprise-font-medium enterprise-text-gray-900">
                          {item.vendor}
                        </div>
                      </td>
                      <td>{item.invoice}</td>
                      <td className="enterprise-font-semibold enterprise-text-gray-900">
                        ${item.amount.toLocaleString()}
                      </td>
                      <td>{item.dueDate}</td>
                      <td>
                        <span className={`enterprise-badge ${
                          item.status === 'Pending' ? 'enterprise-badge-warning' :
                          item.status === 'Approved' ? 'enterprise-badge-success' :
                          item.status === 'Overdue' ? 'enterprise-badge-danger' :
                          'enterprise-badge-info'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <span className="enterprise-badge enterprise-badge-outline">
                          {item.category}
                        </span>
                      </td>
                      <td>{item.createdAt}</td>
                      <td>
                        <div className="enterprise-flex enterprise-gap-2">
                          <button className="enterprise-btn enterprise-btn-icon enterprise-btn-outline">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="enterprise-btn enterprise-btn-icon enterprise-btn-outline">
                            <Edit className="h-4 w-4" />
                          </button>
                          {item.status === 'Pending' && (
                            <button className="enterprise-btn enterprise-btn-icon enterprise-btn-success">
                              <CheckCircle className="h-4 w-4" />
                            </button>
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
              <Link href="/finance/accounts-payable/new" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <Plus className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Create Bill</span>
              </Link>
              <Link href="/finance/accounts-payable/batch" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <Download className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Batch Payments</span>
              </Link>
              <Link href="/finance/reports/payable" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <CreditCard className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Payable Reports</span>
              </Link>
              <Link href="/finance/dashboard" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <TrendingUp className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Cash Flow</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}