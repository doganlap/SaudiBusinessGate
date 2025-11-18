import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  Settings, 
  Bell,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Globe,
  Server,
  Database,
  Shield
} from 'lucide-react';

/**
 * ==========================================
 * ADMIN DASHBOARD - SYSTEM OVERVIEW
 * ==========================================
 * 
 * Comprehensive admin dashboard with:
 * - System health monitoring
 * - Quick access to all modules
 * - Real-time statistics
 * - Alert notifications
 * - Performance metrics
 */

const AdminDashboard = () => {
  const [notifications] = useState([
    { id: 1, type: 'success', message: 'System backup completed successfully', time: '2 hours ago' },
    { id: 2, type: 'warning', message: '3 organizations pending approval', time: '4 hours ago' },
    { id: 3, type: 'info', message: 'New demo showcase added', time: '6 hours ago' }
  ]);

  const systemStats = [
    {
      label: 'System Health',
      value: '99.9%',
      change: '+0.1%',
      icon: <Activity className="w-5 h-5" />,
      color: 'green',
      status: 'healthy'
    },
    {
      label: 'Active Users',
      value: '1,247',
      change: '+12%',
      icon: <Users className="w-5 h-5" />,
      color: 'blue',
      status: 'growing'
    },
    {
      label: 'Completed Assessments',
      value: '15,632',
      change: '+8%',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'purple',
      status: 'active'
    },
    {
      label: 'Performance Score',
      value: '94/100',
      change: '+2',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'orange',
      status: 'excellent'
    }
  ];

  const quickActions = [
    {
      title: 'Demo Showcase',
      description: 'View interactive demos and POCs',
      link: '/demo-showcase',
      icon: <Globe className="w-6 h-6" />,
      color: 'blue',
      count: '50+ solutions'
    },
    {
      title: 'Real-Time Dashboard',
      description: 'Monitor system performance',
      link: '/dashboard',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'green',
      count: 'Live data'
    },
    {
      title: 'Assessment Center',
      description: 'GRC compliance assessments',
      link: '/assessments',
      icon: <ClipboardCheck className="w-6 h-6" />,
      color: 'purple',
      count: '15k+ completed'
    },
    {
      title: 'Organization Management',
      description: 'Manage organizational data',
      link: '/organizations',
      icon: <Users className="w-6 h-6" />,
      color: 'orange',
      count: '1.2k+ orgs'
    },
    {
      title: 'Smart Templates',
      description: 'AI-powered template selection',
      link: '/templates',
      icon: <Zap className="w-6 h-6" />,
      color: 'yellow',
      count: 'AI-powered'
    },
    {
      title: 'UI Components',
      description: 'Component library showcase',
      link: '/ui-components',
      icon: <Settings className="w-6 h-6" />,
      color: 'gray',
      count: 'Design system'
    }
  ];

  const systemServices = [
    { name: 'Web Server', status: 'running', uptime: '99.9%' },
    { name: 'Database', status: 'running', uptime: '99.8%' },
    { name: 'n8n Automation', status: 'running', uptime: '99.5%' },
    { name: 'Document Processing', status: 'running', uptime: '98.7%' },
    { name: 'Email Service', status: 'running', uptime: '99.2%' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Bell className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            DoganHub Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            System overview and management console
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <div className={`text-${stat.color}-600 dark:text-${stat.color}-400`}>
                    {stat.icon}
                  </div>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/20 group-hover:scale-110 transition-transform duration-200`}>
                        <div className={`text-${action.color}-600 dark:text-${action.color}-400`}>
                          {action.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {action.description}
                        </p>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-500">
                          {action.count}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* System Services */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Server className="w-5 h-5 mr-2" />
                System Services
              </h2>
              <div className="space-y-4">
                {systemServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'running' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {service.uptime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications & Alerts */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Recent Notifications
              </h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                System Health
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">23%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '23%'}}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">67%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '67%'}}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Disk Space</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;