import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Users, Calendar, AlertCircle, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const weeklyStats = [
    { name: 'Mon', patients: 24, appointments: 18 },
    { name: 'Tue', patients: 30, appointments: 25 },
    { name: 'Wed', patients: 28, appointments: 22 },
    { name: 'Thu', patients: 32, appointments: 28 },
    { name: 'Fri', patients: 35, appointments: 30 },
    { name: 'Sat', patients: 20, appointments: 15 },
    { name: 'Sun', patients: 12, appointments: 10 },
];

export default function OverviewPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500">Welcome back, Dr. Mugisha. Here's what's happening today.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Month</option>
                    </select>
                    <Button>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Appointment
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Patients"
                    value="1,248"
                    trend="+12%"
                    trendUp={true}
                    icon={Users}
                    iconColor="text-blue-600"
                    bgColor="bg-blue-100"
                />
                <StatsCard
                    title="Appointments Today"
                    value="42"
                    trend="+5%"
                    trendUp={true}
                    icon={Calendar}
                    iconColor="text-emerald-600"
                    bgColor="bg-emerald-100"
                />
                <StatsCard
                    title="Pending Reports"
                    value="15"
                    trend="-2%"
                    trendUp={false}
                    icon={AlertCircle}
                    iconColor="text-orange-600"
                    bgColor="bg-orange-100"
                />
                <StatsCard
                    title="Revenue (Daily)"
                    value="RWF 850k"
                    trend="+8%"
                    trendUp={true}
                    icon={DollarSign}
                    iconColor="text-purple-600"
                    bgColor="bg-purple-100"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f1f5f9' }}
                                    />
                                    <Bar dataKey="patients" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="appointments" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Outpatient Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyStats}>
                                    <defs>
                                        <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="patients" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorPatients)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Appointments Table Stub */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-slate-500">
                        <p>Table component will be integrated here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function StatsCard({ title, value, trend, trendUp, icon: Icon, iconColor, bgColor }: any) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
                        <div className={`flex items-center mt-2 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                            {trendUp ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                            {trend} from last month
                        </div>
                    </div>
                    <div className={`p-3 rounded-xl ${bgColor}`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
