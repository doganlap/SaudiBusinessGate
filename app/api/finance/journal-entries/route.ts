import { NextRequest, NextResponse } from 'next/server';
import { CompleteFinanceService } from '@/lib/services/finance-complete.service';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    
    const filters = {
      status: searchParams.get('status') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };
    
    // Get journal entries from database
    try {
      const journalEntries = await CompleteFinanceService.getJournalEntries(tenantId, filters);
      
      return NextResponse.json({
        success: true,
        data: journalEntries || [],
        total: journalEntries?.length || 0,
        filters,
        source: 'database'
      });
    } catch (dbError) {
      console.error('Error fetching journal entries:', dbError);
      
      // Return empty array instead of error for graceful degradation
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        filters,
        source: 'fallback',
        message: 'No journal entries found or database unavailable'
      });
    }
  } catch (error) {
    console.error('Error in journal entries API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process journal entries request',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      total: 0
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    // Validate required fields
    if (!body.description || !body.entry_date || !body.lines || body.lines.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: description, entry_date, lines' },
        { status: 400 }
      );
    }
    
    // Normalize lines first to handle both debit/credit and debit_amount/credit_amount field names
    const normalizedLines = body.lines.map((line: any) => ({
      ...line,
      account_id: String(line.account_id || line.accountId || '1'),
      debit_amount: parseFloat(line.debit_amount || line.debit || 0),
      credit_amount: parseFloat(line.credit_amount || line.credit || 0),
    }));
    
    // Validate that debits equal credits using normalized values
    const totalDebits = normalizedLines.reduce((sum: number, line: any) => sum + line.debit_amount, 0);
    const totalCredits = normalizedLines.reduce((sum: number, line: any) => sum + line.credit_amount, 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'Journal entry must balance: total debits must equal total credits' },
        { status: 400 }
      );
    }

    try {
      const journalEntry = await CompleteFinanceService.createJournalEntry(tenantId, {
        description: body.description,
        entry_date: body.entry_date,
        reference: body.reference,
        lines: normalizedLines,
        created_by: body.created_by || 'system'
      });
      
      return NextResponse.json({
        success: true,
        data: journalEntry,
        message: 'Journal entry created successfully'
      });
    } catch (dbError) {
      console.error('Database error creating journal entry:', dbError);
      
      // Return error response instead of mock data (Zero Mock Zero Fallback Mock)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create journal entry',
          message: 'Database unavailable. Please try again later.',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create journal entry',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    const action = searchParams.get('action');
    const body = await request.json();
    
    if (!entryId) {
      return NextResponse.json(
        { success: false, error: 'Journal entry ID is required' },
        { status: 400 }
      );
    }
    
    if (action === 'post') {
      const postedEntry = await CompleteFinanceService.postJournalEntry(
        tenantId, 
        entryId, 
        body.posted_by || 'system'
      );
      
      return NextResponse.json({
        success: true,
        data: postedEntry,
        message: 'Journal entry posted successfully'
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}
