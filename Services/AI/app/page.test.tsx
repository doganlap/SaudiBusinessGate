import { render, screen } from '@testing-library/react';
import AIServicesPage from './page';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('AI Services Page', () => {
  it('renders the AI services hub title', () => {
    render(<AIServicesPage />);
    
    expect(screen.getByText('AI Services Hub')).toBeInTheDocument();
  });

  it('renders all AI service modules', () => {
    render(<AIServicesPage />);
    
    const expectedServices = [
      'Document Intelligence',
      'Natural Language Processing',
      'Computer Vision',
      'Predictive Analytics',
      'Machine Learning Models',
      'Entity Extraction',
      'Face Recognition',
      'Data Analysis',
      'AI Integration Hub'
    ];

    expectedServices.forEach(service => {
      expect(screen.getByText(service)).toBeInTheDocument();
    });
  });

  it('renders service descriptions', () => {
    render(<AIServicesPage />);
    
    expect(screen.getByText('Extract data from documents with OCR and form recognition')).toBeInTheDocument();
    expect(screen.getByText('Text analysis, classification, and language translation')).toBeInTheDocument();
    expect(screen.getByText('Image recognition, object detection, and classification')).toBeInTheDocument();
  });

  it('renders getting started section', () => {
    render(<AIServicesPage />);
    
    expect(screen.getByText('Getting Started with AI Services')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('API Explorer')).toBeInTheDocument();
  });

  it('renders footer information', () => {
    render(<AIServicesPage />);
    
    expect(screen.getByText(/AI Services Hub is ready to integrate with your business modules/i)).toBeInTheDocument();
    expect(screen.getByText(/Version 2.0.0/i)).toBeInTheDocument();
  });
});