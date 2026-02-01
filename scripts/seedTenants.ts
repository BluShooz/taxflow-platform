import { PrismaClient, TenantState, UserRole } from '@prisma/client';
import { hashPassword } from '../backend/utils/jwt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create demo tenants in different states
    const tenants = [
        {
            name: 'Acme Tax Services',
            email: 'admin@acmetax.com',
            state: TenantState.ACTIVE,
            subdomain: 'acmetax',
            primaryColor: '#3B82F6',
            maxClients: 50,
            maxStorageGB: 100,
        },
        {
            name: 'Smith & Associates',
            email: 'admin@smithtax.com',
            state: TenantState.TRIAL,
            subdomain: 'smithtax',
            primaryColor: '#10B981',
            maxClients: 10,
            maxStorageGB: 10,
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
        {
            name: 'Johnson Tax Pro',
            email: 'admin@johnsontax.com',
            state: TenantState.GRACE_PERIOD,
            subdomain: 'johnsontax',
            primaryColor: '#F59E0B',
            maxClients: 25,
            maxStorageGB: 50,
            gracePeriodStartedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
    ];

    for (const tenantData of tenants) {
        const tenant = await prisma.tenant.upsert({
            where: { email: tenantData.email },
            update: {},
            create: tenantData,
        });

        console.log(`✅ Created tenant: ${tenant.name} (${tenant.state})`);

        // Create users for each tenant
        const users = [
            {
                email: `owner@${tenantData.subdomain}.com`,
                firstName: 'Tax',
                lastName: 'Pro',
                role: UserRole.TAX_PRO,
            },
            {
                email: `client@${tenantData.subdomain}.com`,
                firstName: 'John',
                lastName: 'Client',
                role: UserRole.CLIENT,
            },
        ];

        for (const userData of users) {
            const passwordHash = await hashPassword('password123');

            const user = await prisma.user.upsert({
                where: { email: userData.email },
                update: {},
                create: {
                    ...userData,
                    passwordHash,
                    tenantId: tenant.id,
                },
            });

            console.log(`  ✅ Created user: ${user.email} (${user.role})`);
        }
    }

    // Create a SAAS_OWNER user
    const ownerPasswordHash = await hashPassword('admin123');
    const saasOwner = await prisma.user.upsert({
        where: { email: 'owner@taxflow.com' },
        update: {},
        create: {
            email: 'owner@taxflow.com',
            firstName: 'Platform',
            lastName: 'Owner',
            role: UserRole.SAAS_OWNER,
            passwordHash: ownerPasswordHash,
            tenantId: tenants[0].email, // Associate with first tenant for now
        },
    });

    console.log(`✅ Created SaaS Owner: ${saasOwner.email}`);

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
