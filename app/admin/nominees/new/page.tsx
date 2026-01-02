'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { ChevronLeft, Upload } from 'lucide-react';
import { Event, Position } from '@/types';
import { supabase } from '@/lib/supabase/client';

export default function NewNomineePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        event_id: '',
        position_id: '',
        image_url: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Fetch active events on component mount
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
                toast.error('Failed to load events');
            }
        }
        fetchEvents();
    }, []);

    // Fetch positions when an event is selected
    useEffect(() => {
        if (!formData.event_id) {
            setPositions([]);
            return;
        }

        async function fetchPositions() {
            try {
                const response = await fetch(`/api/events/${formData.event_id}`);
                const data = await response.json();

                if (data.success && data.data.positions) {
                    setPositions(data.data.positions);
                }
            } catch (error) {
                console.error('Failed to fetch positions:', error);
            }
        }
        fetchPositions();
    }, [formData.event_id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const uploadImage = async (file: File): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('nominee-images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('nominee-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.image_url;

            if (selectedFile) {
                imageUrl = await uploadImage(selectedFile);
            }

            const response = await fetch('/api/nominees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    image_url: imageUrl
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create nominee');
            }

            toast.success('Nominee created successfully');
            router.push('/admin/nominees');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to create nominee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    className="mb-4 pl-0 hover:bg-transparent hover:text-primary-600"
                    onClick={() => router.back()}
                >
                    <ChevronLeft size={20} className="mr-1" />
                    Back to Nominees
                </Button>
                <h1 className="text-3xl font-bold">Add New Nominee</h1>
                <p className="text-gray-600">Enter nominee details and assign them to an event position</p>
            </div>

            <Card>
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Event Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Event
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.event_id}
                                onChange={(e) => setFormData({ ...formData, event_id: e.target.value, position_id: '' })}
                                required
                            >
                                <option value="">Select an event...</option>
                                {events.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Position Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Position
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-400"
                                value={formData.position_id}
                                onChange={(e) => setFormData({ ...formData, position_id: e.target.value })}
                                required
                                disabled={!formData.event_id}
                            >
                                <option value="">Select a position...</option>
                                {positions.map((position) => (
                                    <option key={position.id} value={position.id}>
                                        {position.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Nominee Name"
                            placeholder="e.g. John Doe / Artist Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bio / Description
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                                placeholder="Brief description of the nominee..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nominee Image
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    {selectedFile ? (
                                        <div className="flex items-center justify-center gap-2 text-primary-600">
                                            <Upload size={20} />
                                            <span>{selectedFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <Upload size={24} />
                                            <span>Click to upload image</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                isLoading={loading}
                            >
                                Create Nominee
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
