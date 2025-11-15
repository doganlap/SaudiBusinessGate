import { NextRequest, NextResponse } from 'next/server';
import { SalesService } from '@/lib/services/sales.service';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const leads = await SalesService.getLeads(tenantId);
    const summary = await SalesService.getLeadsSummary(tenantId);

    return NextResponse.json({
      success: true,
      leads,
      total: leads.length,
      summary
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    // Create lead in database
    const newLead = await SalesService.createLead(tenantId, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      position: body.position,
      source: body.source,
      status: body.status || 'new',
      score: body.score || 0,
      estimated_value: body.estimated_value || 0,
      assigned_to: body.assigned_to,
      notes: body.notes
    });
    
    return NextResponse.json({
      success: true,
      lead: newLead,
      message: 'Lead created successfully'
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');
    const body = await request.json();
    
    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }
    
    // Update lead in database
    const updatedLead = await SalesService.updateLead(tenantId, leadId, body);
    
    if (!updatedLead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      lead: updatedLead,
      message: 'Lead updated successfully'
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');
    
    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }
    
    // Delete lead from database
    const deleted = await SalesService.deleteLead(tenantId, leadId);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
