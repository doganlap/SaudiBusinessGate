'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Activity, 
  Server, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Clock,
  Users,
  HardDrive,
  Zap
} from 'lucide-react';

interface DatabaseStats {
  connectionStats: {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    maxConnections: number;
    poolSize: number;
    waitingClients: number;
  };
  tableStats: Array<{
    tableName: string;
    schemaName: string;
    rowCount: number;
    tableSize: string;
    indexSize: string;
    totalSize: string;
  }>;
  performanceStats: {
    cacheHitRatio: number;
    indexUsage: number;
    slowQueries: Array<{
      query: string;
      avgTime: number;
      calls: number;
    }>;
  };
  systemStats: {
    databaseSize: string;
    uptime: string;
    version: string;
    currentTimestamp: string;
  };
  timestamp: string;
}

interface AppConnectionsReport {
  database: {
    isConnected: boolean;
    responseTime: number;
    poolStats: {
      total: number;
      active: number;
      idle: number;
      waiting: number;
    };
    error?: string;
  };
  redis: {
    isConnected: boolean;
    responseTime: number;
    memoryUsage?: string;
    connectedClients?: number;
    error?: string;
  };
  external: Array<{
    name: string;
    url: string;
    isConnected: boolean;
    responseTime: number;
    status: 'healthy' | 'degraded' | 'down';
    error?: string;
  }>;
  websocket: {
    isRunning: boolean;
    activeConnections: number;
    port: number;
    error?: string;
  };
  api: {
    isHealthy: boolean;
    responseTime: number;
    endpoints: Array<{
      path: string;
      method: string;
      isHealthy: boolean;
      responseTime: number;
      errorRate: number;
    }>;
  };
  services: Array<{
    name: string;
    type: 'internal' | 'external';
    isHealthy: boolean;
    responseTime: number;
    dependencies: string[];
    error?: string;
  }>;
  overallHealth: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
}

