'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils/helpers';

export default function ReportsPage() {
    const [reports, setReports] = useState<any>({
        totalVotes: 0,
        totalRevenue: 0,
        topNominees: [],
    });

    useEffect(() => {
        async function fetchReports() {
            // Fetch total votes
            const { count: voteCount } = await supabase
                .from('votes')
                .select('*', { count: 'exact', head: true });

            // Fetch payments
            const { data: payments } = await supabase
                .from('payments')
                .select('amount')
                .eq('status', 'success');

            const revenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

            // Fetch top nominees
            const { data: nominees } = await supabase
                .from('nominees')
                .select('id, name');

            const nomineesWithVotes = await Promise.all(
                (nominees || []).map(async (nominee) => {
                    const { count } = await supabase
                        .from('votes')
                        .select('*', { count: 'exact', head: true })
                        .eq('nominee_id', nominee.id);

                    return { ...nominee, votes: count || 0 };
                })
            );

            const topNominees = nomineesWithVotes
                .sort((a, b) => b.votes - a.votes)
                .slice(0, 10);

            setReports({
                totalVotes: voteCount || 0,
                totalRevenue: revenue,
                topNominees,
            });
        }

        fetchReports();
    }, []);

    const exportToCSV = () => {
        const csvContent = [
            ['Rank', 'Nominee', 'Votes'],
            ...reports.topNominees.map((n: any, i: number) => [
                i + 1,
                n.name,
                n.votes,
            ]),
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voting-report-${new Date().toISOString()}.csv`;
        a.click();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <Button variant="primary" onClick={exportToCSV}>
                    <Download size={20} className="mr-2" />
                    Export CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card variant="gradient">
                    <CardBody>
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Total Votes</h3>
                        <p className="text-4xl font-bold text-gray-900">{reports.totalVotes}</p>
                    </CardBody>
                </Card>
                <Card variant="gradient">
                    <CardBody>
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Total Revenue</h3>
                        <p className="text-4xl font-bold text-gray-900">
                            {formatCurrency(reports.totalRevenue)}
                        </p>
                    </CardBody>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="text-xl font-bold">Top 10 Nominees</h3>
                </CardHeader>
                <CardBody>
                    <div className="space-y-3">
                        {reports.topNominees.map((nominee: any, index: number) => (
                            <div
                                key={nominee.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold text-gray-400">
                                        #{index + 1}
                                    </span>
                                    <span className="font-medium">{nominee.name}</span>
                                </div>
                                <span className="text-lgFont-bold text-primary-600">
                                    {nominee.votes} votes
                                </span>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
