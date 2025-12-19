import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';
import { initializePaystackPayment } from '@/lib/payments/paystack';
import { initializeMTNMoMo } from '@/lib/payments/mtn-momo';
import { initializeHubtelPayment } from '@/lib/payments/hubtel';

export async function POST(request: NextRequest) {
    try {
        const supabase = getServiceSupabase();
        const body = await request.json();
        const { amount, payment_method, nominee_id, event_id, position_id, user_email, user_phone } = body;

        // Create pending payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: body.user_id,
                amount,
                currency: 'GHS',
                payment_method,
                transaction_reference: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
                status: 'pending',
                metadata: {
                    nominee_id,
                    event_id,
                    position_id,
                },
            })
            .select()
            .single();

        if (paymentError) throw paymentError;

        let paymentUrl = '';
        let reference = payment.transaction_reference;

        // Initialize payment based on method
        switch (payment_method) {
            case 'paystack':
                const paystackData = await initializePaystackPayment(
                    user_email,
                    amount,
                    { payment_id: payment.id, nominee_id, event_id, position_id }
                );
                paymentUrl = paystackData.authorization_url;
                reference = paystackData.reference;
                break;

            case 'mtn_momo':
                const mtnData = await initializeMTNMoMo(
                    user_phone,
                    amount,
                    { payment_id: payment.id, nominee_id, event_id, position_id }
                );
                reference = mtnData.referenceId;
                // For MTN MoMo, user will receive prompt on their phone
                break;

            case 'hubtel':
                const hubtelData = await initializeHubtelPayment(
                    user_phone,
                    amount,
                    { payment_id: payment.id, nominee_id, event_id, position_id }
                );
                paymentUrl = hubtelData.checkoutUrl;
                reference = hubtelData.checkoutId;
                break;

            default:
                throw new Error('Invalid payment method');
        }

        // Update payment with external reference
        await supabase
            .from('payments')
            .update({ transaction_reference: reference })
            .eq('id', payment.id);

        return NextResponse.json({
            success: true,
            data: {
                payment_id: payment.id,
                payment_url: paymentUrl,
                reference,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
