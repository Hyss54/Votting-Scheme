'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Calendar, Users, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        activeEvents: 0,
        totalVotes: 0,
        totalRevenue: 0,
    });

    useEffect(() => {
        async function fetchStats() {
            // Fetch total events
            const { count: eventCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true });

            // Fetch active events
            const { count: activeCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Fetch total votes
            const { count: voteCount } = await supabase
                .from('votes')
                .select('*', { count: 'exact', head: true });

            // Fetch total revenue
            const { data: payments } = await supabase
                .from('payments')
                .select('amount')
                .eq('status', 'success');

            const revenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

            setStats({
                totalEvents: eventCount || 0,
                activeEvents: activeCount || 0,
                totalVotes: voteCount || 0,
                totalRevenue: revenue,
            });
        }

        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Total Events',
            value: stats.totalEvents,
            icon: Calendar,
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Active Events',
            value: stats.activeEvents,
            icon: TrendingUp,
            color: 'from-green-500 to-green-600',
        },
        {
            title: 'Total Votes',
            value: stats.totalVotes,
            icon: Users,
            color: 'from-purple-500 to-purple-600',
        },
        {
            title: 'Total Revenue',
            value: `GH₵ ${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'from-yellow-500 to-yellow-600',
        },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <Card key={index} variant="gradient" className="hover-lift">
                        <CardBody className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl`}>
                                <stat.icon className="text-white" size={32} />
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardBody>
                        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <a
                                href="/admin/events/new"
                                className="block p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                            >
                                <h4 className="font-medium text-primary-900">Create New Event</h4>
                                <p className="text-sm text-primary-700">Set up a new voting event</p>
                            </a>
                            <a
                                href="/admin/nominees"
                                className="block p-4 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors"
                            >
                                <h4 className="font-medium text-accent-900">Add Nominees</h4>
                                <p className="text-sm text-accent-700">Add nominees to positions</p>
                            </a>
                            <a
                                href="/admin/reports"
                                className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                            >
                                <h4 className="font-medium text-green-900">View Reports</h4>
                                <p className="text-sm text-green-700">Check analytics and export data</p>
                            </a>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                        <p className="text-gray-600">Recent voting activity will appear here</p>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
