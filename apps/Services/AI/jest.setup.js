import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
}))

// Mock NextRequest
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(url, init) {
      this.url = url
      this.method = init?.method || 'GET'
      this.headers = new Headers(init?.headers)
    }
    url
    method
    headers
  },
  NextResponse: {
    json: (data, init) => {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init?.headers
        }
      })
    }
  }
}))

// Mock fetch API
global.fetch = jest.fn()

// Add Response global if not available
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
      this.headers = new Headers(init?.headers)
    }
    
    async json() {
      return JSON.parse(this.body)
    }
    
    async text() {
      return this.body
    }
  }
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_AI_API_KEY = 'test-ai-key'

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})

// Clean up after tests
afterEach(() => {
  jest.restoreAllMocks()
})