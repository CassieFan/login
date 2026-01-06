
export enum LoginStatus {
  SUCCESS = 'Success',
  FAILED = 'Failed',
  PENDING = 'Pending'
}

export enum DeviceType {
  DESKTOP = 'Desktop',
  MOBILE = 'Mobile',
  TABLET = 'Tablet',
  UNKNOWN = 'Unknown'
}

export interface LoginLog {
  id: string;
  userId: string;
  username: string;
  ip: string;
  location: string;
  timestamp: string;
  status: LoginStatus;
  device: DeviceType;
  browser: string;
}

export interface DailyStat {
  date: string;
  success: number;
  failed: number;
}

export interface DashboardStats {
  totalLogins: number;
  uniqueUsers: number;
  failedRate: string;
  activeSessions: number;
  dailyStats: DailyStat[];
  deviceDistribution: { name: string; value: number }[];
  peakHours: { hour: string; count: number }[];
}
