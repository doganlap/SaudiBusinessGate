import { Metadata } from 'next'
import Link from 'next/link'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Approval Workflows - DoganHubStore Finance',
  description: 'Manage financial approvals and workflow processes',
}

const approvalItemsData = [
  { 
    id: 1, 
    type: 'Expense Report', 
    title: 'Q3 Marketing Campaign Expenses', 
    submitter: 'Sarah Johnson', 
    department: 'Marketing', 
    amount: 12500.00, 
    currency: 'USD',
    status: 'Pending', 
    priority: 'High',
    submittedAt: '2024-01-15 10:30',
    dueDate: '2024-01-17',
    approvers: ['David Brown', 'Emily Wilson'],
    currentStep: 2,
    totalSteps: 3
  },
  { 
    id: 2, 
    type: 'Invoice Payment', 
    title: 'Vendor Invoice #INV-2024-001', 
    submitter: 'Mike Chen', 
    department: 'Engineering', 
    amount: 8500.00, 
    currency: 'USD',
    status: 'Approved', 
    priority: 'Medium',
    submittedAt: '2024-01-14 14:45',
    approvedAt: '2024-01-15 09:15',
    approver: 'Robert Davis',
    currentStep: 3,
    totalSteps: 3
  },
  { 
    id: 3, 
    type: 'Budget Request', 
    title: 'New Equipment Purchase Request', 
    submitter: 'Emily Wilson', 
    department: 'Support', 
    amount: 20000.00, 
    currency: 'USD',
    status: 'Rejected', 
    priority: 'High',
    submittedAt: '2024-01-13 16:20',
    rejectedAt: '2024-01-14 11:30',
    reason: 'Exceeds department budget allocation',
    approver: 'David Brown',
    currentStep: 2,
    totalSteps: 3
  },
  { 
    id: 4, 
    type: 'Travel Expense', 
    title: 'Conference Travel Expenses - San Francisco', 
    submitter: 'Robert Davis', 
    department: 'Sales', 
    amount: 3500.00, 
    currency: 'USD',
    status: 'Pending', 
    priority: 'Medium',
    submittedAt: '2024-01-15 08:00',
    dueDate: '2024-01-18',
    approvers: ['Sarah Johnson', 'Mike Chen'],
    currentStep: 1,
    totalSteps: 2
  },
  { 
    id: 5, 
    type: 'Vendor Payment', 
    title: 'Monthly Cloud Services Subscription', 
    submitter: 'Mike Chen', 
    department: 'Engineering', 
    amount: 12000.00, 
    currency: 'USD',
    status: 'Pending', 
    priority: 'Low',
    submittedAt: '2024-01-14 17:30',
    dueDate: '2024-01-20',
    approvers: ['David Brown'],
    currentStep: 1,
    totalSteps: 2
  },
]

