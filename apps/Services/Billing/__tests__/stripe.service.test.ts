import { StripeService } from '../src/services/stripe.service'

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockImplementation((params) => {
          if (!params.line_items || !params.line_items[0]?.price) {
            throw new Error('Missing required parameters')
          }
          return Promise.resolve({
            id: 'cs_test_session_123',
            url: 'https://checkout.stripe.com/pay/cs_test_session_123'
          })
        })
      }
    },
    billingPortal: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'bps_test_session_123',
          url: 'https://billing.stripe.com/session/bps_test_session_123'
        })
      }
    },
    customers: {
      create: jest.fn().mockImplementation((params) => {
        if (!params.email) {
          throw new Error('Missing required parameters')
        }
        return Promise.resolve({
          id: 'cus_test_customer_123',
          email: 'test@example.com'
        })
      }),
      retrieve: jest.fn().mockImplementation((customerId) => {
        if (!customerId) {
          throw new Error('Invalid customer ID')
        }
        return Promise.resolve({
          id: 'cus_test_customer_123',
          email: 'test@example.com'
        })
      })
    },
    subscriptions: {
      retrieve: jest.fn().mockImplementation((subscriptionId) => {
        if (!subscriptionId) {
          throw new Error('Invalid subscription ID')
        }
        return Promise.resolve({
          id: 'sub_test_subscription_123',
          status: 'active',
          customer: 'cus_test_customer_123',
          current_period_start: 1640995200,
          current_period_end: 1643673600,
          cancel_at_period_end: false,
          items: {
            data: [{
              price: {
                id: 'price_test_123',
                unit_amount: 2900,
                currency: 'usd',
                recurring: {
                  interval: 'month'
                }
              }
            }]
          }
        })
      }),
      update: jest.fn().mockImplementation((subscriptionId, params) => {
        if (!subscriptionId) {
          throw new Error('Invalid subscription ID')
        }
        return Promise.resolve({
          id: 'sub_test_subscription_123',
          status: 'active',
          cancel_at_period_end: false,
          current_period_end: 1643673600
        })
      }),
      list: jest.fn().mockImplementation((params) => {
        if (!params.customer) {
          throw new Error('Invalid customer ID')
        }
        return Promise.resolve({
          data: [{
            id: 'sub_test_subscription_123',
            status: 'active',
            customer: 'cus_test_customer_123',
            current_period_start: 1640995200,
            current_period_end: 1643673600,
            cancel_at_period_end: false,
            items: {
              data: [{
                price: {
                  id: 'price_test_123',
                  unit_amount: 2900,
                  currency: 'usd',
                  recurring: {
                    interval: 'month'
                  }
                }
              }]
            }
          }]
        })
      })
    }
  }))
})

// Mock DatabaseService
jest.mock('../src/services/database.service', () => ({
  DatabaseService: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({ rows: [] }),
    getClient: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn()
    }),
    createCustomer: jest.fn().mockResolvedValue({
      stripeCustomerId: 'cus_test_customer_123',
      email: 'test@example.com',
      name: 'Test User',
      tenantId: 'tenant_123'
    })
  }))
}))

describe('StripeService', () => {
  let stripeService: StripeService

  beforeEach(() => {
    jest.clearAllMocks()
    stripeService = new StripeService()
  })

  describe('createCheckoutSession', () => {
    it('should create a checkout session successfully', async () => {
      const params = {
        priceId: 'price_test_123',
        customerEmail: 'test@example.com',
        tenantId: 'tenant_123',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        trialPeriodDays: 7,
        metadata: {
          tenantId: 'tenant_123',
          plan: 'pro'
        }
      }

      const result = await stripeService.createCheckoutSession(params)

      expect(result).toBeDefined()
      expect(result.id).toBe('cs_test_session_123')
      expect(result.url).toBe('https://checkout.stripe.com/pay/cs_test_session_123')
    })

    it('should handle missing required parameters', async () => {
      const params = {
        priceId: '',
        customerEmail: '',
        tenantId: '',
        successUrl: '',
        cancelUrl: ''
      }

      await expect(stripeService.createCheckoutSession(params)).rejects.toThrow()
    })
  })

  describe('createCustomer', () => {
    it('should create a customer successfully', async () => {
      const params = {
        email: 'test@example.com',
        name: 'Test User',
        tenantId: 'tenant_123',
        metadata: {
          tenantId: 'tenant_123',
          source: 'web'
        }
      }

      const result = await stripeService.createCustomer(params)

      expect(result).toBeDefined()
      expect(result.id).toBe('cus_test_customer_123')
      expect(result.email).toBe('test@example.com')
    })

    it('should handle customer creation errors', async () => {
      const params = {
        email: '',
        tenantId: ''
      }

      await expect(stripeService.createCustomer(params)).rejects.toThrow()
    })
  })

  describe('getSubscriptionPlans', () => {
    it('should return subscription plans', async () => {
      const plans = await stripeService.getSubscriptionPlans()

      expect(Array.isArray(plans)).toBe(true)
      expect(plans.length).toBeGreaterThan(0)
      
      const plan = plans[0]
      expect(plan).toHaveProperty('id')
      expect(plan).toHaveProperty('name')
      expect(plan).toHaveProperty('price')
      expect(plan).toHaveProperty('currency')
      expect(plan).toHaveProperty('interval')
      expect(plan).toHaveProperty('features')
    })

    it('should return plans with correct structure', async () => {
      const plans = await stripeService.getSubscriptionPlans()

      plans.forEach(plan => {
        expect(typeof plan.id).toBe('string')
        expect(typeof plan.name).toBe('string')
        expect(typeof plan.description).toBe('string')
        expect(typeof plan.priceId).toBe('string')
        expect(typeof plan.price).toBe('number')
        expect(typeof plan.currency).toBe('string')
        expect(['month', 'year']).toContain(plan.interval)
        expect(Array.isArray(plan.features)).toBe(true)
      })
    })
  })

  describe('getCustomerSubscriptions', () => {
    it('should return customer subscriptions', async () => {
      const customerId = 'cus_test_customer_123'
      const subscriptions = await stripeService.getCustomerSubscriptions(customerId)

      expect(Array.isArray(subscriptions)).toBe(true)
    })

    it('should handle invalid customer ID', async () => {
      const customerId = ''
      
      await expect(stripeService.getCustomerSubscriptions(customerId)).rejects.toThrow()
    })
  })

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const subscriptionId = 'sub_test_subscription_123'
      
      const result = await stripeService.cancelSubscription(subscriptionId)

      expect(result).toBeDefined()
    })

    it('should handle invalid subscription ID', async () => {
      const subscriptionId = ''
      
      await expect(stripeService.cancelSubscription(subscriptionId)).rejects.toThrow()
    })
  })

  describe('reactivateSubscription', () => {
    it('should reactivate subscription successfully', async () => {
      const subscriptionId = 'sub_test_subscription_123'
      
      const result = await stripeService.reactivateSubscription(subscriptionId)

      expect(result).toBeDefined()
    })

    it('should handle invalid parameters', async () => {
      const subscriptionId = ''
      
      await expect(stripeService.reactivateSubscription(subscriptionId)).rejects.toThrow()
    })
  })
})