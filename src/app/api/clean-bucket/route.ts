import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Get environment variables
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Missing Supabase configuration' },
                { status: 500 }
            );
        }

        // Create Supabase client with service role key
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Empty the images bucket
        const { data, error } = await supabase.storage.emptyBucket('images');

        if (error) {
            console.error('Error emptying bucket:', error);
            return NextResponse.json(
                { error: 'Failed to empty images bucket', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: 'Successfully emptied images bucket',
                data: data
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
