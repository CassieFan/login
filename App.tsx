
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { LoginLog, DashboardStats } from './types';
import { generateMockLogs, calculateStats } from './mockData';
import { getAIInsights } from './services/geminiService';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const PAGE_SIZE = 10;

const App: React.FC = () => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const initializeData = useCallback(() => {
    const mockLogs = generateMockLogs(200);
    setLogs(mockLogs);
    setStats(calculateStats(mockLogs));
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const handleGenerateInsights = async () => {
    setIsAnalyzing(true);
    const result = await getAIInsights(logs);
    setInsights(result || "No insights found.");
    setIsAnalyzing(false);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.username.toLowerCase().includes(filter.toLowerCase()) ||
      log.location.toLowerCase().includes(filter.toLowerCase()) ||
      log.ip.includes(filter)
    );
  }, [logs, filter]);

  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);

  if (!stats) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="w-full lg:w-64 bg-slate-900 text-white p-6 space-y-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-shield-alt text-xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sentinel</h1>
        </div>
        
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3 p-3 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-600/30">
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
            <i className="fas fa-users"></i>
            <span>Users</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
            <i className="fas fa-lock"></i>
            <span>Security</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </a>
        </nav>

        <div className="pt-10">
          <button 
            onClick={handleGenerateInsights}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 p-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-magic"></i>}
            {isAnalyzing ? 'Analyzing...' : 'AI Insights'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto max-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Login Statistics</h2>
            <p className="text-slate-500">Real-time overview of your application's authentication health.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={initializeData}
              className="p-2.5 px-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all"
            >
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Search logs..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Logins" value={stats.totalLogins.toLocaleString()} icon="fa-sign-in-alt" color="bg-blue-500" />
          <StatCard title="Unique Users" value={stats.uniqueUsers.toLocaleString()} icon="fa-user-check" color="bg-emerald-500" />
          <StatCard title="Active Sessions" value={stats.activeSessions.toLocaleString()} icon="fa-clock" color="bg-amber-500" />
          <StatCard title="Failure Rate" value={stats.failedRate} icon="fa-exclamation-triangle" color="bg-rose-500" />
        </section>

        {/* AI Insights Panel */}
        {insights && (
          <section className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <i className="fas fa-brain text-8xl text-indigo-600"></i>
            </div>
            <div className="flex items-center gap-3 mb-4 text-indigo-600">
              <i className="fas fa-sparkles"></i>
              <h3 className="font-bold text-lg">AI Generated Behavior Analysis</h3>
            </div>
            <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap">
              {insights}
            </div>
          </section>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-6">Login Trends (7 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyStats}>
                  <defs>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="success" stroke="#6366f1" fillOpacity={1} fill="url(#colorSuccess)" strokeWidth={3} />
                  <Area type="monotone" dataKey="failed" stroke="#ef4444" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-6">Device Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.deviceDistribution} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {stats.deviceDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="xl:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-6">Login Frequency by Hour</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Logs Table with Pagination */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Activities</h3>
            <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
              Total {filteredLogs.length} entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Device/Browser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                          {log.username[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 truncate max-w-[120px] md:max-w-none">{log.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        log.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{log.location}</td>
                    <td className="px-6 py-4 font-mono text-slate-500 text-sm">{log.ip}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <i className={`fas fa-${log.device === 'Mobile' ? 'mobile-alt' : log.device === 'Tablet' ? 'tablet-alt' : 'desktop'} text-xs opacity-60`}></i>
                        <span className="text-sm">{log.browser}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length > 0 ? (
            <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + PAGE_SIZE, filteredLogs.length)}</span> of <span className="font-medium text-slate-900">{filteredLogs.length}</span> entries
              </div>
              <div className="flex items-center gap-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>
                
                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Only show 5 pages around the current page if there are many pages
                    if (totalPages > 7 && (page > 1 && page < totalPages && Math.abs(page - currentPage) > 2)) {
                      if (page === 2 || page === totalPages - 1) return <span key={page} className="px-2 text-slate-400">...</span>;
                      return null;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] h-10 rounded-lg border text-sm font-medium transition-all ${
                          currentPage === page 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Simple mobile indicator */}
                <div className="sm:hidden text-sm font-medium px-4">
                  {currentPage} / {totalPages}
                </div>

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <i className="fas fa-search-minus text-4xl text-slate-300 mb-4 block"></i>
              <p className="text-slate-500">No matching logs found.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
      </div>
      <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-current/20`}>
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
        <i className="fas fa-arrow-up"></i>
        12.5%
      </span>
      <span className="text-slate-400 text-xs">vs last week</span>
    </div>
  </div>
);

export default App;
