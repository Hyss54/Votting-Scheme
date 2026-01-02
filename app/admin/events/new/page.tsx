'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function NewEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Separate state for date and time components
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        vote_price: '',
        status: 'draft' as const,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Combine date and time
        const start_date = `${formData.startDate}T${formData.startTime}`;
        const end_date = `${formData.endDate}T${formData.endTime}`;

        // Basic validation
        if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
            toast.error('Please select both date and time for start and end fields');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                    vote_price: parseFloat(formData.vote_price),
                    start_date,
                    end_date,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Event created successfully!');
                router.push('/admin/events');
            } else {
                toast.error(data.error || 'Failed to create event');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Create New Event</h1>

            <Card>
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Event Name"
                            placeholder="Annual Excellence Awards 2024"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                rows={4}
                                placeholder="Describe your event..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <Input
                            label="Vote Price (GHS)"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="5.00"
                            value={formData.vote_price}
                            onChange={(e) => setFormData({ ...formData, vote_price: e.target.value })}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-700">Start Schedule</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        label="Date"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Time"
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium text-gray-700">End Schedule</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        label="Date"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Time"
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" variant="primary" isLoading={loading}>
                                Create Event
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
