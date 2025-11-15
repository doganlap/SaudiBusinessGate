import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Calculator, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Building,
  Users,
  DollarSign,
  TrendingUp,
  PieChart
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cost Centers - DoganHubStore Finance',
  description: 'Manage cost centers and budget allocation',
}

const costCentersData = [
  { 
    id: 1, 
    name: 'Marketing Department', 
    code: 'MKT-001', 
    manager: 'Sarah Johnson', 
    budget: 50000.00, 
    spent: 32450.00, 
    remaining: 17550.00,
    status: 'Active',
    department: 'Marketing',
    createdAt: '2024-01-01'
  },
  { 
    id: 2, 
    name: 'Development Team', 
    code: 'DEV-001', 
    manager: 'Mike Chen', 
    budget: 75000.00, 
    spent: 45600.00, 
    remaining: 29400.00,
    status: 'Active',
    department: 'Engineering',
    createdAt: '2024-01-01'
  },
  { 
    id: 3, 
    name: 'Sales Operations', 
    code: 'SAL-001', 
    manager: 'Robert Davis', 
    budget: 60000.00, 
    spent: 41200.00, 
    remaining: 18800.00,
    status: 'Active',
    department: 'Sales',
    createdAt: '2024-01-01'
  },
  { 
    id: 4, 
    name: 'Customer Support', 
    code: 'SUP-001', 
    manager: 'Emily Wilson', 
    budget: 40000.00, 
    spent: 28500.00, 
    remaining: 11500.00,
    status: 'Active',
    department: 'Support',
    createdAt: '2024-01-01'
  },
  { 
    id: 5, 
    name: 'Executive Office', 
    code: 'EXEC-001', 
    manager: 'David Brown', 
    budget: 100000.00, 
    spent: 65400.00, 
    remaining: 34600.00,
    status: 'Active',
    department: 'Executive',
    createdAt: '2024-01-01'
  },
]

