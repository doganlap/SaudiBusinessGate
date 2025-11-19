# 📊 Database Stats & App Connections Monitoring System

## Overview

This comprehensive monitoring system provides real-time insights into your DoganHubStore application's database performance and connection health. The system includes database statistics, application connections monitoring, and a beautiful dashboard interface.

## 🚀 Features

### Database Statistics

- **Connection Pool Monitoring**: Track active, idle, and waiting connections
- **Table Statistics**: Monitor table sizes, row counts, and maintenance status
- **Performance Metrics**: Cache hit ratios, index usage, and slow query analysis
- **System Information**: Database size, uptime, version, and configuration

### Application Connections

- **Database Connectivity**: Real-time connection status and response times
- **Redis Monitoring**: Memory usage and client connections
- **External Services**: Health checks for Stripe, OpenAI, and other APIs
- **WebSocket Status**: Active connections and server status
- **Internal Services**: License, billing, and analytics service health

### Dashboard Features

- **Real-time Updates**: Auto-refresh every 30 seconds
- **Interactive Tabs**: Organized view of different monitoring aspects
- **Health Indicators**: Color-coded status badges and progress bars
- **Performance Insights**: Visual representation of key metrics

## 📁 File Structure

```
lib/services/
├── database-stats.service.ts     # Database statistics service
└── app-connections.service.ts    # Application connections service

app/api/monitoring/
├── database-stats/route.ts       # Database stats API endpoint
├── app-connections/route.ts      # App connections API endpoint
└── ../health/route.ts           # Health check endpoint

components/
└── SystemMonitoringDashboard.tsx # Main dashboard component

app/monitoring/
└── page.tsx                     # Monitoring page

scripts/
└── test-monitoring.cjs          # Test script for monitoring functionality
```

## 🛠️ Installation & Setup

### 1. Dependencies

The monitoring system uses the following packages (already included):

```bash
npm install pg ioredis ws
```

### 2. Environment Variables

Ensure these variables are set in your `.env.local`:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/doganhubstore
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=doganhubstore
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# WebSocket (optional)
WS_PORT=3001

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3050
```

### 3. Database Setup

Ensure your PostgreSQL database is running and accessible. The monitoring system will work with any PostgreSQL database and automatically handles connection errors gracefully.

## 🚀 Usage

### 1. Start the Application

```bash
npm run dev
```

### 2. Access the Monitoring Dashboard

Navigate to: `http://localhost:3050/monitoring`

### 3. API Endpoints

#### Health Check

```bash
GET /api/health
```

Returns overall system health status.

#### Database Statistics

```bash
GET /api/monitoring/database-stats
POST /api/monitoring/database-stats
```

- GET: Retrieve comprehensive database statistics
- POST: Perform specific actions (test-connection, get-activity, get-locks)

#### App Connections Report

```bash
GET /api/monitoring/app-connections
POST /api/monitoring/app-connections
```

- GET: Retrieve application connections report
- POST: Refresh connections or test specific services

### 4. Testing

Run the test script to verify functionality:

```bash
node scripts/test-monitoring.cjs
```

## 📊 Dashboard Sections

### 1. Database Stats Tab

- **Connection Statistics**: Active/idle connections, pool size, waiting clients
- **Table Statistics**: Top tables by size with row counts and storage usage
- **System Information**: Database size, uptime, version

### 2. App Connections Tab

- **Core Services**: Database, Redis, WebSocket status
- **External Services**: Stripe API, OpenAI API, Auth provider health
- **Internal Services**: License, billing, analytics service status

### 3. Performance Tab

- **Cache Hit Ratio**: Database cache performance (target: >95%)
- **Index Usage**: Query optimization metrics (target: >90%)
- **Slow Queries**: Queries with highest execution times
- **API Performance**: Endpoint response times and error rates

## 🔧 Configuration

### Customizing Monitoring Intervals

