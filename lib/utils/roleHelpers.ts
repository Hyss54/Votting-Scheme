import { User, UserRole } from '@/types';

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null | undefined, role: UserRole): boolean {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: User | null | undefined, roles: UserRole[]): boolean {
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
}

/**
 * Check if a user has all of the specified roles
 */
export function hasAllRoles(user: User | null | undefined, roles: UserRole[]): boolean {
    if (!user || !user.roles) return false;
    return roles.every(role => user.roles.includes(role));
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
    return hasRole(user, 'admin');
}

/**
 * Check if a user can vote (either voter or nominee with voter role)
 */
export function canVote(user: User | null | undefined): boolean {
    return hasAnyRole(user, ['voter', 'nominee']);
}

/**
 * Check if a user is a nominee
 */
export function isNominee(user: User | null | undefined): boolean {
    return hasRole(user, 'nominee');
}

/**
 * Add a role to a user's roles array (client-side utility)
 */
export function addRole(roles: UserRole[], newRole: UserRole): UserRole[] {
    if (roles.includes(newRole)) return roles;
    return [...roles, newRole];
}

/**
 * Remove a role from a user's roles array (client-side utility)
 */
export function removeRole(roles: UserRole[], roleToRemove: UserRole): UserRole[] {
    return roles.filter(role => role !== roleToRemove);
}

/**
 * Get display label for roles
 */
export function getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
        admin: 'Admin',
        voter: 'Voter',
        nominee: 'Nominee'
    };
    return labels[role];
}

/**
 * Get formatted roles display string
 */
export function formatRoles(roles: UserRole[]): string {
    return roles.map(getRoleLabel).join(', ');
}
