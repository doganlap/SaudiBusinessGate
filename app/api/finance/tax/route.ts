import { NextRequest, NextResponse } from 'next/server';
import { CompleteFinanceService } from '@/lib/services/finance-complete.service';
import { testConnection } from '@/lib/db/connection';
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
    
    // Test database connection first
    const isConnected = await testConnection();
    
    if (isConnected) {
      try {
        const taxRecords = await CompleteFinanceService.getTaxRecords(tenantId, filters);
        
        return NextResponse.json({
          success: true,
          data: taxRecords,
          total: taxRecords.length,
          filters,
          source: 'database',
          saudi_compliance: true
        });
      } catch (dbError) {
        apiLogger.warn('Tax DB query failed, using fallback', { error: dbError instanceof Error ? dbError.message : String(dbError) });
      }
    }
    
    
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
    }
    const fallbackTaxData = [
      {
        id: '1',
        tenant_id: 'default-tenant',
        tax_type: 'vat',
        tax_code: 'VAT_15',
        tax_rate: 0.15,
        description: 'Standard VAT 15% - Saudi Compliance',
        amount: 1500,
        base_amount: 10000,
        transaction_type: 'sale',
        transaction_id: 'INV-001',
        transaction_date: '2024-11-01',
        tax_period: '2024-Q4',
        vat_return_period: '2024-12',
        status: 'posted',
        account_id: '2000', // VAT Output Account
        created_at: '2024-11-01T10:00:00Z',
        updated_at: '2024-11-01T10:00:00Z',
        saudi_compliance: {
          zatca_status: 'compliant',
          invoice_hash: 'a1b2c3d4e5f6',
          qr_code_generated: true,
          electronic_invoice: true
        }
      },
      {
        id: '2',
        tenant_id: 'default-tenant',
        tax_type: 'vat',
        tax_code: 'VAT_INPUT',
        tax_rate: 0.15,
        description: 'Input VAT on purchases',
        amount: -750,
        base_amount: 5000,
        transaction_type: 'purchase',
        transaction_id: 'BILL-001',
        transaction_date: '2024-11-02',
        tax_period: '2024-Q4',
        vat_return_period: '2024-12',
        status: 'posted',
        account_id: '2001', // VAT Input Account
        created_at: '2024-11-02T10:00:00Z',
        updated_at: '2024-11-02T10:00:00Z',
        saudi_compliance: {
          zatca_status: 'compliant',
          supplier_vat_number: '300123456789003',
          invoice_validation: 'passed'
        }
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: fallbackTaxData,
      total: fallbackTaxData.length,
      fallback: true,
      source: 'mock',
      saudi_compliance: true,
      vat_rates: SAUDI_VAT_RATES,
      tax_codes: SAUDI_TAX_CODES
    });
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
        // Try to calculate VAT return for Saudi compliance
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
        apiLogger.warn('VAT return DB calculation failed, using fallback', { error: dbError instanceof Error ? dbError.message : String(dbError) });
        
        
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
        }
        const fallbackVATReturn = {
          period: period,
          output_vat: {
            amount: 1500,
            base_amount: 10000,
            transactions: [
              {
                id: '1',
                tax_code: 'VAT_15',
                amount: 1500,
                base_amount: 10000,
                description: 'Standard VAT 15% on sales'
              }
            ]
          },
          input_vat: {
            amount: 750,
            base_amount: 5000,
            transactions: [
              {
                id: '2',
                tax_code: 'VAT_INPUT',
                amount: 750,
                base_amount: 5000,
                description: 'Input VAT on purchases'
              }
            ]
          },
          net_vat_payable: 750,
          saudi_compliance: {
            zatca_ready: true,
            electronic_invoice_compliant: true,
            qr_code_required: true,
            vat_return_period: period
          }
        };
        
        return NextResponse.json({
          success: true,
          data: fallbackVATReturn,
          period,
          saudi_compliance: true,
          zatca_ready: true,
          source: 'fallback',
          note: 'Using fallback data - tax_records table may not exist'
        });
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