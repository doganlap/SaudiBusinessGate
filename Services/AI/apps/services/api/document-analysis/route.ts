import { NextRequest, NextResponse } from 'next/server';

// Mock document analysis results
const mockAnalysisResults = {
  documentId: "doc-1234-abcd",
  type: "invoice",
  confidence: 0.97,
  metadata: {
    pageCount: 2,
    processingTimeMs: 450
  },
  fields: {
    invoiceNumber: {
      value: "INV-2025-0472",
      confidence: 0.99
    },
    date: {
      value: "2025-10-05",
      confidence: 0.98
    },
    total: {
      value: 1250.75,
      confidence: 0.97
    },
    vendor: {
      value: "Tech Solutions Inc.",
      confidence: 0.96
    },
    lineItems: [
      {
        description: "Cloud Services - Standard",
        quantity: 1,
        unitPrice: 950.00,
        amount: 950.00,
        confidence: 0.95
      },
      {
        description: "Technical Support - 5 hours",
        quantity: 5,
        unitPrice: 60.15,
        amount: 300.75,
        confidence: 0.94
      }
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    // In a real implementation, we would process the uploaded document
    // and extract data using OCR and form recognition
    
    // For demo purposes, we're returning mock analysis results
    return NextResponse.json({
      success: true,
      data: mockAnalysisResults
    });
  } catch (error) {
    console.error('Document analysis API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to analyze document'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Document analysis API is ready to receive documents',
    supportedTypes: ['pdf', 'jpg', 'png', 'tiff'],
    maxSizeMB: 10,
    status: 'operational'
  });
}
