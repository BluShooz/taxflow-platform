export const DEMO_TENANTS = [
    {
        id: 'tnt_demo_123',
        name: 'Delta Tax Solutions',
        state: 'ACTIVE',
        subscriptionTier: 'PRO',
    }
];

export const DEMO_USERS = [
    {
        id: 'user_client_1',
        email: 'client@taxflow.com',
        password: 'client123',
        firstName: 'Sarah',
        lastName: 'Client',
        role: 'CLIENT',
        tenantId: 'tnt_demo_123'
    },
    {
        id: 'user_pro_1',
        email: 'pro@taxflow.com',
        password: 'pro123',
        firstName: 'Mark',
        lastName: 'TaxPro',
        role: 'TAX_PRO',
        tenantId: 'tnt_demo_123'
    },
    {
        id: 'user_owner_1',
        email: 'owner@taxflow.com',
        password: 'admin123',
        firstName: 'Alex',
        lastName: 'PlatformOwner',
        role: 'SAAS_OWNER',
        tenantId: 'tnt_demo_123'
    }
];

export const DEMO_STATS = {
    stats: {
        clientCount: 124,
        fileCount: 842,
        totalStorageUsed: 15240000000, // ~15GB
        storageLimitGB: 100
    },
    recentLogs: [
        { id: '1', action: 'FILE_UPLOAD', createdAt: new Date().toISOString(), user: { firstName: 'Sarah' } },
        { id: '2', action: 'SUBSCRIPTION_UPGRADE', createdAt: new Date().toISOString(), user: { firstName: 'Mark' } }
    ]
};

export const DEMO_FILES = [
    {
        id: 'file_1',
        originalName: '2025_Tax_Return_Draft.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2500000,
        uploadedAt: new Date().toISOString(),
        uploadedBy: { firstName: 'Sarah', lastName: 'Client' }
    },
    {
        id: 'file_2',
        originalName: 'Investment_Statement_Q4.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        sizeBytes: 1200000,
        uploadedAt: new Date().toISOString(),
        uploadedBy: { firstName: 'Mark', lastName: 'TaxPro' }
    }
];
