interface HubtelInitResponse {
    checkoutUrl: string;
    checkoutId: string;
}

export async function initializeHubtelPayment(
    phoneNumber: string,
    amount: number,
    metadata: Record<string, any>
): Promise<HubtelInitResponse> {
    const auth = Buffer.from(
        `${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch('https://api.hubtel.com/v2/checkout/create', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            totalAmount: amount,
            description: `Payment for ${metadata.event_name}`,
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/hubtel`,
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/voter/payment/success`,
            cancellationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/voter/payment/cancelled`,
            merchantAccountNumber: process.env.HUBTEL_MERCHANT_NUMBER,
            clientReference: metadata.transaction_id || Date.now().toString(),
        }),
    });

    const data = await response.json();

    if (!data.responseCode || data.responseCode !== '0000') {
        throw new Error(data.message || 'Failed to initialize Hubtel payment');
    }

    return {
        checkoutUrl: data.data.checkoutUrl,
        checkoutId: data.data.checkoutId,
    };
}

export async function verifyHubtelPayment(checkoutId: string): Promise<boolean> {
    const auth = Buffer.from(
        `${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(`https://api.hubtel.com/v2/checkout/${checkoutId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${auth}`,
        },
    });

    const data = await response.json();
    return data.data?.status === 'PAID';
}
