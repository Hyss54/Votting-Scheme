interface MTNMoMoInitResponse {
    referenceId: string;
    status: string;
}

export async function initializeMTNMoMo(
    phoneNumber: string,
    amount: number,
    metadata: Record<string, any>
): Promise<MTNMoMoInitResponse> {
    const referenceId = generateReferenceId();

    const response = await fetch(`${getMTNBaseURL()}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
            'X-Reference-Id': referenceId,
            'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
            'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY!,
            'Authorization': `Bearer ${await getMTNAccessToken()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: amount.toString(),
            currency: 'GHS',
            externalId: metadata.transaction_id || Date.now().toString(),
            payer: {
                partyIdType: 'MSISDN',
                partyId: phoneNumber,
            },
            payerMessage: 'Award Voting Payment',
            payeeNote: `Payment for ${metadata.event_name}`,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to initialize MTN MoMo payment');
    }

    return { referenceId, status: 'pending' };
}

export async function verifyMTNMoMo(referenceId: string): Promise<boolean> {
    const response = await fetch(
        `${getMTNBaseURL()}/collection/v1_0/requesttopay/${referenceId}`,
        {
            method: 'GET',
            headers: {
                'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
                'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY!,
                'Authorization': `Bearer ${await getMTNAccessToken()}`,
            },
        }
    );

    const data = await response.json();
    return data.status === 'SUCCESSFUL';
}

async function getMTNAccessToken(): Promise<string> {
    // In production, cache this token as it's valid for a period of time
    const auth = Buffer.from(
        `${process.env.MTN_MOMO_API_KEY}:${process.env.MTN_MOMO_API_SECRET}`
    ).toString('base64');

    const response = await fetch(`${getMTNBaseURL()}/collection/token/`, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY!,
            'Authorization': `Basic ${auth}`,
        },
    });

    const data = await response.json();
    return data.access_token;
}

function getMTNBaseURL(): string {
    return process.env.MTN_MOMO_ENVIRONMENT === 'production'
        ? 'https://proxy.momoapi.mtn.com'
        : 'https://sandbox.momodeveloper.mtn.com';
}

function generateReferenceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
