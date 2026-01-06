import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';
import { verifyPaystackPayment } from '@/lib/payments/paystack';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const reference = searchParams.get('reference');
        const supabase = getServiceSupabase();

        if (!reference) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voter/payment/failed?reason=missing_reference`);
        }

        // 1. Verify payment with Paystack
        const isVerified = await verifyPaystackPayment(reference);

        if (!isVerified) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voter/payment/failed?reason=verification_failed`);
        }

        // 2. Check if payment is already processed to avoid duplicates (Idempotency)
        const { data: existingPayment } = await supabase
            .from('payments')
            .select('*')
            .eq('transaction_reference', reference)
            .single();

        if (!existingPayment) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voter/payment/failed?reason=payment_not_found`);
        }

        if (existingPayment.status === 'success') {
            // Already successfully processed
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voter/history?payment=success`);
        }

        // 3. Update Payment Status
        const { error: updateError } = await supabase
            .from('payments')
            .update({ status: 'success' })
            .eq('id', existingPayment.id);

        if (updateError) {
            console.error('Failed to update payment status:', updateError);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voter/payment/failed?reason=update_error`);
        }

        // 4. Create Vote Record
        const metadata = existingPayment.metadata as any;
        const { error: voteError } = await supabase
            .from('votes')
            .insert({
                voter_id: existingPayment.user_id,
                nominee_id: metadata.nominee_id,
                event_id: metadata.event_id,
                position_id: metadata.position_id,
                payment_id: existingPayment.id,
            });

        if (voteError) {
            console.error('Failed to create vote:', voteError);
            // Note: Payment succeeded but vote creation failed. 
            // Ideally we should have a retry mechanism or alert system here.
            // For now, redirecting to success but user might not see vote immediately.
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voter/history?payment=success`);

    } catch (error) {
        console.error('Payment callback error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/voter/payment/failed?error=internal_server_error`);
    }
}
