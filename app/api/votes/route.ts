import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
    try {
        const supabase = getServiceSupabase();
        const body = await request.json();
        const { nominee_id, event_id, position_id, voter_id, payment_id } = body;

        // Verify payment was successful
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('id', payment_id)
            .eq('status', 'success')
            .single();

        if (paymentError || !payment) {
            return NextResponse.json(
                { success: false, error: 'Payment not found or not successful' },
                { status: 400 }
            );
        }

        // Create vote
        const { data, error } = await supabase
            .from('votes')
            .insert({
                voter_id,
                nominee_id,
                event_id,
                position_id,
                payment_id,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = getServiceSupabase();
        const { searchParams } = new URL(request.url);
        const voterId = searchParams.get('voter_id');

        let query = supabase
            .from('votes')
            .select('*, nominees(name), events(name), positions(name)')
            .order('created_at', { ascending: false });

        if (voterId) {
            query = query.eq('voter_id', voterId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
