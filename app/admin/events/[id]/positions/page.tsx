'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';

interface Position {
    id: string;
    name: string;
    description: string;
    display_order: number;
}

export default function ManagePositionsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        fetchPositions();
    }, [params.id]);

    const fetchPositions = async () => {
        try {
            const response = await fetch(`/api/events/${params.id}/positions`);
            const data = await response.json();
            if (data.success) {
                setPositions(data.data);
            }
        } catch (error) {
            toast.error('Failed to load positions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch(`/api/events/${params.id}/positions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Position added successfully');
                setFormData({ name: '', description: '' });
                fetchPositions();
            } else {
                toast.error(data.error || 'Failed to add position');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Event
                </Button>
                <h1 className="text-3xl font-bold">Manage Positions</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add New Position Form */}
                <div>
                    <Card>
                        <CardBody>
                            <h2 className="text-xl font-semibold mb-4">Add New Position</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Position Name"
                                    placeholder="e.g. Best Artist"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        rows={3}
                                        placeholder="Description of this category..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    isLoading={submitting}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Position
                                </Button>
                            </form>
                        </CardBody>
                    </Card>
                </div>

                {/* List of Existing Positions */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Existing Positions</h2>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading positions...</div>
                    ) : positions.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">No positions added yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {positions.map((position) => (
                                <div
                                    key={position.id}
                                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-medium">{position.name}</h3>
                                        {position.description && (
                                            <p className="text-sm text-gray-500">{position.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Future: Add delete/edit functionality */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
