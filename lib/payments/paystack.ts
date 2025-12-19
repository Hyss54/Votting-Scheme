import { PaymentMethod } from '@/types';

interface PaystackInitResponse {
    authorization_url: string;
    access_code: string;
    reference: string;
}

export async function initializePaystackPayment(
    email: string,
    amount: number,
    metadata: Record<string, any>
): Promise<PaystackInitResponse> {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            amount: amount * 100, // Convert to pesewas/kobo
            currency: 'GHS',
            metadata,
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
        }),
    });

    const data = await response.json();

    if (!data.status) {
        throw new Error(data.message || 'Failed to initialize payment');
    }

    return data.data;
}

export async function verifyPaystackPayment(reference: string): Promise<boolean> {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
    });

    const data = await response.json();

    return data.status && data.data.status === 'success';
}

export async function validatePaystackWebhook(signature: string, payload: string): Promise<boolean> {
    const crypto = require('crypto');
    const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(payload)
        .digest('hex');

    return hash === signature;
}
