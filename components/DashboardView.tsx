import React, { useMemo } from 'react';
import { HistoryItem, AnalysisMode } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    LayoutDashboard, TrendingUp, Globe, Clock, FileText,
    ShieldAlert, Activity, Map
} from 'lucide-react';
import GeoMap from './GeoMap';

interface DashboardViewProps {
    history: HistoryItem[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6'];

const DashboardView: React.FC<DashboardViewProps> = ({ history }) => {

    // 1. Calculate Key Metrics
    const metrics = useMemo(() => {
        const totalBriefings = history.length;
        const totalReadingTime = history.reduce((acc, item) => acc + item.data.meta.estimated_reading_time_seconds, 0);
        const avgReadingTime = totalBriefings > 0 ? Math.round(totalReadingTime / totalBriefings) : 0;

        const militaryCount = history.filter(item => item.data.military_mode?.is_included).length;
        const militaryPercentage = totalBriefings > 0 ? Math.round((militaryCount / totalBriefings) * 100) : 0;

        return { totalBriefings, avgReadingTime, militaryPercentage };
    }, [history]);

    // 2. Prepare Category Data (Pie Chart)
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        history.forEach(item => {
            const cat = item.data.meta.category || 'Uncategorized';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [history]);

    // 3. Prepare Region/Country Data (Bar Chart) - KEEPING FOR REFERENCE IF NEEDED, BUT REPLACING VISUAL WITH MAP
    const regionData = useMemo(() => {
        const counts: Record<string, number> = {};
        history.forEach(item => {
            const region = item.data.meta.region || 'Unknown';
            counts[region] = (counts[region] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [history]);

    // 4. Prepare Timeline Data (Area Chart)
    const timelineData = useMemo(() => {
        const counts: Record<string, number> = {};
        // Group by date (YYYY-MM-DD)
        history.forEach(item => {
            const date = new Date(item.timestamp).toISOString().split('T')[0];
            counts[date] = (counts[date] || 0) + 1;
        });

        // Sort by date and format
        return Object.entries(counts)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, count]) => ({
                date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                count
            }));
    }, [history]);

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                    <LayoutDashboard size={48} className="text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Dashboard Empty</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                    Generate some intelligence briefings to see analytics and trends here.
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8 max-w-7xl mx-auto pb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Activity size={24} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Intelligence Overview</h1>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Briefings"
                    value={metrics.totalBriefings}
                    icon={<FileText size={20} />}
                    color="blue"
                />
                <MetricCard
                    title="Avg Reading Time"
                    value={`${metrics.avgReadingTime}s`}
                    icon={<Clock size={20} />}
                    color="indigo"
                />
                <MetricCard
                    title="Military Focus"
                    value={`${metrics.militaryPercentage}%`}
                    icon={<ShieldAlert size={20} />}
                    color="amber"
                />
                <MetricCard
                    title="Top Region"
                    value={regionData[0]?.name || 'N/A'}
                    icon={<Globe size={20} />}
                    color="emerald"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Category Distribution */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-slate-400" />
                        Topic Distribution
                    </h3>
                    <div className="h-64 w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                        {categoryData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                {entry.name} ({entry.value})
                            </div>
                        ))}
                    </div>
                </div>

                {/* Geopolitical Focus (MAP) */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Globe size={18} className="text-slate-400" />
                        Global Intelligence Map
                    </h3>
                    <div className="flex-grow min-h-[300px] relative rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                        <GeoMap history={history} />
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-slate-400" />
                        Briefing Activity (Last 30 Days)
                    </h3>
                    <div className="h-64 w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

export default DashboardView;
