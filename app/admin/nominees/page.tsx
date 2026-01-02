'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Loading';
import { Plus, User, Trash2, Edit } from 'lucide-react';
import { NomineeWithDetails } from '@/types';
import { formatDate } from '@/lib/utils/helpers';

export default function NomineesPage() {
    const [nominees, setNominees] = useState<NomineeWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNominees() {
            try {
                const response = await fetch('/api/nominees');
                const data = await response.json();
                if (data.success) {
                    setNominees(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch nominees:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchNominees();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Nominees</h1>
                <Link href="/admin/nominees/new">
                    <Button variant="primary">
                        <Plus size={20} className="mr-2" />
                        Add Nominee
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nominees.map((nominee) => (
                    <Card key={nominee.id} variant="bordered" className="hover-lift">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{nominee.name}</h3>
                                        <p className="text-sm text-gray-500">{nominee.position?.name || 'Unknown Position'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm">
                                        <Edit size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {nominee.bio || 'No bio available'}
                            </div>
                            <div className="text-xs text-gray-500 pt-4 border-t border-gray-100">
                                Added {formatDate(nominee.created_at)}
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {nominees.length === 0 && (
                <div className="text-center py-12">
                    <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No nominees yet</h3>
                    <p className="text-gray-600 mb-4">Add your first nominee to get started</p>
                    <Link href="/admin/nominees/new">
                        <Button variant="primary">Add Nominee</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
