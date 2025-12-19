'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { Nominee, Position, Event } from '@/types';
import { formatCurrency } from '@/lib/utils/helpers';
import { CreditCard, Smartphone, Wallet, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EventVotingPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [positions, setPositions] = useState<Position[]>([]);
    const [nominees, setNominees] = useState<Nominee[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<string>('');
    const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        async function fetchEventData() {
            try {
                const [eventRes, nomineesRes] = await Promise.all([
                    fetch(`/api/events/${eventId}`),
                    fetch(`/api/nominees?event_id=${eventId}`),
                ]);

                const eventData = await eventRes.json();
                const nomineesData = await nomineesRes.json();

                if (eventData.success) {
                    setEvent(eventData.data);
                    setPositions(eventData.data.positions || []);
                    if (eventData.data.positions?.length > 0) {
                        setSelectedPosition(eventData.data.positions[0].id);
                    }
                }

                if (nomineesData.success) {
                    setNominees(nomineesData.data);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchEventData();
    }, [eventId]);

    const filteredNominees = nominees.filter(
        (nominee) => nominee.position_id === selectedPosition
    );

    const handleVoteClick = (nominee: Nominee) => {
        setSelectedNominee(nominee);
        setShowPaymentModal(true);
    };

    const handlePayment = async (method: string) => {
        setPaymentLoading(true);

        try {
            // Mock user data - in production, get from auth context
            const response = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: event?.vote_price,
                    payment_method: method,
                    nominee_id: selectedNominee?.id,
                    event_id: eventId,
                    position_id: selectedPosition,
                    user_email: 'voter@example.com',
                    user_phone: '0240000000',
                    user_id: 'mock-user-id',
                }),
            });

            const data = await response.json();

            if (data.success) {
                if (data.data.payment_url) {
                    window.location.href = data.data.payment_url;
                } else {
                    toast.success('Payment initiated! Check your phone to complete.');
                    setShowPaymentModal(false);
                }
            } else {
                toast.error(data.error || 'Payment initialization failed');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading) return <LoadingSkeleton count={5} />;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{event?.name}</h1>
                <p className="text-gray-600">{event?.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                    Vote price: {formatCurrency(event?.vote_price || 0)} per vote
                </p>
            </div>

            {/* Position Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {positions.map((position) => (
                    <button
                        key={position.id}
                        onClick={() => setSelectedPosition(position.id)}
                        className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${selectedPosition === position.id
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {position.name}
                    </button>
                ))}
            </div>

            {/* Nominees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNominees.map((nominee) => (
                    <Card key={nominee.id} variant="bordered" className="hover-lift">
                        <CardBody>
                            {nominee.image_url && (
                                <img
                                    src={nominee.image_url}
                                    alt={nominee.name}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                />
                            )}
                            <h3 className="text-xl font-bold mb-2">{nominee.name}</h3>
                            {nominee.bio && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{nominee.bio}</p>
                            )}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <TrendingUp size={16} />
                                    <span className="text-sm">{nominee.vote_count || 0} votes</span>
                                </div>
                                <Badge variant="info">{nominee.vote_count || 0}</Badge>
                            </div>
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => handleVoteClick(nominee)}
                            >
                                Vote for {nominee.name.split(' ')[0]}
                            </Button>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {filteredNominees.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-600">No nominees in this position yet</p>
                </div>
            )}

            {/* Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Select Payment Method"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 mb-4">
                        Voting for <strong>{selectedNominee?.name}</strong>
                        <br />
                        Amount: <strong>{formatCurrency(event?.vote_price || 0)}</strong>
                    </p>

                    <button
                        onClick={() => handlePayment('paystack')}
                        disabled={paymentLoading}
                        className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                    >
                        <CreditCard className="text-primary-600" />
                        <div className="text-left">
                            <p className="font-medium">Paystack</p>
                            <p className="text-sm text-gray-600">Card, Mobile Money, Bank</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handlePayment('mtn_momo')}
                        disabled={paymentLoading}
                        className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all"
                    >
                        <Smartphone className="text-yellow-600" />
                        <div className="text-left">
                            <p className="font-medium">MTN Mobile Money</p>
                            <p className="text-sm text-gray-600">Direct from your MTN MoMo</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handlePayment('hubtel')}
                        disabled={paymentLoading}
                        className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                    >
                        <Wallet className="text-green-600" />
                        <div className="text-left">
                            <p className="font-medium">Hubtel</p>
                            <p className="text-sm text-gray-600">Multiple payment options</p>
                        </div>
                    </button>
                </div>
            </Modal>
        </div>
    );
}
