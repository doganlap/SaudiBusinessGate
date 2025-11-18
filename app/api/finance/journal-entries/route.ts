import { NextRequest, NextResponse } from 'next/server';
import { CompleteFinanceService } from '@/lib/services/finance-complete.service';
import { testConnection } from '@/lib/db/connection';

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
    
    // Test database connection first
    const isConnected = await testConnection();
    
    if (isConnected) {
      try {
        const journalEntries = await CompleteFinanceService.getJournalEntries(tenantId, filters);
        
        return NextResponse.json({
          success: true,
          data: journalEntries,
          total: journalEntries.length,
          filters,
          source: 'database'
        });
      } catch (dbError) {
        console.error('Database query failed, using fallback:', dbError);
      }
    }
    
    // Fallback sample data
    const fallbackEntries = [
      {
        id: '1',
        tenant_id: 'default-tenant',
        entry_number: 'JE-000001',
        entry_date: '2024-11-11',
        description: 'Opening Balance Entry',
        total_debit: 10000,
        total_credit: 10000,
        status: 'posted',
        entry_type: 'manual',
        created_at: '2024-11-11T10:00:00Z',
        updated_at: '2024-11-11T10:00:00Z',
        lines: [
          {
            id: '1',
            line_number: 1,
            account_id: '1',
            description: 'Cash deposit',
            debit_amount: 10000,
            credit_amount: 0,
            account_name: 'Cash and Cash Equivalents',
            account_code: '1000'
          },
          {
            id: '2',
            line_number: 2,
            account_id: '2',
            description: 'Owner investment',
            debit_amount: 0,
            credit_amount: 10000,
            account_name: 'Owner\'s Equity',
            account_code: '3000'
          }
        ]
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: fallbackEntries,
      total: fallbackEntries.length,
      fallback: true,
      source: 'mock'
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    
    // Fallback sample data
    const fallbackEntries = [
      {
        id: '1',
        tenant_id: 'default-tenant',
        entry_number: 'JE-000001',
        entry_date: '2024-11-11',
        description: 'Opening Balance Entry',
        total_debit: 10000,
        total_credit: 10000,
        status: 'posted',
        entry_type: 'manual',
        created_at: '2024-11-11T10:00:00Z',
        updated_at: '2024-11-11T10:00:00Z',
        lines: [
          {
            id: '1',
            line_number: 1,
            account_id: '1',
            description: 'Cash deposit',
            debit_amount: 10000,
            credit_amount: 0,
            account_name: 'Cash and Cash Equivalents',
            account_code: '1000'
          },
          {
            id: '2',
            line_number: 2,
            account_id: '2',
            description: 'Owner investment',
            debit_amount: 0,
            credit_amount: 10000,
            account_name: 'Owner\'s Equity',
            account_code: '3000'
          }
        ]
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: fallbackEntries,
      total: fallbackEntries.length,
      fallback: true,
      source: 'error_fallback'
    });
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
    
    // Validate that debits equal credits
    const totalDebits = body.lines.reduce((sum: number, line: any) => sum + (line.debit_amount || 0), 0);
    const totalCredits = body.lines.reduce((sum: number, line: any) => sum + (line.credit_amount || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'Journal entry must balance: total debits must equal total credits' },
        { status: 400 }
      );
    }
    
    const journalEntry = await CompleteFinanceService.createJournalEntry(tenantId, {
      description: body.description,
      entry_date: body.entry_date,
      reference: body.reference,
      lines: body.lines,
      created_by: body.created_by || 'system'
    });
    
    return NextResponse.json({
      success: true,
      data: journalEntry,
      message: 'Journal entry created successfully'
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create journal entry' },
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
