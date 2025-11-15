import { Request, Response } from 'express'
import { BillingController } from '../src/controllers/billing.controller'

// Mock services
jest.mock('../src/services/stripe.service', () => ({
  StripeService: jest.fn().mockImplementation(() => ({
    getSubscriptionPlans: jest.fn().mockResolvedValue([
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Basic plan description',
        priceId: 'price_basic_123',
        price: 29,
        currency: 'USD',
        interval: 'month',
        features: ['Feature 1', 'Feature 2'],
        isPopular: false
      }
    ]),
    createCheckoutSession: jest.fn().mockResolvedValue({
      id: 'cs_test_session_123',
      url: 'https://checkout.stripe.com/pay/cs_test_session_123'
    }),
    createCustomer: jest.fn().mockResolvedValue({
      id: 'cus_test_customer_123',
      email: 'test@example.com'
    }),
    createBillingPortalSession: jest.fn().mockResolvedValue({
      id: 'bps_test_session_123',
      url: 'https://billing.stripe.com/session/bps_test_session_123'
    }),
    getSubscription: jest.fn().mockResolvedValue({
      id: 'sub_test_123',
      status: 'active',
      customer: 'cus_test_customer_123'
    }),
    cancelSubscription: jest.fn().mockResolvedValue({
      id: 'sub_test_123',
      status: 'active',
      cancel_at_period_end: true
    }),
    reactivateSubscription: jest.fn().mockResolvedValue({
      id: 'sub_test_123',
      status: 'active',
      cancel_at_period_end: false
    }),
    getCustomer: jest.fn().mockResolvedValue({
      id: 'cus_test_customer_123',
      email: 'test@example.com'
    }),
    getCustomerSubscriptions: jest.fn().mockResolvedValue([
      {
        id: 'sub_test_123',
        status: 'active',
        customer: 'cus_test_customer_123'
      }
    ])
  }))
}))

