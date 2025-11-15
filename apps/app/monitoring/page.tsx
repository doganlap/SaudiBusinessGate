import SystemMonitoringDashboard from '@/components/SystemMonitoringDashboard';

export default function MonitoringPage() {
  return (
    <div className="container mx-auto py-6">
      <SystemMonitoringDashboard />
    </div>
  );
}

export const metadata = {
  title: 'System Monitoring - DoganHubStore',
  description: 'Real-time monitoring of database statistics and application connections',
};