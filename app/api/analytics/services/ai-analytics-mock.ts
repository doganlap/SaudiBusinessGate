/**
 * Mock AI Analytics Engine for Next.js API routes
 * Simplified version for production build compatibility
 */

export class AIAnalyticsEngineMock {
  async getSalesForecast(organizationId: number, periods: number = 6) {
    // Mock sales forecast data
    const forecast = [];
    let baseRevenue = 50000;
    
    for (let i = 1; i <= periods; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      const predicted = baseRevenue * (1 + Math.random() * 0.2); // 0-20% growth
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted: Math.round(predicted),
        lower: Math.round(predicted * 0.8),
        upper: Math.round(predicted * 1.2)
      });
      baseRevenue = predicted;
    }
    
    return {
      forecast,
      churnPredictions: [
        { customerId: 1, churnProbability: 0.15, risk: 'low' },
        { customerId: 2, churnProbability: 0.65, risk: 'high' },
        { customerId: 3, churnProbability: 0.35, risk: 'medium' }
      ]
    };
  }
}

export const aiAnalyticsEngine = new AIAnalyticsEngineMock();