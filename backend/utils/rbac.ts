import { UserRole, TenantState } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface Permission {
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete';
}

// Role-based permission matrix
const rolePermissions: Record<UserRole, Permission[]> = {
    CLIENT: [
        { resource: 'file', action: 'create' },
        { resource: 'file', action: 'read' },
        { resource: 'profile', action: 'read' },
        { resource: 'profile', action: 'update' },
    ],
    TAX_PRO: [
        { resource: 'file', action: 'create' },
        { resource: 'file', action: 'read' },
        { resource: 'file', action: 'delete' },
        { resource: 'client', action: 'create' },
        { resource: 'client', action: 'read' },
        { resource: 'client', action: 'update' },
        { resource: 'profile', action: 'read' },
        { resource: 'profile', action: 'update' },
    ],
    ADMIN: [
        { resource: 'file', action: 'create' },
        { resource: 'file', action: 'read' },
        { resource: 'file', action: 'update' },
        { resource: 'file', action: 'delete' },
        { resource: 'client', action: 'create' },
        { resource: 'client', action: 'read' },
        { resource: 'client', action: 'update' },
        { resource: 'client', action: 'delete' },
        { resource: 'tenant', action: 'read' },
        { resource: 'tenant', action: 'update' },
        { resource: 'user', action: 'create' },
        { resource: 'user', action: 'read' },
        { resource: 'user', action: 'update' },
        { resource: 'user', action: 'delete' },
    ],
    SAAS_OWNER: [
        { resource: '*', action: 'create' },
        { resource: '*', action: 'read' },
        { resource: '*', action: 'update' },
        { resource: '*', action: 'delete' },
    ],
};

export function hasPermission(role: UserRole, resource: string, action: Permission['action']): boolean {
    const permissions = rolePermissions[role];

    // SAAS_OWNER has wildcard access
    if (role === 'SAAS_OWNER') {
        return true;
    }

    return permissions.some(
        (perm) => perm.resource === resource && perm.action === action
    );
}

export function requireRole(allowedRoles: UserRole[]) {
    return (userRole: UserRole): boolean => {
        return allowedRoles.includes(userRole);
    };
}

// Tenant state access rules
export const tenantStateAccessRules: Record<TenantState, {
    canUploadFiles: boolean;
    canDownloadFiles: boolean;
    canDeleteFiles: boolean;
    canAccessPortal: boolean;
}> = {
    TRIAL: {
        canUploadFiles: true,
        canDownloadFiles: true,
        canDeleteFiles: true,
        canAccessPortal: true,
    },
    ACTIVE: {
        canUploadFiles: true,
        canDownloadFiles: true,
        canDeleteFiles: true,
        canAccessPortal: true,
    },
    GRACE_PERIOD: {
        canUploadFiles: false,
        canDownloadFiles: true,
        canDeleteFiles: false,
        canAccessPortal: true,
    },
    SUSPENDED: {
        canUploadFiles: false,
        canDownloadFiles: false,
        canDeleteFiles: false,
        canAccessPortal: false,
    },
    ARCHIVED: {
        canUploadFiles: false,
        canDownloadFiles: false,
        canDeleteFiles: false,
        canAccessPortal: false,
    },
};

export function canPerformAction(
    tenantState: TenantState,
    action: keyof typeof tenantStateAccessRules.ACTIVE
): boolean {
    return tenantStateAccessRules[tenantState][action];
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: UserRole;
    tenantId: string;
    tenantState: TenantState;
}

// Helper to extract user from request context (set by middleware)
export function getUserFromRequest(req: NextRequest): AuthenticatedUser | null {
    const user = (req as any).user;
    return user || null;
}
