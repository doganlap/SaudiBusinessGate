import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Badge, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Alert,
  AlertDescription
} from '@/components/ui';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Settings,
  TrendingUp,
  FileText,
  Crown,
  Clock,
  RefreshCw
} from 'lucide-react';
import billingApiService from '../services/billingApi';

const BillingManagementPage = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [currentUsage, setCurrentUsage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Load initial data
  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        subscriptionData,
        plansData,
        paymentMethodsData,
        billingHistoryData,
        usageData,
        analyticsData
      ] = await Promise.all([
        billingApiService.getCurrentSubscription(),
        billingApiService.getLicensePlans(),
        billingApiService.getPaymentMethods(),
        billingApiService.getBillingHistory(10),
        billingApiService.getCurrentUsage(),
        billingApiService.getBillingAnalytics('month')
      ]);

      setSubscription(subscriptionData);
      setPlans(plansData);
      setPaymentMethods(paymentMethodsData);
      setBillingHistory(billingHistoryData);
      setCurrentUsage(usageData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading billing data:', error);
      setError('Failed to load billing information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionChange = async (planId, billingPeriod) => {
    try {
      if (subscription) {
        await billingApiService.updateSubscription(planId, billingPeriod);
      } else {
        await billingApiService.createSubscription(planId, billingPeriod);
      }
      await loadBillingData();
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to update subscription. Please try again.');
    }
  };

  const handleCancelSubscription = async (immediately = false) => {
    try {
      await billingApiService.cancelSubscription(immediately);
      await loadBillingData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setError('Failed to cancel subscription. Please try again.');
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const downloadUrl = await billingApiService.downloadInvoice(invoiceId);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setError('Failed to download invoice. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'trialing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'past_due':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      trialing: 'bg-blue-100 text-blue-800 border-blue-200',
      past_due: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      canceled: 'bg-red-100 text-red-800 border-red-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };

    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatCurrency = (amount) => {
    return billingApiService.formatCurrency(amount);
  };

  const formatDate = (date) => {
    return billingApiService.formatDate(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading billing information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing Management</h1>
            <p className="text-gray-600 mt-1">Manage your subscription, billing, and payment methods</p>
          </div>
          <Button onClick={loadBillingData} variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
          <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Plan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {subscription?.planName || 'No Plan'}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {subscription ? formatCurrency(subscription.amount) : '$0'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Billing</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {subscription ? formatDate(subscription.nextBillingDate) : 'N/A'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {subscription && getStatusIcon(subscription.status)}
                    <Badge className={getStatusBadge(subscription?.status || 'none')}>
                      {subscription?.status || 'No Subscription'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Current Subscription */}
          {subscription && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Current Subscription</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">{subscription.planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Billing Period:</span>
                      <span className="font-medium capitalize">{subscription.billingPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{formatCurrency(subscription.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Billing:</span>
                      <span className="font-medium">{formatDate(subscription.nextBillingDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={() => setActiveTab('subscription')}
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                  {subscription.status === 'active' && (
                    <Button 
                      onClick={() => handleCancelSubscription(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Cancel at Period End
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Available Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="p-6 relative">
                  {subscription?.planId === plan.id && (
                    <Badge className="absolute top-4 right-4 bg-blue-100 text-blue-800">
                      Current Plan
                    </Badge>
                  )}
                  <div className="mb-4">
                    <h4 className="text-xl font-bold">{plan.name}</h4>
                    <p className="text-gray-600 capitalize">{plan.type} Plan</p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold">
                        {formatCurrency(plan.price.monthly)}
                      </span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-lg">
                        {formatCurrency(plan.price.annual)}
                      </span>
                      <span className="text-gray-600 text-sm">/year</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Save {Math.round((1 - (plan.price.annual / (plan.price.monthly * 12))) * 100)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleSubscriptionChange(plan.id, 'monthly')}
                      className="w-full"
                      disabled={subscription?.planId === plan.id}
                    >
                      Choose Monthly
                    </Button>
                    <Button 
                      onClick={() => handleSubscriptionChange(plan.id, 'annual')}
                      variant="outline"
                      className="w-full"
                      disabled={subscription?.planId === plan.id}
                    >
                      Choose Annual
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Payment Methods</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            {paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <CreditCard className="h-8 w-8 text-gray-600" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {method.brand} •••• {method.last4}
                            </span>
                            {method.isDefault && (
                              <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!method.isDefault && (
                          <Button variant="outline" size="sm">
                            Set Default
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h4>
                <p className="text-gray-600 mb-4">Add a payment method to manage your subscription.</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Billing History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Billing History</h3>
            
            {billingHistory.length > 0 ? (
              <div className="space-y-4">
                {billingHistory.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-gray-600" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{item.description}</span>
                            <Badge className={getStatusBadge(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(item.date)} • {formatCurrency(item.amount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.invoiceUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadInvoice(item.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Billing History</h4>
                <p className="text-gray-600">Your billing history will appear here once you have transactions.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Usage & Analytics Tab */}
        <TabsContent value="usage" className="space-y-6">
          {currentUsage && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Current Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Users</span>
                    <span className="text-sm text-gray-600">
                      {currentUsage.users}/{currentUsage.userLimit === -1 ? '∞' : currentUsage.userLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: currentUsage.userLimit === -1 ? '20%' : `${Math.min((currentUsage.users / currentUsage.userLimit) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Storage</span>
                    <span className="text-sm text-gray-600">
                      {currentUsage.storage}GB/{currentUsage.storageLimit}GB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((currentUsage.storage / currentUsage.storageLimit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">API Calls</span>
                    <span className="text-sm text-gray-600">
                      {currentUsage.apiCalls.toLocaleString()}/{currentUsage.apiLimit === -1 ? '∞' : currentUsage.apiLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: currentUsage.apiLimit === -1 ? '15%' : `${Math.min((currentUsage.apiCalls / currentUsage.apiLimit) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {analytics && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Monthly Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
                <div className="text-center">
                  <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalInvoices}</p>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{analytics.paidInvoices}</p>
                  <p className="text-sm text-gray-600">Paid Invoices</p>
                </div>
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.averageInvoiceAmount)}</p>
                  <p className="text-sm text-gray-600">Avg Invoice</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingManagementPage;