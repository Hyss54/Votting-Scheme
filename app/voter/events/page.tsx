'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Loading';
import { Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { Event } from '@/types';
import { formatDate, formatCurrency, getEventStatus } from '@/lib/utils/helpers';

export default function VoterEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await fetch('/api/events?status=active');
                const data = await response.json();
                if (data.success) {
                    setEvents(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Active Events</h1>
                <p className="text-gray-600">Browse and vote in ongoing events</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => {
                    const status = getEventStatus(event.start_date, event.end_date, event.status);
                    return (
                        <Card key={event.id} variant="gradient" className="hover-lift">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold">{event.name}</h3>
                                    <Badge variant={status === 'active' ? 'success' : 'info'}>
                                        {status.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>Ends {formatDate(event.end_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={16} />
                                        <span>{formatCurrency(event.vote_price)} per vote</span>
                                    </div>
                                </div>
                            </CardBody>
                            <CardFooter>
                                <Link href={`/voter/events/${event.id}`} className="w-full">
                                    <Button variant="primary" className="w-full">
                                        Vote Now
                                        <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {events.length === 0 && (
                <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active events</h3>
                    <p className="text-gray-600">Check back later for new voting events</p>
                </div>
            )}
        </div>
    );
}
