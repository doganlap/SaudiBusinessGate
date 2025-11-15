import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Activity,
  TrendingUp,
  Calendar,
  Settings,
  Eye,
  Download
} from 'lucide-react';

const CronJobsManagementPage = () => {
  const [jobs, setJobs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobHistory, setShowJobHistory] = useState(false);
  const [jobHistory, setJobHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCronJobs();
    fetchMetrics();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchCronJobs();
      fetchMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchCronJobs = async () => {
    try {
      // Mock data - replace with actual API call
      const mockJobs = [
        {
          name: 'license-expiry-check',
          schedule: '0 2 * * *',
          description: 'Check for upcoming license expirations and send alerts',
          enabled: true,
          status: 'completed',
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
          duration: 45000,
          executionCount: 156,
          successRate: 98.7
        },
        {
          name: 'usage-data-aggregation',
          schedule: '0 1 * * *',
          description: 'Aggregate daily usage data for all tenants',
          enabled: true,
          status: 'running',
          lastRun: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          nextRun: new Date(Date.now() + 23.5 * 60 * 60 * 1000), // 23.5 hours from now
          executionCount: 156,
          successRate: 99.4
        },
        {
          name: 'renewal-reminders',
          schedule: '0 9 * * *',
          description: 'Send renewal reminders to tenants',
          enabled: true,
          status: 'completed',
          lastRun: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          nextRun: new Date(Date.now() + 19 * 60 * 60 * 1000), // 19 hours from now
          duration: 23000,
          executionCount: 156,
          successRate: 97.1
        },
        {
          name: 'monthly-billing-cycle',
          schedule: '0 0 1 * *',
          description: 'Process monthly billing cycles and invoices',
          enabled: true,
          status: 'failed',
          lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          nextRun: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
          duration: 180000,
          error: 'Billing service timeout',
          executionCount: 12,
          successRate: 91.7
        },
        {
          name: 'license-compliance-check',
          schedule: '0 3 * * *',
          description: 'Check license compliance and usage limits',
          enabled: true,
          status: 'completed',
          lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          nextRun: new Date(Date.now() + 23 * 60 * 60 * 1000), // 23 hours from now
          duration: 67000,
          executionCount: 156,
          successRate: 98.1
        },
        {
          name: 'license-status-sync',
          schedule: '0 * * * *',
          description: 'Sync license status with external billing systems',
          enabled: true,
          status: 'idle',
          lastRun: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          nextRun: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
          duration: 5000,
          executionCount: 3744,
          successRate: 99.8
        }
      ];

      setJobs(mockJobs);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch cron jobs:', error);
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      // Mock metrics data
      const mockMetrics = {
        totalJobs: 6,
        activeJobs: 6,
        failedJobs: 1,
        totalExecutions: 4380,
        avgDuration: 62000,
        successRate: 97.8
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const handleJobAction = async (jobName, action) => {
    try {
      console.log(`${action} job: ${jobName}`);
      // Make API call to perform action
      await fetchCronJobs(); // Refresh job list
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
    }
  };

  const viewJobHistory = async (jobName) => {
    try {
      // Mock job history data
      const mockHistory = [
        {
          id: 1,
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000),
          status: 'completed',
          duration: 45000,
          error: null
        },
        {
          id: 2,
          startTime: new Date(Date.now() - 26 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 26 * 60 * 60 * 1000 + 42000),
          status: 'completed',
          duration: 42000,
          error: null
        },
        {
          id: 3,
          startTime: new Date(Date.now() - 50 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 50 * 60 * 60 * 1000 + 38000),
          status: 'completed',
          duration: 38000,
          error: null
        }
      ];

      setJobHistory(mockHistory);
      setSelectedJob(jobs.find(job => job.name === jobName) || null);
      setShowJobHistory(true);
    } catch (error) {
      console.error('Failed to fetch job history:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      idle: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return styles[status] || styles.idle;
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const formatSchedule = (schedule) => {
    const scheduleMap = {
      '0 2 * * *': 'Daily at 2:00 AM',
      '0 1 * * *': 'Daily at 1:00 AM',
      '0 9 * * *': 'Daily at 9:00 AM',
      '0 0 1 * *': 'Monthly on 1st at midnight',
      '0 3 * * *': 'Daily at 3:00 AM',
      '0 * * * *': 'Every hour'
    };

    return scheduleMap[schedule] || schedule;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cron Jobs Management</h1>
          <p className="text-gray-600">Monitor and manage automated license management tasks</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="h-4 w-4" />
          Refresh All
        </button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-gray-900">Total Jobs</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{metrics.totalJobs}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-gray-900">Active Jobs</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{metrics.activeJobs}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <h3 className="font-medium text-gray-900">Failed Jobs</h3>
            </div>
            <p className="text-2xl font-bold text-red-600">{metrics.failedJobs}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium text-gray-900">Total Executions</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">{metrics.totalExecutions.toLocaleString()}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <h3 className="font-medium text-gray-900">Avg Duration</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">{formatDuration(metrics.avgDuration)}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <h3 className="font-medium text-gray-900">Success Rate</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{metrics.successRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="idle">Idle</option>
        </select>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr key={job.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="font-medium text-gray-900">{job.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">{job.description}</div>
                      {job.error && (
                        <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {job.error}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatSchedule(job.schedule)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {job.lastRun ? (
                      <div>
                        <div>{job.lastRun.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{job.lastRun.toLocaleTimeString()}</div>
                        {job.duration && (
                          <div className="text-xs text-gray-400">{formatDuration(job.duration)}</div>
                        )}
                      </div>
                    ) : (
                      'Never'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {job.nextRun ? (
                      <div>
                        <div>{job.nextRun.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{job.nextRun.toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      'Not scheduled'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${job.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {job.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {job.executionCount} executions
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewJobHistory(job.name)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View History"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {job.status === 'running' ? (
                        <button
                          onClick={() => handleJobAction(job.name, 'stop')}
                          className="text-red-600 hover:text-red-900"
                          title="Stop Job"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJobAction(job.name, 'trigger')}
                          className="text-green-600 hover:text-green-900"
                          title="Trigger Job"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleJobAction(job.name, 'restart')}
                        className="text-orange-600 hover:text-orange-900"
                        title="Restart Job"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job History Modal */}
      {showJobHistory && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Job History: {selectedJob.name}
              </h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  onClick={() => setShowJobHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-600">Schedule:</span>
                  <p className="text-sm text-gray-900">{formatSchedule(selectedJob.schedule)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Description:</span>
                  <p className="text-sm text-gray-900">{selectedJob.description}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Execution Time
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {jobHistory.map((execution) => (
                      <tr key={execution.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <div>{execution.startTime.toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{execution.startTime.toLocaleTimeString()}</div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatDuration(execution.duration)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(execution.status)}`}>
                            {execution.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {execution.error || 'None'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CronJobsManagementPage;