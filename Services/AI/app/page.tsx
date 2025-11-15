import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Brain, 
  Image, 
  FileText, 
  BarChart, 
  Fingerprint,
  MessageSquare,
  CircuitBoard,
  Database,
  LineChart,
  Search
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Services Hub - DoganHubStore',
  description: 'Comprehensive AI services for the unified platform',
}

const aiModules = [
  {
    name: 'Document Intelligence',
    href: '/ai/document-intelligence',
    icon: FileText,
    description: 'Extract data from documents with OCR and form recognition',
  },
  {
    name: 'Natural Language Processing',
    href: '/ai/nlp',
    icon: MessageSquare,
    description: 'Text analysis, classification, and language translation',
  },
  {
    name: 'Computer Vision',
    href: '/ai/vision',
    icon: Image,
    description: 'Image recognition, object detection, and classification',
  },
  {
    name: 'Predictive Analytics',
    href: '/ai/predictive',
    icon: LineChart,
    description: 'Sales forecasting, demand prediction, and trend analysis',
  },
  {
    name: 'Machine Learning Models',
    href: '/ai/models',
    icon: Brain,
    description: 'Custom model training, deployment, and monitoring',
  },
  {
    name: 'Entity Extraction',
    href: '/ai/entity-extraction',
    icon: Search,
    description: 'Extract entities from unstructured text data',
  },
  {
    name: 'Face Recognition',
    href: '/ai/face-recognition',
    icon: Fingerprint,
    description: 'Facial detection and recognition capabilities',
  },
  {
    name: 'Data Analysis',
    href: '/ai/data-analysis',
    icon: Database,
    description: 'Automated data analysis and insights generation',
  },
  {
    name: 'AI Integration Hub',
    href: '/ai/integration',
    icon: CircuitBoard,
    description: 'Connect AI services to business applications',
  },
]

export default function AIServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <Brain className="h-16 w-16 mx-auto mb-4 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Services Hub
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive artificial intelligence capabilities for enterprise operations
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {aiModules.map((module) => {
          const Icon = module.icon
          return (
            <Link
              key={module.name}
              href={module.href}
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon className="h-8 w-8 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {module.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {module.description}
              </p>
            </Link>
          )
        })}
      </div>

      <div className="bg-indigo-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started with AI Services</h2>
        <p className="text-gray-700 mb-4">
          The AI Services module provides a comprehensive suite of artificial intelligence capabilities
          that can be integrated with any business module in the DoganHubStore platform.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white p-4 rounded border border-indigo-100">
            <h3 className="font-medium text-indigo-700 mb-2">Documentation</h3>
            <p className="text-sm text-gray-600">View comprehensive API documentation for all AI services</p>
          </div>
          <div className="bg-white p-4 rounded border border-indigo-100">
            <h3 className="font-medium text-indigo-700 mb-2">API Explorer</h3>
            <p className="text-sm text-gray-600">Test and explore AI services through interactive API console</p>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>AI Services Hub is ready to integrate with your business modules</p>
        <p className="text-xs text-gray-400 mt-2">
          Version 2.0.0 | Environment: {process.env.NODE_ENV || 'development'} | {aiModules.length} services available
        </p>
      </div>
    </div>
  )
}
