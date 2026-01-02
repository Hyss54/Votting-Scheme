import { supabase } from './supabase/client';
import { User, UserRole } from '@/types';

export async function signUp(email: string, password: string, fullName: string, role: UserRole = 'voter') {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) throw authError;

    if (authData.user) {
        // Insert user profile
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                full_name: fullName,
                roles: [role],
            });

        if (profileError) throw profileError;
    }

    return authData;
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile;
}

export async function getUserRoles(): Promise<UserRole[]> {
    const user = await getCurrentUser();
    return user?.roles || [];
}

export async function checkRole(allowedRoles: UserRole[]): Promise<boolean> {
    const userRoles = await getUserRoles();
    return userRoles.some(role => allowedRoles.includes(role));
}

export function hasRole(user: User, role: UserRole): boolean {
    return user.roles.includes(role);
}
