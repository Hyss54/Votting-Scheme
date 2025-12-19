'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Loading';
import { Plus, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Event } from '@/types';
import { formatDate, getEventStatus } from '@/lib/utils/helpers';

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await fetch('/api/events');
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

    const getStatusBadge = (event: Event) => {
        const status = getEventStatus(event.start_date, event.end_date, event.status);
        const variants: Record<string, any> = {
            active: 'success',
            paused: 'warning',
            ended: 'neutral',
            upcoming: 'info',
        };
        return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
    };

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
                <h1 className="text-3xl font-bold">Events</h1>
                <Link href="/admin/events/new">
                    <Button variant="primary">
                        <Plus size={20} className="mr-2" />
                        Create Event
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {events.map((event) => (
                    <Card key={event.id} variant="bordered" className="hover-lift">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                                    {getStatusBadge(event)}
                                </div>
                                <div className="flex gap-2">
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
                            <p className="text-gray-600 mb-4">{event.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar size={16} />
                                    <span>
                                        {formatDate(event.start_date)} - {formatDate(event.end_date)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <DollarSign size={16} />
                                    <span>GH₵ {event.vote_price} per vote</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {events.length === 0 && (
                <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                    <p className="text-gray-600 mb-4">Create your first voting event to get started</p>
                    <Link href="/admin/events/new">
                        <Button variant="primary">Create Event</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