export default function CostCentersPage() {
  const totalBudget = costCentersData.reduce((sum, cc) => sum + cc.budget, 0)
  const totalSpent = costCentersData.reduce((sum, cc) => sum + cc.spent, 0)
  const totalRemaining = costCentersData.reduce((sum, cc) => sum + cc.remaining, 0)
  const utilizationRate = (totalSpent / totalBudget) * 100

  return (
    <div className="enterprise-container">
      <div className="enterprise-card enterprise-fade-in">
        <div className="enterprise-card-body">
          <div className="enterprise-flex enterprise-justify-between enterprise-items-center enterprise-mb-6">
            <div>
              <h1 className="enterprise-font-bold enterprise-text-3xl enterprise-text-gray-900 enterprise-mb-2">
                Cost Centers
              </h1>
              <p className="enterprise-text-gray-600">
                Manage departmental budgets and cost allocation
              </p>
            </div>
            <Link
              href="/finance/cost-centers/new"
              className="enterprise-btn enterprise-btn-primary enterprise-flex enterprise-items-center enterprise-gap-2"
            >
              <Plus className="h-4 w-4" />
              New Cost Center
            </Link>
          </div>

          {/* Financial Overview */}
          <div className="enterprise-grid enterprise-grid-cols-3 enterprise-gap-6 enterprise-mb-8">
            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Total Budget
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-primary enterprise-mb-2">
                ${totalBudget.toLocaleString()}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                Allocated across {costCentersData.length} centers
              </div>
            </div>

            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <PieChart className="h-6 w-6 text-info" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Total Spent
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-info enterprise-mb-2">
                ${totalSpent.toLocaleString()}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                {utilizationRate.toFixed(1)}% utilization
              </div>
            </div>

            <div className="enterprise-card enterprise-p-6">
              <div className="enterprise-flex enterprise-items-center enterprise-gap-3 enterprise-mb-4">
                <TrendingUp className="h-6 w-6 text-success" />
                <h3 className="enterprise-font-semibold enterprise-text-lg enterprise-text-gray-900">
                  Remaining
                </h3>
              </div>
              <p className="enterprise-font-bold enterprise-text-3xl enterprise-text-success enterprise-mb-2">
                ${totalRemaining.toLocaleString()}
              </p>
              <div className="enterprise-text-sm enterprise-text-gray-600">
                Available for spending
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="enterprise-flex enterprise-items-center enterprise-gap-4 enterprise-mb-6">
            <div className="enterprise-flex-1 enterprise-relative">
              <Search className="enterprise-absolute enterprise-left-3 enterprise-top-1/2 enterprise-transform -enterprise-translate-y-1/2 enterprise-h-4 enterprise-w-4 enterprise-text-gray-400" />
              <input
                type="text"
                placeholder="Search cost centers..."
                className="enterprise-input enterprise-pl-10 enterprise-w-full"
              />
            </div>
            <select className="enterprise-select enterprise-w-40">
              <option>All Departments</option>
              <option>Marketing</option>
              <option>Engineering</option>
              <option>Sales</option>
              <option>Support</option>
              <option>Executive</option>
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

          {/* Cost Centers Table */}
          <div className="enterprise-card enterprise-overflow-hidden">
            <div className="enterprise-table-container">
              <table className="enterprise-table enterprise-w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Manager</th>
                    <th>Department</th>
                    <th>Budget</th>
                    <th>Spent</th>
                    <th>Remaining</th>
                    <th>Utilization</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {costCentersData.map((center) => {
                    const utilization = (center.spent / center.budget) * 100
                    return (
                      <tr key={center.id}>
                        <td>
                          <div className="enterprise-font-medium enterprise-text-gray-900">
                            {center.name}
                          </div>
                        </td>
                        <td>{center.code}</td>
                        <td>{center.manager}</td>
                        <td>
                          <span className="enterprise-badge enterprise-badge-outline">
                            {center.department}
                          </span>
                        </td>
                        <td className="enterprise-font-semibold enterprise-text-gray-900">
                          ${center.budget.toLocaleString()}
                        </td>
                        <td className="enterprise-font-semibold enterprise-text-info">
                          ${center.spent.toLocaleString()}
                        </td>
                        <td className="enterprise-font-semibold enterprise-text-success">
                          ${center.remaining.toLocaleString()}
                        </td>
                        <td>
                          <div className="enterprise-flex enterprise-items-center enterprise-gap-2">
                            <div className="enterprise-w-16 enterprise-bg-gray-200 enterprise-rounded-full enterprise-h-2">
                              <div 
                                className="enterprise-bg-primary enterprise-h-2 enterprise-rounded-full enterprise-transition-all"
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              />
                            </div>
                            <span className="enterprise-text-sm enterprise-text-gray-600">
                              {utilization.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="enterprise-badge enterprise-badge-success">
                            {center.status}
                          </span>
                        </td>
                        <td>{center.createdAt}</td>
                        <td>
                          <div className="enterprise-flex enterprise-gap-2">
                            <button className="enterprise-btn enterprise-btn-icon enterprise-btn-outline">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="enterprise-btn enterprise-btn-icon enterprise-btn-outline">
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
              <Link href="/finance/cost-centers/new" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <Plus className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Create Cost Center</span>
              </Link>
              <Link href="/finance/budgets" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <Calculator className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Budget Planning</span>
              </Link>
              <Link href="/finance/reports/cost-centers" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <PieChart className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Cost Reports</span>
              </Link>
              <Link href="/finance/dashboard" className="enterprise-p-4 enterprise-bg-gray-50 enterprise-rounded-lg hover:enterprise-bg-gray-100 enterprise-transition-colors">
                <Building className="h-6 w-6 enterprise-text-gray-600 enterprise-mb-2" />
                <span className="enterprise-font-medium enterprise-text-gray-900">Department Overview</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}