// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.PORT = '3001'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.JWT_SECRET = 'test_jwt_secret'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})

// Clean up after tests
afterEach(() => {
  jest.restoreAllMocks()
})