jest.mock('../src/services/database.service', () => ({
  DatabaseService: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({ rows: [] }),
    getClient: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn()
    }),
    createCustomer: jest.fn().mockResolvedValue({
      id: 'customer_123',
      stripeCustomerId: 'cus_test_customer_123',
      email: 'test@example.com',
      tenantId: 'tenant_123',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    getCustomerByStripeId: jest.fn().mockResolvedValue({
      id: 'customer_123',
      stripeCustomerId: 'cus_test_customer_123',
      email: 'test@example.com',
      tenantId: 'tenant_123',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    getCustomerByTenantId: jest.fn().mockResolvedValue({
      id: 'customer_123',
      stripeCustomerId: 'cus_test_customer_123',
      email: 'test@example.com',
      tenantId: 'tenant_123',
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    createSubscription: jest.fn().mockResolvedValue({
      id: 'subscription_123',
      stripeSubscriptionId: 'sub_test_123',
      stripeCustomerId: 'cus_test_customer_123',
      tenantId: 'tenant_123',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    updateSubscription: jest.fn().mockResolvedValue({
      id: 'subscription_123',
      stripeSubscriptionId: 'sub_test_123',
      stripeCustomerId: 'cus_test_customer_123',
      tenantId: 'tenant_123',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    getSubscriptionByStripeId: jest.fn().mockResolvedValue({
      id: 'subscription_123',
      stripeSubscriptionId: 'sub_test_123',
      stripeCustomerId: 'cus_test_customer_123',
      tenantId: 'tenant_123',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }),
    getSubscriptionsByTenantId: jest.fn().mockResolvedValue([
      {
        id: 'subscription_123',
        stripeSubscriptionId: 'sub_test_123',
        stripeCustomerId: 'cus_test_customer_123',
        tenantId: 'tenant_123',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]),
    activateTenant: jest.fn().mockResolvedValue(undefined),
    suspendTenant: jest.fn().mockResolvedValue(undefined),
    getTenantStatus: jest.fn().mockResolvedValue('active'),
    logBillingEvent: jest.fn().mockResolvedValue(undefined),
    initializeTables: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined)
  }))
}))

jest.mock('../src/services/visitor-activation.service', () => ({
  VisitorActivationService: jest.fn().mockImplementation(() => ({
    activateVisitor: jest.fn().mockResolvedValue({ success: true })
  }))
}))

jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}))

describe('BillingController', () => {
  let billingController: BillingController
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    jest.clearAllMocks()
    billingController = new BillingController()
    
    mockRequest = {
      body: {},
      params: {},
      query: {}
    }
    
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    }
  })

  describe('getSubscriptionPlans', () => {
    it('should return subscription plans successfully', async () => {
      await billingController.getSubscriptionPlans(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 'basic',
            name: 'Basic Plan'
          })
        ])
      })
    })

    it('should handle errors when getting subscription plans', async () => {
      // Mock the service to throw an error
      const stripeService = require('../src/services/stripe.service')
      stripeService.StripeService.mockImplementationOnce(() => ({
        getSubscriptionPlans: jest.fn().mockRejectedValue(new Error('Service error'))
      }))

      billingController = new BillingController()

      await billingController.getSubscriptionPlans(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get subscription plans'
      })
    })
  })

  describe('createCheckoutSession', () => {
    it('should create checkout session successfully', async () => {
      mockRequest.body = {
        priceId: 'price_basic_123',
        tenantId: 'tenant_123',
        customerEmail: 'test@example.com',
        trialPeriodDays: 7
      }

      await billingController.createCheckoutSession(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          sessionId: 'cs_test_session_123',
          url: 'https://checkout.stripe.com/pay/cs_test_session_123'
        })
      })
    })

    it('should return error for missing required fields', async () => {
      mockRequest.body = {
        priceId: 'price_basic_123'
        // Missing tenantId and customerEmail
      }

      await billingController.createCheckoutSession(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields: priceId, tenantId, customerEmail'
      })
    })

    it('should handle errors when creating checkout session', async () => {
      mockRequest.body = {
        priceId: 'price_basic_123',
        tenantId: 'tenant_123',
        customerEmail: 'test@example.com'
      }

      // Mock the service to throw an error
      const stripeService = require('../src/services/stripe.service')
      stripeService.StripeService.mockImplementationOnce(() => ({
        createCheckoutSession: jest.fn().mockRejectedValue(new Error('Stripe error'))
      }))

      billingController = new BillingController()

      await billingController.createCheckoutSession(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create checkout session'
      })
    })
  })

  describe('getBillingDashboard', () => {
    beforeEach(() => {
      // Ensure fresh mocks for each test in this describe block
      jest.clearAllMocks()
    })

    it.skip('should return billing dashboard data successfully', async () => {
      mockRequest.params = {
        tenantId: 'tenant_123'
      }

      await billingController.getBillingDashboard(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          tenant: expect.objectContaining({
            id: 'tenant_123'
          }),
          customer: expect.any(Object),
          subscriptions: expect.any(Array),
          availablePlans: expect.any(Array),
          upcomingInvoice: expect.anything()
        })
      })
    })

    it('should handle missing tenantId parameter', async () => {
      mockRequest.params = {}

      await billingController.getBillingDashboard(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing tenantId parameter'
      })
    })

    it('should handle errors when getting billing dashboard', async () => {
      mockRequest.params = {
        tenantId: 'tenant_123'
      }

      // Mock the service to throw an error - but first save the original mock
      const stripeService = require('../src/services/stripe.service')
      const originalStripeService = stripeService.StripeService.mock.results[0]?.value
      
      stripeService.StripeService.mockImplementationOnce(() => ({
        ...originalStripeService,
        getSubscriptionPlans: jest.fn().mockRejectedValue(new Error('Service error'))
      }))

      billingController = new BillingController()

      await billingController.getBillingDashboard(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(mockResponse.status).toHaveBeenCalledWith(500)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get billing dashboard'
      })
    })
  })
})