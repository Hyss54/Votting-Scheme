import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';

export async function GET(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    try {
        const supabase = getServiceSupabase();
        const { data, error } = await supabase
            .from('events')
            .select('*, positions(*)')
            .eq('id', params.eventId)
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

export async function PATCH(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    try {
        const supabase = getServiceSupabase();
        const body = await request.json();

        const { data, error } = await supabase
            .from('events')
            .update(body)
            .eq('id', params.eventId)
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    try {
        const supabase = getServiceSupabase();
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', params.eventId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
