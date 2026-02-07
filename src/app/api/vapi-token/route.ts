import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Get API keys from environment
        const publicKey = process.env.VAPI_PUBLIC_KEY;
        const assistantId = process.env.VAPI_ASSISTANT_ID;

        if (!publicKey) {
            return NextResponse.json(
                { error: 'Vapi public key not configured' },
                { status: 500 }
            );
        }

        if (!assistantId) {
            return NextResponse.json(
                { error: 'Vapi assistant ID not configured' },
                { status: 500 }
            );
        }

        // Return public key and assistant ID
        // Note: Public key is safe to expose to frontend
        // Private key should NEVER be sent to frontend
        return NextResponse.json({
            publicKey,
            assistantId,
        });

    } catch (error: any) {
        console.error('Vapi token error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate token',
                details: error.message
            },
            { status: 500 }
        );
    }
}
