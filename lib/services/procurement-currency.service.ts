/**
 * Procurement Multi-Currency Service
 * Currency conversion and exchange rate management
 */

import { query } from '@/lib/db/connection';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rateToBase: number; // Rate to base currency (SAR)
  isBase: boolean;
  lastUpdated?: string;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
}

export class ProcurementCurrencyService {
  private baseCurrency = 'SAR';
  private currencies: Map<string, Currency> = new Map();

  constructor() {
    this.initializeCurrencies();
  }

  private initializeCurrencies() {
    // Default currencies
    this.currencies.set('SAR', {
      code: 'SAR',
      name: 'Saudi Riyal',
      symbol: '﷼',
      rateToBase: 1,
      isBase: true,
    });

    this.currencies.set('USD', {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      rateToBase: 3.75, // Example rate
      isBase: false,
    });

    this.currencies.set('EUR', {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      rateToBase: 4.10, // Example rate
      isBase: false,
    });

    this.currencies.set('GBP', {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      rateToBase: 4.75, // Example rate
      isBase: false,
    });
  }

  // ============================================================================
  // CURRENCY MANAGEMENT
  // ============================================================================

  async getCurrencies(): Promise<Currency[]> {
    try {
      const result = await query(`
        SELECT code, name, symbol, rate_to_base, is_base, last_updated
        FROM procurement_currencies
        ORDER BY is_base DESC, code ASC
      `);

      if (result.rows.length > 0) {
        return result.rows.map((row: any) => ({
          code: row.code,
          name: row.name,
          symbol: row.symbol,
          rateToBase: parseFloat(row.rate_to_base),
          isBase: row.is_base,
          lastUpdated: row.last_updated,
        }));
      }

      // Return default currencies if table is empty
      return Array.from(this.currencies.values());
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createCurrenciesTable();
        return Array.from(this.currencies.values());
      }
      return Array.from(this.currencies.values());
    }
  }

  async updateExchangeRates(rates: { currency: string; rate: number }[]): Promise<void> {
    try {
      for (const { currency, rate } of rates) {
        await query(`
          INSERT INTO procurement_currencies (code, rate_to_base, last_updated)
          VALUES ($1, $2, NOW())
          ON CONFLICT (code) DO UPDATE
          SET rate_to_base = $2, last_updated = NOW()
        `, [currency, rate]);
      }
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createCurrenciesTable();
        return this.updateExchangeRates(rates);
      }
      throw error;
    }
  }

  // ============================================================================
  // CURRENCY CONVERSION
  // ============================================================================

  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const currencies = await this.getCurrencies();
    const from = currencies.find(c => c.code === fromCurrency) || this.currencies.get(fromCurrency);
    const to = currencies.find(c => c.code === toCurrency) || this.currencies.get(toCurrency);

    if (!from || !to) {
      throw new Error(`Currency not found: ${fromCurrency} or ${toCurrency}`);
    }

    // Convert to base currency first, then to target
    const baseAmount = amount * from.rateToBase;
    const convertedAmount = baseAmount / to.rateToBase;

    return parseFloat(convertedAmount.toFixed(2));
  }

  async formatCurrency(amount: number, currency: string): Promise<string> {
    const currencies = await this.getCurrencies();
    const curr = currencies.find(c => c.code === currency) || this.currencies.get(currency);

    if (!curr) {
      return `${amount.toFixed(2)} ${currency}`;
    }

    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return formatted;
  }

  // ============================================================================
  // EXCHANGE RATE HISTORY
  // ============================================================================

  async getExchangeRateHistory(
    fromCurrency: string,
    toCurrency: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<ExchangeRate[]> {
    try {
      let whereClause = 'WHERE from_currency = $1 AND to_currency = $2';
      const params: any[] = [fromCurrency, toCurrency];
      let paramIndex = 3;

      if (dateFrom) {
        whereClause += ` AND date >= $${paramIndex++}`;
        params.push(dateFrom);
      }

      if (dateTo) {
        whereClause += ` AND date <= $${paramIndex++}`;
        params.push(dateTo);
      }

      const result = await query(`
        SELECT from_currency, to_currency, rate, date
        FROM procurement_exchange_rates
        ${whereClause}
        ORDER BY date DESC
      `, params);

      return result.rows.map((row: any) => ({
        fromCurrency: row.from_currency,
        toCurrency: row.to_currency,
        rate: parseFloat(row.rate),
        date: row.date,
      }));
    } catch (error: any) {
      if (error.code === '42P01') {
        await this.createExchangeRatesTable();
        return [];
      }
      return [];
    }
  }

  // ============================================================================
  // DATABASE SETUP
  // ============================================================================

  private async createCurrenciesTable(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS procurement_currencies (
        code VARCHAR(10) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        rate_to_base DECIMAL(10, 6) NOT NULL DEFAULT 1,
        is_base BOOLEAN DEFAULT FALSE,
        last_updated TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Insert default currencies
    for (const currency of this.currencies.values()) {
      await query(`
        INSERT INTO procurement_currencies (code, name, symbol, rate_to_base, is_base)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (code) DO NOTHING
      `, [currency.code, currency.name, currency.symbol, currency.rateToBase, currency.isBase]);
    }
  }

  private async createExchangeRatesTable(): Promise<void> {
    await query(`
      CREATE TABLE IF NOT EXISTS procurement_exchange_rates (
        id VARCHAR(255) PRIMARY KEY,
        from_currency VARCHAR(10) NOT NULL,
        to_currency VARCHAR(10) NOT NULL,
        rate DECIMAL(10, 6) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(from_currency, to_currency, date),
        INDEX idx_date (date)
      )
    `);
  }
}

export const procurementCurrencyService = new ProcurementCurrencyService();

