import { render, screen } from '@testing-library/react'
import AIServicesPage from '../apps/web/page'

// Mock the Link component from Next.js
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('AI Services Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main heading', () => {
    render(<AIServicesPage />)
    
    expect(screen.getByText('AI Services Hub')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<AIServicesPage />)
    
    expect(screen.getByText('Comprehensive artificial intelligence capabilities for enterprise operations')).toBeInTheDocument()
  })

  it('renders all AI service modules', () => {
    render(<AIServicesPage />)
    
    const expectedModules = [
      'Document Intelligence',
      'Natural Language Processing',
      'Computer Vision',
      'Predictive Analytics',
      'Machine Learning Models',
      'Entity Extraction',
      'Face Recognition',
      'Data Analysis',
      'AI Integration Hub'
    ]

    expectedModules.forEach(moduleName => {
      expect(screen.getByText(moduleName)).toBeInTheDocument()
    })
  })

  it('renders correct links for each module', () => {
    render(<AIServicesPage />)
    
    const expectedLinks = [
      { name: 'Document Intelligence', href: '/ai/document-intelligence' },
      { name: 'Natural Language Processing', href: '/ai/nlp' },
      { name: 'Computer Vision', href: '/ai/vision' },
      { name: 'Predictive Analytics', href: '/ai/predictive' },
      { name: 'Machine Learning Models', href: '/ai/models' },
      { name: 'Entity Extraction', href: '/ai/entity-extraction' },
      { name: 'Face Recognition', href: '/ai/face-recognition' },
      { name: 'Data Analysis', href: '/ai/data-analysis' },
      { name: 'AI Integration Hub', href: '/ai/integration' }
    ]

    expectedLinks.forEach(({ name, href }) => {
      const linkElement = screen.getByText(name).closest('a')
      expect(linkElement).toHaveAttribute('href', href)
    })
  })

  it('renders getting started section', () => {
    render(<AIServicesPage />)
    
    expect(screen.getByText('Getting Started with AI Services')).toBeInTheDocument()
    expect(screen.getByText('Documentation')).toBeInTheDocument()
    expect(screen.getByText('API Explorer')).toBeInTheDocument()
  })

  it('renders version and environment information', () => {
    render(<AIServicesPage />)
    
    expect(screen.getByText(/Version 2.0.0/)).toBeInTheDocument()
    expect(screen.getByText(/9 services available/)).toBeInTheDocument()
  })

  it('renders Brain icon', () => {
    render(<AIServicesPage />)
    
    // The Brain icon is rendered as an SVG, not an img element
    const brainIcon = screen.getByText('AI Services Hub').closest('div')?.querySelector('svg')
    expect(brainIcon).toBeInTheDocument()
  })
})