Edit the dashboard component to change refresh intervals:

```typescript
// In SystemMonitoringDashboard.tsx
const interval = setInterval(fetchData, 30000); // 30 seconds
```

### Adding New Services

To monitor additional services, edit `app-connections.service.ts`:

```typescript
const externalServices = [
  { name: 'Your Service', url: 'https://api.yourservice.com' },
  // Add more services here
];
```

### Custom Health Checks

Add custom health check logic in the services:

```typescript
// In app-connections.service.ts
private async checkCustomService(): Promise<ServiceStatus> {
  // Your custom health check logic
}
```

## 📈 Monitoring Best Practices

### Database Performance

- **Cache Hit Ratio**: Should be >95%
- **Index Usage**: Should be >90%
- **Connection Pool**: Monitor for connection leaks
- **Slow Queries**: Investigate queries >100ms

### Application Health

- **Response Times**: API endpoints should respond <500ms
- **Error Rates**: Should be <1%
- **External Dependencies**: Monitor third-party service availability
- **Resource Usage**: Monitor memory and CPU usage

### Alerting (Future Enhancement)

Consider implementing alerts for:

- Database connection failures
- High response times (>1000ms)
- Low cache hit ratios (<90%)
- External service outages
- High error rates (>5%)

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors

```
Error: Failed to connect to database
```

**Solution**: Check database credentials and ensure PostgreSQL is running.

#### Redis Connection Errors

```
Error: Redis connection failed
```

**Solution**: Install and start Redis, or disable Redis monitoring if not needed.

#### API Endpoint Errors

```
Error: Failed to fetch monitoring data
```

**Solution**: Ensure the Next.js server is running and endpoints are accessible.

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

### Performance Issues

If monitoring causes performance issues:

1. Increase refresh intervals
2. Reduce the number of monitored services
3. Implement caching for expensive queries

## 🔒 Security Considerations

- **API Access**: Consider implementing authentication for monitoring endpoints
- **Sensitive Data**: Avoid logging sensitive information in monitoring data
- **Rate Limiting**: Implement rate limiting for monitoring endpoints
- **CORS**: Configure CORS appropriately for production environments

## 🚀 Production Deployment

### Environment-Specific Configuration

```env
# Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Monitoring intervals (longer for production)
MONITORING_REFRESH_INTERVAL=60000  # 1 minute
```

### Performance Optimization

- Enable caching for monitoring data
- Use connection pooling for database queries
- Implement monitoring data retention policies
- Consider using a dedicated monitoring database

## 📚 API Reference

### Database Stats Service Methods

```typescript
// Get comprehensive database statistics
getDatabaseStats(): Promise<DatabaseStats>

// Test database connection
testDatabaseConnection(): Promise<ConnectionTest>

// Get real-time connection activity
getConnectionActivity(): Promise<Activity[]>

// Get database locks information
getDatabaseLocks(): Promise<Lock[]>
```

### App Connections Service Methods

```typescript
// Get comprehensive connections report
getConnectionsReport(): Promise<AppConnectionsReport>

// Check specific service health
checkServiceHealth(service: string): Promise<ServiceStatus>
```

## 🎯 Future Enhancements

- **Historical Data**: Store monitoring data for trend analysis
- **Alerting System**: Email/SMS notifications for critical issues
- **Custom Dashboards**: User-configurable monitoring views
- **Export Functionality**: Export monitoring data to CSV/PDF
- **Mobile App**: Mobile monitoring dashboard
- **Integration**: Slack/Teams notifications
- **Advanced Analytics**: Machine learning for anomaly detection

## 📞 Support

For issues or questions about the monitoring system:

1. Check the troubleshooting section above
2. Run the test script: `node scripts/test-monitoring.cjs`
3. Check application logs for detailed error messages
4. Verify all dependencies are installed and services are running

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Compatibility**: Next.js 14+, PostgreSQL 12+, Node.js 18+
