/**
 * Billing API Service
 * Frontend service for handling billing operations and Stripe integration
 */

class BillingApiService {
  constructor() {
    this.baseUrl = '/api/billing';
  }

  // ===================== LICENSE PLANS =====================

  async getLicensePlans() {
    try {
      const response = await fetch(`${this.baseUrl}/plans`);
      if (!response.ok) {
        throw new Error(`Failed to fetch license plans: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching license plans:', error);
      throw error;
    }
  }

  async getLicensePlan(planId) {
    try {
      const response = await fetch(`${this.baseUrl}/plans/${planId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch license plan: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching license plan:', error);
      throw error;
    }
  }

  // ===================== SUBSCRIPTION MANAGEMENT =====================

  async getCurrentSubscription() {
    try {
      const response = await fetch(`${this.baseUrl}/subscription`);
      if (response.status === 404) {
        return null; // No active subscription
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  async createSubscription(planId, billingPeriod, paymentMethodId) {
    try {
      const response = await fetch(`${this.baseUrl}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingPeriod,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to create subscription: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async updateSubscription(planId, billingPeriod) {
    try {
      const response = await fetch(`${this.baseUrl}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingPeriod,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to update subscription: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(immediately = false) {
    try {
      const response = await fetch(`${this.baseUrl}/subscription`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          immediately,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to cancel subscription: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async reactivateSubscription() {
    try {
      const response = await fetch(`${this.baseUrl}/subscription/reactivate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to reactivate subscription: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  // ===================== PAYMENT METHODS =====================

  async getPaymentMethods() {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`);
      if (!response.ok) {
        throw new Error(`Failed to fetch payment methods: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  async addPaymentMethod(paymentMethodId, setAsDefault = false) {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          setAsDefault,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to add payment method: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  async removePaymentMethod(paymentMethodId) {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to remove payment method: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(paymentMethodId) {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods/${paymentMethodId}/default`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to set default payment method: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  // ===================== BILLING HISTORY =====================

  async getBillingHistory(limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/history?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch billing history: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching billing history:', error);
      throw error;
    }
  }

  async getInvoice(invoiceId) {
    try {
      const response = await fetch(`${this.baseUrl}/invoices/${invoiceId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch invoice: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async downloadInvoice(invoiceId) {
    try {
      const response = await fetch(`${this.baseUrl}/invoices/${invoiceId}/download`);
      if (!response.ok) {
        throw new Error(`Failed to get invoice download URL: ${response.statusText}`);
      }
      const { downloadUrl } = await response.json();
      return downloadUrl;
    } catch (error) {
      console.error('Error getting invoice download URL:', error);
      throw error;
    }
  }

  // ===================== USAGE AND ANALYTICS =====================

  async getCurrentUsage() {
    try {
      const response = await fetch(`${this.baseUrl}/usage/current`);
      if (!response.ok) {
        throw new Error(`Failed to fetch current usage: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching current usage:', error);
      throw error;
    }
  }

  async getUsageHistory(period = 'month') {
    try {
      const response = await fetch(`${this.baseUrl}/usage/history?period=${period}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch usage history: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching usage history:', error);
      throw error;
    }
  }

  async getBillingAnalytics(period = 'month') {
    try {
      const response = await fetch(`${this.baseUrl}/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch billing analytics: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching billing analytics:', error);
      throw error;
    }
  }

  // ===================== STRIPE CLIENT INTEGRATION =====================

  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const response = await fetch(`${this.baseUrl}/payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to create payment intent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async createSetupIntent() {
    try {
      const response = await fetch(`${this.baseUrl}/setup-intent`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to create setup intent: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  }

  // ===================== PROMOTIONAL CODES =====================

  async validatePromotionalCode(code) {
    try {
      const response = await fetch(`${this.baseUrl}/promo-codes/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to validate promotional code: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating promotional code:', error);
      throw error;
    }
  }

  async applyPromotionalCode(code, subscriptionId) {
    try {
      const response = await fetch(`${this.baseUrl}/promo-codes/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, subscriptionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to apply promotional code: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error applying promotional code:', error);
      throw error;
    }
  }

  // ===================== TRIAL MANAGEMENT =====================

  async startTrial(planId, trialDays = 14) {
    try {
      const response = await fetch(`${this.baseUrl}/trial/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, trialDays }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to start trial: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  }

  async extendTrial(additionalDays) {
    try {
      const response = await fetch(`${this.baseUrl}/trial/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ additionalDays }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to extend trial: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error extending trial:', error);
      throw error;
    }
  }

  // ===================== HELPER METHODS =====================

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  calculateProration(currentPlan, newPlan, billingPeriod) {
    const currentAmount = currentPlan.price[billingPeriod];
    const newAmount = newPlan.price[billingPeriod];
    const daysInPeriod = billingPeriod === 'monthly' ? 30 : 365;
    const remainingDays = Math.floor(Math.random() * daysInPeriod); // This should be calculated from actual billing cycle
    
    const currentDailyRate = currentAmount / daysInPeriod;
    const newDailyRate = newAmount / daysInPeriod;
    
    const refund = currentDailyRate * remainingDays;
    const newCharge = newDailyRate * remainingDays;
    
    return newCharge - refund;
  }
}

// Create and export singleton instance
const billingApiService = new BillingApiService();
export default billingApiService;