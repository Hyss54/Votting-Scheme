import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
    try {
        const supabase = getServiceSupabase();
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('event_id');
        const positionId = searchParams.get('position_id');

        let query = supabase
            .from('nominees')
            .select('*, positions(name), events(name)')
            .order('created_at', { ascending: false });

        if (eventId) {
            query = query.eq('event_id', eventId);
        }

        if (positionId) {
            query = query.eq('position_id', positionId);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Get vote counts for each nominee
        const nomineesWithVotes = await Promise.all(
            data.map(async (nominee) => {
                const { count } = await supabase
                    .from('votes')
                    .select('*', { count: 'exact', head: true })
                    .eq('nominee_id', nominee.id);

                return { ...nominee, vote_count: count || 0 };
            })
        );

        return NextResponse.json({ success: true, data: nomineesWithVotes });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = getServiceSupabase();
        const body = await request.json();

        const { data, error } = await supabase
            .from('nominees')
            .insert(body)
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