export default function AcceptancePage() {
  const pendingItems = approvalItemsData.filter(item => item.status === 'Pending')
  const approvedItems = approvalItemsData.filter(item => item.status === 'Approved')
  const rejectedItems = approvalItemsData.filter(item => item.status === 'Rejected')
  
  const totalPendingAmount = pendingItems.reduce((sum, item) => sum + item.amount, 0)
  const totalApprovedAmount = approvedItems.reduce((sum, item) => sum + item.amount, 0)
  const totalRejectedAmount = rejectedItems.reduce((sum, item) => sum + item.amount, 0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-5 w-5 text-warning" />
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-danger" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      High: 'enterprise-badge enterprise-badge-danger',
      Medium: 'enterprise-badge enterprise-badge-warning',
      Low: 'enterprise-badge enterprise-badge-info'
    }
    return styles[priority as keyof typeof styles] || 'enterprise-badge enterprise-badge-outline'
  }

  return (
    <div className="enterprise-container">
      <div className="enterprise-card enterprise-fade-in">
        <div className="enterprise-card-body">
          <div className="enterprise-flex enterprise-justify-between enterprise-items-center enterprise-mb-6">
            <div>
              <h1 className="enterprise-font-bold enterprise-text-3xl enterprise-text-gray-900 enterprise-mb-2">
                Approval Workflows
              </h1>
              <p className="enterprise-text-gray-600">
                Manage financial approvals and workflow processes
              </p>
            </div>
            <Link
              href="/finance/acceptance/new"
              className="enterprise-btn enterprise-btn-primary enterprise-flex enterprise-items-center enterprise-gap-2"
            >
              <FileText className="h-4 w-4" />
              New Request
            </Link>
          </div>

          {/* Approval Overview */}
          <div className="enterprise-grid enterprise-grid-cols-3 enterprise-gap-6 enterprise-mb-8">
            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <Clock className="h-6 w-6 text-warning" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Pending Approval
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-warning enterprise-mb-2">
                ${totalPendingAmount.toLocaleString()}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                {pendingItems.length} items awaiting review
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
                ${totalApprovedAmount.toLocaleString()}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                {approvedItems.length} items approved
              </div>
            </div>

            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <XCircle className="h-6 w-6 text-danger" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Rejected
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-danger enterprise-mb-2">
                ${totalRejectedAmount.toLocaleString()}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                {rejectedItems.length} items rejected
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="enterprise-flex enterprise-items-center enterprise-gap-4 enterprise-mb-6">
            <div className="enterprise-flex-1 enterprise-relative">
              <Search className="enterprise-absolute enterprise-left-3 enterprise-top-1/2 enterprise-transform -enterprise-translate-y-1/2 enterprise-h-4 enterprise-w-4 enterprise-text-gray-400" />
              <input
                type="text"
                placeholder="Search approval items..."
                className="enterprise-input enterprise-pl-10 enterprise-w-full"
              />
            </div>
            <select className="enterprise-select enterprise-w-40">
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <select className="enterprise-select enterprise-w-40">
              <option>All Types</option>
              <option>Expense Report</option>
              <option>Invoice Payment</option>
              <option>Budget Request</option>
              <option>Travel Expense</option>
              <option>Vendor Payment</option>
            </select>
            <button className="enterprise-btn enterprise-btn-secondary enterprise-flex enterprise-items-center enterprise-gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Approval Items Table */}
          <div className="enterprise-card enterprise-overflow-hidden">
            <div className="enterprise-table-container">
              <table className="enterprise-table enterprise-w-full">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Submitter</th>
                    <th>Department</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Submitted</th>
                    <th>Due Date</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalItemsData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="enterprise-badge enterprise-badge-outline">
                          {item.type}
                        </span>
                      </td>
                      <td>
                        <div className="enterprise-font-medium enterprise-text-gray-900">
                          {item.title}
                        </div>
                      </td>
                      <td>{item.submitter}</td>
                      <td>
                        <span className="enterprise-badge enterprise-badge-outline">
                          {item.department}
                        </span>
                      </td>
                      <td className="enterprise-font-semibold enterprise-text-gray-900">
                        ${item.amount.toLocaleString()}
                      </td>
                      <td>
                        <div className="enterprise-flex enterprise-items-center enterprise-gap-2">
                          {getStatusIcon(item.status)}
                          <span className={`enterprise-badge ${
                            item.status === 'Pending' ? 'enterprise-badge-warning' :
                            item.status === 'Approved' ? 'enterprise-badge-success' :
                            'enterprise-badge-danger'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={getPriorityBadge(item.priority)}>
                          {item.priority}
                        </span>
                      </td>
                      <td>{item.submittedAt}</td>
                      <td>
                        {item.dueDate && (
                          <span className="enterprise-text-sm enterprise-text-gray-600">
                            {item.dueDate}
                          </span>
                        )}
                      </td>
                      <td>
                        {item.status === 'Pending' && (
                          <div className="enterprise-flex enterprise-items-center enterprise-gap-2">
                            <div className="enterprise-w-16 enterprise-bg-gray-200 enterprise-rounded-full enterprise-h-2">
                              <div 
                                className="enterprise-bg-primary enterprise-h-2 enterprise-rounded-full enterprise-transition-all"
                                style={{ width: `${(item.currentStep / item.totalSteps) * 100}%` }}
                              />
                            </div>
                            <span className="enterprise-text-sm enterprise-text-gray-600">
                              {item.currentStep}/{item.totalSteps}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="enterprise-flex enterprise-gap-2">
                          <button className="enterprise-btn enterprise-btn-icon enterprise-btn-outline">
                            <Eye className="h-4 w-4" />
                          </button>
                          {item.status === 'Pending' && (
                            <>
                              <button className="enterprise-btn enterprise-btn-icon enterprise-btn-success">
                                <Check className="h-4 w-4" />
                              </button>
                              <button className="enterprise-btn enterprise-btn-icon enterprise-btn-danger">
                                <X className="h-4 w-4" />
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
              <Link href="/finance/acceptance/new" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <FileText className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">New Approval Request</span>
              </Link>
              <Link href="/finance/acceptance/pending" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <Clock className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Pending Approvals</span>
              </Link>
              <Link href="/finance/acceptance/approved" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <CheckCircle className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Approved Items</span>
              </Link>
              <Link href="/finance/reports/approvals" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <TrendingUp className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Approval Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}