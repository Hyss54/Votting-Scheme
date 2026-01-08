import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, UserRole } from '@/types';

export async function signUp(email: string, password: string, fullName: string, role: UserRole = 'voter') {
    const supabase = createClientComponentClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
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
                role,
            });

        if (profileError) throw profileError;
    }

    return authData;
}

export async function signIn(email: string, password: string) {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    // Refresh the router to update server components/middleware states
    // This is often handled by the caller, but good to ensure session is set
    return data;
}

export async function signOut() {
    const supabase = createClientComponentClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile;
}

export async function getUserRole(): Promise<UserRole | null> {
    const user = await getCurrentUser();
    return user?.role || null;
}

export async function checkRole(allowedRoles: UserRole[]): Promise<boolean> {
    const role = await getUserRole();
    return role ? allowedRoles.includes(role) : false;
}
