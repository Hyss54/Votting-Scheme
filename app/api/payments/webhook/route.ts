import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';
import { validatePaystackWebhook, verifyPaystackPayment } from '@/lib/payments/paystack';

export async function POST(request: NextRequest) {
    try {
        const supabase = getServiceSupabase();
        const signature = request.headers.get('x-paystack-signature') || '';
        const body = await request.text();

        // Validate webhook signature
        const isValid = await validatePaystackWebhook(signature, body);
        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid signature' },
                { status: 401 }
            );
        }

        const event = JSON.parse(body);

        if (event.event === 'charge.success') {
            const reference = event.data.reference;
            const metadata = event.data.metadata;

            // Verify payment
            const verified = await verifyPaystackPayment(reference);

            if (verified) {
                // Update payment status
                const { data: payment } = await supabase
                    .from('payments')
                    .update({ status: 'success' })
                    .eq('transaction_reference', reference)
                    .select()
                    .single();

                if (payment) {
                    // Create vote automatically
                    await supabase.from('votes').insert({
                        voter_id: payment.user_id,
                        nominee_id: metadata.nominee_id,
                        event_id: metadata.event_id,
                        position_id: metadata.position_id,
                        payment_id: payment.id,
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
