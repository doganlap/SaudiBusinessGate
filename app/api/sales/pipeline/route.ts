import { NextRequest, NextResponse } from 'next/server';

interface PipelineStage {
  id: string;
  name: string;
  deals: PipelineDeal[];
  totalValue: number;
  averageDealSize: number;
  conversionRate: number;
  color: string;
}

interface PipelineDeal {
  id: string;
  name: string;
  company: string;
  value: number;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  daysInStage: number;
}

const mockPipeline: PipelineStage[] = [
  {
    id: 'prospecting',
    name: 'Prospecting',
    color: 'bg-gray-100 border-gray-300',
    conversionRate: 25,
    deals: [
      {
        id: '1',
        name: 'New Enterprise Lead',
        company: 'Future Tech Inc',
        value: 75000,
        probability: 20,
        expectedCloseDate: '2024-03-30',
        assignedTo: 'Sarah Johnson',
        daysInStage: 5
      },
      {
        id: '2',
        name: 'SMB Opportunity',
        company: 'Local Business Co',
        value: 15000,
        probability: 15,
        expectedCloseDate: '2024-04-15',
        assignedTo: 'Mike Chen',
        daysInStage: 12
      }
    ],
    totalValue: 90000,
    averageDealSize: 45000
  },
  {
    id: 'qualification',
    name: 'Qualification',
    color: 'bg-blue-50 border-blue-200',
    conversionRate: 40,
    deals: [
      {
        id: '3',
        name: 'Startup Package',
        company: 'Startup Inc',
        value: 25000,
        probability: 40,
        expectedCloseDate: '2024-03-15',
        assignedTo: 'Alex Rodriguez',
        daysInStage: 8
      }
    ],
    totalValue: 25000,
    averageDealSize: 25000
  },
  {
    id: 'proposal',
    name: 'Proposal',
    color: 'bg-yellow-50 border-yellow-200',
    conversionRate: 60,
    deals: [
      {
        id: '4',
        name: 'Cloud Migration Project',
        company: 'Innovate.io',
        value: 85000,
        probability: 60,
        expectedCloseDate: '2024-02-28',
        assignedTo: 'Mike Chen',
        daysInStage: 15
      }
    ],
    totalValue: 85000,
    averageDealSize: 85000
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    color: 'bg-orange-50 border-orange-200',
    conversionRate: 75,
    deals: [
      {
        id: '5',
        name: 'Enterprise Software License',
        company: 'TechCorp Solutions',
        value: 150000,
        probability: 75,
        expectedCloseDate: '2024-02-15',
        assignedTo: 'Sarah Johnson',
        daysInStage: 22
      }
    ],
    totalValue: 150000,
    averageDealSize: 150000
  },
  {
    id: 'closed-won',
    name: 'Closed Won',
    color: 'bg-green-50 border-green-200',
    conversionRate: 100,
    deals: [
      {
        id: '6',
        name: 'Annual Subscription Renewal',
        company: 'Global Corp',
        value: 120000,
        probability: 100,
        expectedCloseDate: '2024-01-10',
        assignedTo: 'Sarah Johnson',
        daysInStage: 0
      }
    ],
    totalValue: 120000,
    averageDealSize: 120000
  }
];

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    
    // In a real app, filter by tenantId
    const pipeline = mockPipeline;
    
    const totalPipelineValue = pipeline.reduce((sum, stage) => sum + stage.totalValue, 0);
    const totalDeals = pipeline.reduce((sum, stage) => sum + stage.deals.length, 0);
    const weightedValue = pipeline.reduce((sum, stage) => 
      sum + stage.deals.reduce((stageSum, deal) => stageSum + (deal.value * deal.probability / 100), 0), 0
    );
    
    return NextResponse.json({
      success: true,
      pipeline,
      summary: {
        totalPipelineValue,
        totalDeals,
        weightedValue,
        avgDealSize: totalPipelineValue / totalDeals || 0,
        avgConversionRate: pipeline.reduce((sum, stage) => sum + stage.conversionRate, 0) / pipeline.length
      }
    });
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pipeline' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    const { dealId, fromStage, toStage } = body;
    
    // Find and move deal between stages
    const fromStageIndex = mockPipeline.findIndex(s => s.id === fromStage);
    const toStageIndex = mockPipeline.findIndex(s => s.id === toStage);
    
    if (fromStageIndex === -1 || toStageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Invalid stage' },
        { status: 400 }
      );
    }
    
    const dealIndex = mockPipeline[fromStageIndex].deals.findIndex(d => d.id === dealId);
    if (dealIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      );
    }
    
    // Move deal
    const deal = mockPipeline[fromStageIndex].deals.splice(dealIndex, 1)[0];
    deal.daysInStage = 0; // Reset days in stage
    mockPipeline[toStageIndex].deals.push(deal);
    
    // Recalculate stage totals
    mockPipeline[fromStageIndex].totalValue = mockPipeline[fromStageIndex].deals.reduce((sum, d) => sum + d.value, 0);
    mockPipeline[toStageIndex].totalValue = mockPipeline[toStageIndex].deals.reduce((sum, d) => sum + d.value, 0);
    
    return NextResponse.json({
      success: true,
      message: 'Deal moved successfully',
      pipeline: mockPipeline
    });
  } catch (error) {
    console.error('Error moving deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to move deal' },
      { status: 500 }
    );
  }
}
