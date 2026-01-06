
import { LoginLog, LoginStatus, DeviceType, DashboardStats, DailyStat } from './types';

const USERS = ['admin', 'jdoe', 'asmith', 'mclark', 'bwhite', 'rlee'];
const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge'];
const LOCATIONS = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Berlin, Germany', 'Beijing, China', 'Paris, France'];

export const generateMockLogs = (count: number): LoginLog[] => {
  return Array.from({ length: count }, (_, i) => {
    const status = Math.random() > 0.15 ? LoginStatus.SUCCESS : LoginStatus.FAILED;
    const device = [DeviceType.DESKTOP, DeviceType.MOBILE, DeviceType.TABLET][Math.floor(Math.random() * 3)];
    const date = new Date();
    date.setHours(date.getHours() - Math.floor(Math.random() * 168)); // Last 7 days
    
    return {
      id: `log-${i}`,
      userId: `user-${Math.floor(Math.random() * 20)}`,
      username: USERS[Math.floor(Math.random() * USERS.length)],
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      timestamp: date.toISOString(),
      status,
      device,
      browser: BROWSERS[Math.floor(Math.random() * BROWSERS.length)]
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const calculateStats = (logs: LoginLog[]): DashboardStats => {
  const totalLogins = logs.length;
  const uniqueUsers = new Set(logs.map(l => l.userId)).size;
  const failedCount = logs.filter(l => l.status === LoginStatus.FAILED).length;
  const failedRate = ((failedCount / totalLogins) * 100).toFixed(1) + '%';
  
  // Daily Stats for last 7 days
  const dailyMap = new Map<string, { success: number; failed: number }>();
  logs.forEach(log => {
    const day = log.timestamp.split('T')[0];
    const current = dailyMap.get(day) || { success: 0, failed: 0 };
    if (log.status === LoginStatus.SUCCESS) current.success++;
    else current.failed++;
    dailyMap.set(day, current);
  });

  const dailyStats: DailyStat[] = Array.from(dailyMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  // Device Distribution
  const devices = logs.reduce((acc, log) => {
    acc[log.device] = (acc[log.device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceDistribution = Object.entries(devices).map(([name, value]) => ({ name, value }));

  // Peak Hours
  const hoursMap = new Array(24).fill(0);
  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    hoursMap[hour]++;
  });
  const peakHours = hoursMap.map((count, hour) => ({ hour: `${hour}:00`, count }));

  return {
    totalLogins,
    uniqueUsers,
    failedRate,
    activeSessions: Math.floor(Math.random() * 50) + 10,
    dailyStats,
    deviceDistribution,
    peakHours
  };
};
