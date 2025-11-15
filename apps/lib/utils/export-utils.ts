// Export utilities for finance data

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export class ExportService {
  // Export to CSV
  static exportToCSV(data: any[], options: ExportOptions = { format: 'csv' }): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      options.includeHeaders !== false ? headers.join(',') : '',
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].filter(row => row).join('\n');

    this.downloadFile(csvContent, options.filename || 'export.csv', 'text/csv');
  }

  // Export to JSON
  static exportToJSON(data: any[], options: ExportOptions = { format: 'json' }): void {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, options.filename || 'export.json', 'application/json');
  }

  // Export financial reports to CSV
  static exportFinancialReport(reportData: any, reportType: string, options?: Partial<ExportOptions>): void {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
    const filename = options?.filename || `${reportType}-${timestamp}.csv`;

    let exportData: any[] = [];

    switch (reportType) {
      case 'trial_balance':
        exportData = reportData.map((account: any) => ({
          'Account Code': account.account_code,
          'Account Name': account.account_name,
          'Account Type': account.account_type,
          'Debit Balance': account.debit_balance || 0,
          'Credit Balance': account.credit_balance || 0,
          'Balance': account.balance || 0
        }));
        break;

      case 'income_statement':
        // Revenue section
        const revenueData = reportData.revenues?.map((item: any) => ({
          'Category': 'Revenue',
          'Account Code': item.account_code,
          'Account Name': item.account_name,
          'Amount': item.amount
        })) || [];

        // Expense section
        const expenseData = reportData.expenses?.map((item: any) => ({
          'Category': 'Expense',
          'Account Code': item.account_code,
          'Account Name': item.account_name,
          'Amount': item.amount
        })) || [];

        // Summary
        const summaryData = [
          {
            'Category': 'Summary',
            'Account Code': '',
            'Account Name': 'Total Revenue',
            'Amount': reportData.totalRevenue
          },
          {
            'Category': 'Summary',
            'Account Code': '',
            'Account Name': 'Total Expenses',
            'Amount': reportData.totalExpenses
          },
          {
            'Category': 'Summary',
            'Account Code': '',
            'Account Name': 'Net Income',
            'Amount': reportData.netIncome
          }
        ];

        exportData = [...revenueData, ...expenseData, ...summaryData];
        break;

      case 'balance_sheet':
        // Assets
        const assetData = reportData.assets?.map((item: any) => ({
          'Category': 'Assets',
          'Account Code': item.account_code,
          'Account Name': item.account_name,
          'Amount': item.balance
        })) || [];

        // Liabilities
        const liabilityData = reportData.liabilities?.map((item: any) => ({
          'Category': 'Liabilities',
          'Account Code': item.account_code,
          'Account Name': item.account_name,
          'Amount': item.balance
        })) || [];

        // Equity
        const equityData = reportData.equity?.map((item: any) => ({
          'Category': 'Equity',
          'Account Code': item.account_code,
          'Account Name': item.account_name,
          'Amount': item.balance
        })) || [];

        exportData = [...assetData, ...liabilityData, ...equityData];
        break;

      default:
        exportData = Array.isArray(reportData) ? reportData : [reportData];
        break;
    }

    this.exportToCSV(exportData, { 
      format: 'csv', 
      filename,
      includeHeaders: true,
      ...options 
    });
  }

  // Export journal entries
  static exportJournalEntries(entries: any[], options?: Partial<ExportOptions>): void {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
    const filename = options?.filename || `journal-entries-${timestamp}.csv`;

    const exportData: any[] = [];

    entries.forEach(entry => {
      if (entry.lines && entry.lines.length > 0) {
        entry.lines.forEach((line: any) => {
          exportData.push({
            'Entry Number': entry.entry_number,
            'Entry Date': entry.entry_date,
            'Entry Description': entry.description,
            'Line Number': line.line_number,
            'Account Code': line.account_code || '',
            'Account Name': line.account_name || '',
            'Line Description': line.description || '',
            'Debit Amount': line.debit_amount || 0,
            'Credit Amount': line.credit_amount || 0,
            'Reference': line.reference || '',
            'Status': entry.status
          });
        });
      } else {
        exportData.push({
          'Entry Number': entry.entry_number,
          'Entry Date': entry.entry_date,
          'Entry Description': entry.description,
          'Line Number': '',
          'Account Code': '',
          'Account Name': '',
          'Line Description': '',
          'Debit Amount': entry.total_debit || 0,
          'Credit Amount': entry.total_credit || 0,
          'Reference': entry.reference || '',
          'Status': entry.status
        });
      }
    });

    this.exportToCSV(exportData, { 
      format: 'csv', 
      filename,
      includeHeaders: true,
      ...options 
    });
  }

  // Export invoices
  static exportInvoices(invoices: any[], options?: Partial<ExportOptions>): void {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
    const filename = options?.filename || `invoices-${timestamp}.csv`;

    const exportData = invoices.map(invoice => ({
      'Invoice Number': invoice.invoice_number,
      'Customer Name': invoice.customer_name,
      'Customer Email': invoice.customer_email || '',
      'Invoice Date': invoice.invoice_date,
      'Due Date': invoice.due_date,
      'Subtotal': invoice.subtotal,
      'Tax Amount': invoice.tax_amount,
      'Discount Amount': invoice.discount_amount || 0,
      'Total Amount': invoice.total_amount,
      'Paid Amount': invoice.paid_amount || 0,
      'Balance Due': invoice.balance_due,
      'Status': invoice.status,
      'Payment Terms': invoice.payment_terms || '',
      'Notes': invoice.notes || ''
    }));

    this.exportToCSV(exportData, { 
      format: 'csv', 
      filename,
      includeHeaders: true,
      ...options 
    });
  }

  // Export budgets
  static exportBudgets(budgets: any[], options?: Partial<ExportOptions>): void {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
    const filename = options?.filename || `budgets-${timestamp}.csv`;

    const exportData = budgets.map(budget => ({
      'Budget Name': budget.name,
      'Category': budget.category,
      'Period': budget.period,
      'Start Date': budget.startDate,
      'End Date': budget.endDate,
      'Budgeted Amount': budget.budgetedAmount || 0,
      'Actual Amount': budget.actualAmount || 0,
      'Variance': budget.variance || 0,
      'Variance %': budget.variancePercent || 0,
      'Status': budget.status
    }));

    this.exportToCSV(exportData, { 
      format: 'csv', 
      filename,
      includeHeaders: true,
      ...options 
    });
  }

  // Export AI agent data
  static exportAIAgents(agents: any[], options?: Partial<ExportOptions>): void {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
    const filename = options?.filename || `ai-agents-${timestamp}.csv`;

    const exportData = agents.map(agent => ({
      'Agent Code': agent.agent_code,
      'Agent Name': agent.agent_name,
      'Agent Title (EN)': agent.agent_title_en,
      'Agent Title (AR)': agent.agent_title_ar,
      'Agent Type': agent.agent_type,
      'Status': agent.agent_status,
      'Authority Level': agent.decision_authority_level,
      'Tasks Completed': agent.tasks_completed,
      'Success Rate %': agent.success_rate,
      'Avg Processing Time (s)': agent.average_processing_time,
      'Current Tasks': agent.current_tasks || 0,
      'Primary Functions': agent.primary_functions?.join('; ') || '',
      'LLM Model': agent.llm_model,
      'Automation Level': agent.automation_level
    }));

    this.exportToCSV(exportData, { 
      format: 'csv', 
      filename,
      includeHeaders: true,
      ...options 
    });
  }

  // Generic export for any data
  static exportData(data: any[], type: string, options?: Partial<ExportOptions>): void {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
    const filename = options?.filename || `${type}-${timestamp}.csv`;

    this.exportToCSV(data, { 
      format: 'csv', 
      filename,
      includeHeaders: true,
      ...options 
    });
  }

  // Private method to handle file download
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    window.URL.revokeObjectURL(url);
  }

  // Utility to format data for export
  static formatForExport(data: any): string {
    if (data === null || data === undefined) return '';
    if (typeof data === 'number') return data.toString();
    if (typeof data === 'boolean') return data ? 'Yes' : 'No';
    if (data instanceof Date) return data.toISOString().split('T')[0];
    return String(data);
  }
}