export default function SystemMonitoringDashboard() {
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [connectionsReport, setConnectionsReport] = useState<AppConnectionsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dbResponse, connectionsResponse] = await Promise.all([
        fetch('/api/monitoring/database-stats'),
        fetch('/api/monitoring/app-connections')
      ]);

      if (!dbResponse.ok || !connectionsResponse.ok) {
        throw new Error('Failed to fetch monitoring data');
      }

      const [dbData, connectionsData] = await Promise.all([
        dbResponse.json(),
        connectionsResponse.json()
      ]);

      setDatabaseStats(dbData);
      setConnectionsReport(connectionsData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getHealthBadge = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Healthy
        </Badge>
      ) : (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Down
        </Badge>
      );
    }

    switch (status) {
      case 'healthy':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Healthy
          </Badge>
        );
      case 'degraded':
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Degraded
          </Badge>
        );
      case 'critical':
      case 'down':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Critical
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Unknown
          </Badge>
        );
    }
  };

  if (loading && !databaseStats && !connectionsReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading system monitoring data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Monitoring Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of database stats and application connections
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health Status */}
      {connectionsReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Overall System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {getHealthBadge(connectionsReport.overallHealth)}
              <span className="text-sm text-muted-foreground">
                System status as of {new Date(connectionsReport.timestamp).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">
            <Database className="w-4 h-4 mr-2" />
            Database Stats
          </TabsTrigger>
          <TabsTrigger value="connections">
            <Wifi className="w-4 h-4 mr-2" />
            App Connections
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Database Stats Tab */}
        <TabsContent value="database" className="space-y-4">
          {databaseStats && (
            <>
              {/* Connection Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {databaseStats.connectionStats.activeConnections}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {databaseStats.connectionStats.maxConnections} max
                    </p>
                    <Progress 
                      value={(databaseStats.connectionStats.activeConnections / databaseStats.connectionStats.maxConnections) * 100} 
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pool Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {databaseStats.connectionStats.poolSize}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {databaseStats.connectionStats.waitingClients} waiting
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Database Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {databaseStats.systemStats.databaseSize}
                    </div>
                    <p className="text-xs text-muted-foreground">Total size</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {databaseStats.systemStats.uptime}
                    </div>
                    <p className="text-xs text-muted-foreground">Database uptime</p>
                  </CardContent>
                </Card>
              </div>

              {/* Table Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Table Statistics</CardTitle>
                  <CardDescription>Top tables by size</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {databaseStats.tableStats.slice(0, 10).map((table, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{table.tableName}</div>
                          <div className="text-sm text-muted-foreground">
                            {table.rowCount.toLocaleString()} rows
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{table.totalSize}</div>
                          <div className="text-sm text-muted-foreground">
                            Table: {table.tableSize} | Index: {table.indexSize}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* App Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          {connectionsReport && (
            <>
              {/* Core Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Database className="w-4 h-4 mr-2" />
                        Database
                      </span>
                      {getHealthBadge(connectionsReport.database.isConnected)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{connectionsReport.database.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pool Active:</span>
                        <span>{connectionsReport.database.poolStats.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pool Idle:</span>
                        <span>{connectionsReport.database.poolStats.idle}</span>
                      </div>
                      {connectionsReport.database.error && (
                        <div className="text-red-600 text-sm mt-2">
                          {connectionsReport.database.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Server className="w-4 h-4 mr-2" />
                        Redis
                      </span>
                      {getHealthBadge(connectionsReport.redis.isConnected)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{connectionsReport.redis.responseTime}ms</span>
                      </div>
                      {connectionsReport.redis.memoryUsage && (
                        <div className="flex justify-between">
                          <span>Memory Usage:</span>
                          <span>{connectionsReport.redis.memoryUsage}</span>
                        </div>
                      )}
                      {connectionsReport.redis.connectedClients && (
                        <div className="flex justify-between">
                          <span>Clients:</span>
                          <span>{connectionsReport.redis.connectedClients}</span>
                        </div>
                      )}
                      {connectionsReport.redis.error && (
                        <div className="text-red-600 text-sm mt-2">
                          {connectionsReport.redis.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Wifi className="w-4 h-4 mr-2" />
                        WebSocket
                      </span>
                      {getHealthBadge(connectionsReport.websocket.isRunning)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Port:</span>
                        <span>{connectionsReport.websocket.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Connections:</span>
                        <span>{connectionsReport.websocket.activeConnections}</span>
                      </div>
                      {connectionsReport.websocket.error && (
                        <div className="text-red-600 text-sm mt-2">
                          {connectionsReport.websocket.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* External Services */}
              <Card>
                <CardHeader>
                  <CardTitle>External Services</CardTitle>
                  <CardDescription>Status of external API connections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {connectionsReport.external.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">{service.url}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm">{service.responseTime}ms</span>
                          {getHealthBadge(service.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Internal Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Internal Services</CardTitle>
                  <CardDescription>Status of internal application services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {connectionsReport.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Dependencies: {service.dependencies.join(', ')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm">{service.responseTime}ms</span>
                          {getHealthBadge(service.isHealthy)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {databaseStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cache Hit Ratio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {databaseStats.performanceStats.cacheHitRatio.toFixed(1)}%
                    </div>
                    <Progress value={databaseStats.performanceStats.cacheHitRatio} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Higher is better (target: &gt;95%)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Index Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {databaseStats.performanceStats.indexUsage.toFixed(1)}%
                    </div>
                    <Progress value={databaseStats.performanceStats.indexUsage} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Higher is better (target: &gt;90%)
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Slow Queries */}
              {databaseStats.performanceStats.slowQueries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Slow Queries</CardTitle>
                    <CardDescription>Queries with highest average execution time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {databaseStats.performanceStats.slowQueries.map((query, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-mono bg-gray-100 p-2 rounded flex-1 mr-4">
                              {query.query}
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{query.avgTime.toFixed(2)}ms</div>
                              <div className="text-sm text-muted-foreground">
                                {query.calls} calls
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {connectionsReport && (
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints Performance</CardTitle>
                <CardDescription>Response times for critical API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {connectionsReport.api.endpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{endpoint.method} {endpoint.path}</div>
                        <div className="text-sm text-muted-foreground">
                          Error rate: {endpoint.errorRate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm">{endpoint.responseTime}ms</span>
                        {getHealthBadge(endpoint.isHealthy)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}