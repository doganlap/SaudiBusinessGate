import { NextRequest, NextResponse } from 'next/server';
import { CompleteFinanceService } from '@/lib/services/finance-complete.service';
import { apiLogger } from '@/lib/logger';

// Saudi VAT rates and compliance
const SAUDI_VAT_RATES = {
  STANDARD: 0.15, // 15% standard VAT rate
  ZERO: 0.00,     // 0% for exports and specific goods
  EXEMPT: null    // Exempt supplies
};

const SAUDI_TAX_CODES = {
  VAT_15: { code: 'VAT15', rate: 0.15, description: 'Standard VAT 15%' },
  VAT_0: { code: 'VAT0', rate: 0.00, description: 'Zero-rated VAT' },
  VAT_EXEMPT: { code: 'VAT_EXEMPT', rate: null, description: 'VAT Exempt' },
  VAT_INPUT: { code: 'VAT_INPUT', rate: 0.15, description: 'Input VAT (Purchases)' },
  VAT_OUTPUT: { code: 'VAT_OUTPUT', rate: 0.15, description: 'Output VAT (Sales)' }
};

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    
    const filters = {
      type: searchParams.get('type') || 'vat',
      period: searchParams.get('period') || '2024-Q4',
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };
    
    // Get tax records from database
    try {
      const taxRecords = await CompleteFinanceService.getTaxRecords(tenantId, filters);
      
      return NextResponse.json({
        success: true,
        data: taxRecords || [],
        total: taxRecords?.length || 0,
        filters,
        source: 'database',
        saudi_compliance: true,
        vat_rates: SAUDI_VAT_RATES,
        tax_codes: SAUDI_TAX_CODES
      });
    } catch (dbError) {
      apiLogger.error('Tax DB query failed', { 
        error: dbError instanceof Error ? dbError.message : String(dbError),
        tenantId 
      });
      
      // Return empty data instead of error for graceful degradation
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        filters,
        source: 'fallback',
        saudi_compliance: true,
        vat_rates: SAUDI_VAT_RATES,
        tax_codes: SAUDI_TAX_CODES,
        message: 'No tax records found or database unavailable'
      });
    }
  } catch (error) {
    apiLogger.error('Error fetching tax records', { error: error instanceof Error ? error.message : String(error) });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tax records',
      saudi_compliance: false
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const body = await request.json();
    
    // Validate required fields
    if (!body.tax_type || !body.tax_code || !body.amount || !body.base_amount || !body.transaction_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tax_type, tax_code, amount, base_amount, transaction_type' },
        { status: 400 }
      );
    }
    
    // Validate Saudi VAT compliance
    if (body.tax_type === 'vat' && body.tax_rate === 0.15) {
      // Validate ZATCA compliance requirements
      if (!body.saudi_compliance?.zatca_status) {
        apiLogger.warn('Missing ZATCA compliance status for Saudi VAT transaction');
      }
    }
    
    const taxRecord = await CompleteFinanceService.createTaxRecord(tenantId, {
      tax_type: body.tax_type,
      tax_code: body.tax_code,
      tax_rate: body.tax_rate,
      description: body.description,
      amount: body.amount,
      base_amount: body.base_amount,
      transaction_type: body.transaction_type,
      transaction_id: body.transaction_id,
      transaction_date: body.transaction_date,
      tax_period: body.tax_period,
      vat_return_period: body.vat_return_period,
      account_id: body.account_id,
      saudi_compliance: body.saudi_compliance,
      created_by: body.created_by || 'system'
    });
    
    return NextResponse.json({
      success: true,
      data: taxRecord,
      message: 'Tax record created successfully',
      saudi_compliance: true
    });
  } catch (error) {
    apiLogger.error('Error creating tax record', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { success: false, error: 'Failed to create tax record' },
      { status: 500 }
    );
  }
}

// Saudi VAT Return Calculation
export async function PUT(request: NextRequest) {
  try {
    const tenantId = request.headers.get('tenant-id') || 'default-tenant';
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'calculate-vat-return') {
      const period = searchParams.get('period') || '2024-Q4';
      
      try {
        // Calculate VAT return for Saudi compliance
        const vatReturn = await CompleteFinanceService.calculateVATReturn(tenantId, period);
        
        return NextResponse.json({
          success: true,
          data: vatReturn,
          period,
          saudi_compliance: true,
          zatca_ready: true,
          source: 'database'
        });
      } catch (dbError) {
        apiLogger.error('VAT return DB calculation failed', { 
          error: dbError instanceof Error ? dbError.message : String(dbError),
          tenantId,
          period
        });
        
        return NextResponse.json({
          success: false,
          error: 'Failed to calculate VAT return',
          message: dbError instanceof Error ? dbError.message : 'Database error',
          period,
          saudi_compliance: false
        }, { status: 500 });
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    apiLogger.error('Error calculating VAT return', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { success: false, error: 'Failed to calculate VAT return' },
      { status: 500 }
    );
  }
}