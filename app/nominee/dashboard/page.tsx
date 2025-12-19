'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { TrendingUp, Trophy, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function NomineeDashboard() {
    const [stats, setStats] = useState({
        totalVotes: 0,
        position: 'N/A',
        ranking: 0,
    });

    useEffect(() => {
        async function fetchStats() {
            // In production, get nominee ID from auth context
            const nomineeId = 'mock-nominee-id';

            const { count } = await supabase
                .from('votes')
                .select('*', { count: 'exact', head: true })
                .eq('nominee_id', nomineeId);

            setStats({
                totalVotes: count || 0,
                position: 'Best Artist',
                ranking: 3,
            });
        }

        fetchStats();
    }, []);

    return (
        <div className="min-h-screen gradient-bg p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Your Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card variant="gradient" className="text-center">
                        <CardBody>
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="text-white" size={32} />
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Total Votes</p>
                            <p className="text-4xl font-bold text-gray-900">{stats.totalVotes}</p>
                        </CardBody>
                    </Card>

                    <Card variant="gradient" className="text-center">
                        <CardBody>
                            <div className="bg-gradient-to-br from-accent-500 to-accent-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trophy className="text-white" size={32} />
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Position</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.position}</p>
                        </CardBody>
                    </Card>

                    <Card variant="gradient" className="text-center">
                        <CardBody>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="text-white" size={32} />
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Current Rank</p>
                            <p className="text-4xl font-bold text-gray-900">#{stats.ranking}</p>
                        </CardBody>
                    </Card>
                </div>

                <Card>
                    <CardBody>
                        <h3 className="text-2xl font-bold mb-4">Vote Trends</h3>
                        <p className="text-gray-600">
                            Your vote count is updated in real-time as people vote for you.
                            Keep sharing your profile to get more votes!
                        </p>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
