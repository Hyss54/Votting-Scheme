export type UserRole = 'admin' | 'voter' | 'nominee';

export type EventStatus = 'draft' | 'active' | 'paused' | 'ended';

export type PaymentStatus = 'pending' | 'success' | 'failed';

export type PaymentMethod = 'paystack' | 'mtn_momo' | 'hubtel';

export interface User {
    id: string;
    email: string;
    roles: UserRole[];
    full_name: string;
    phone?: string;
    created_at: string;
    updated_at: string;
}

export interface Event {
    id: string;
    name: string;
    description: string;
    vote_price: number;
    start_date: string;
    end_date: string;
    status: EventStatus;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Position {
    id: string;
    name: string;
    description?: string;
    event_id: string;
    display_order: number;
    created_at: string;
}

export interface Nominee {
    id: string;
    user_id?: string;
    event_id: string;
    position_id: string;
    name: string;
    bio?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
    votes?: number; // Computed field
}

export interface Vote {
    id: string;
    voter_id: string;
    nominee_id: string;
    event_id: string;
    position_id: string;
    payment_id: string;
    created_at: string;
}

export interface Payment {
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    payment_method: PaymentMethod;
    transaction_reference: string;
    status: PaymentStatus;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Extended types with relations
export interface NomineeWithDetails extends Nominee {
    position?: Position;
    event?: Event;
    vote_count: number;
}

export interface VoteWithDetails extends Vote {
    nominee?: Nominee;
    event?: Event;
    position?: Position;
    payment?: Payment;
}

export interface EventWithDetails extends Event {
    positions?: Position[];
    total_votes?: number;
    total_revenue?: number;
}
