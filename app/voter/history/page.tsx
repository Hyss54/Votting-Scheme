'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Loading';
import { VoteWithDetails } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils/helpers';

export default function VoteHistoryPage() {
    const [votes, setVotes] = useState<VoteWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVotes() {
            try {
                // In production, get actual user ID from auth context
                const response = await fetch('/api/votes?voter_id=mock-user-id');
                const data = await response.json();
                if (data.success) {
                    setVotes(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch votes:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchVotes();
    }, []);

    if (loading) return <TableSkeleton />;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Vote History</h1>

            <Card>
                <CardHeader>
                    <h3 className="text-xl font-bold">Your Votes</h3>
                </CardHeader>
                <CardBody>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Event
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Position
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Nominee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {votes.map((vote) => (
                                    <tr key={vote.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {vote.event?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {vote.position?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            {vote.nominee?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatCurrency(vote.payment?.amount || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDateTime(vote.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="success">Confirmed</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {votes.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No votes yet. Start voting now!</p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
