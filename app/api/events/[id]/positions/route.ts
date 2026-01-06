import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = getServiceSupabase();

        const { data, error } = await supabase
            .from('positions')
            .select('*')
            .eq('event_id', params.id)
            .order('display_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = getServiceSupabase();
        const body = await request.json();

        // Get current max display order
        const { data: maxOrderData } = await supabase
            .from('positions')
            .select('display_order')
            .eq('event_id', params.id)
            .order('display_order', { ascending: false })
            .limit(1)
            .single();

        const newOrder = (maxOrderData?.display_order || 0) + 1;

        const { data, error } = await supabase
            .from('positions')
            .insert({
                ...body,
                event_id: params.id,
                display_order: newOrder
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
