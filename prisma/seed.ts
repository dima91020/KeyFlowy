import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('[Seed] Starting database seeding for KeyFlowy...');

    // Clear existing records to ensure clean demo environment
    await prisma.log.deleteMany();
    await prisma.device.deleteMany();
    await prisma.user.deleteMany();
    await prisma.passwordResetToken.deleteMany();

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const employeePassword = await bcrypt.hash('user123', 10);

    // 1. Create Demo Admin
    const admin = await prisma.user.create({
        data: {
            name: 'Dmytro Vereshko (Admin)',
            email: 'admin@demo.com',
            password: hashedPassword,
            role: Role.ADMIN,
            jobTitle: 'Head of Security & IT',
            cardUid: 'A1-B2-C3-D4',
            isActive: true,
            isInside: false,
        },
    });

    console.log(`[Seed] Created Admin: ${admin.email} (Password: admin123)`);

    // 2. Create Access Control Devices (Doors & Turnstiles)
    const turnstileMain = await prisma.device.create({
        data: {
            name: 'Main Entrance Turnstile',
            macAddress: '24:0A:C4:00:01:01',
            deviceKey: 'dev_key_main_turnstile_01',
            description: 'Bi-directional RFID Turnstile at Main Reception',
            isOnline: true,
            lastSeen: new Date(),
            relayTime: 4,
            relayType: 'NO',
            adminId: admin.id,
        },
    });

    const serverRoomDoor = await prisma.device.create({
        data: {
            name: 'Server Room Vault',
            macAddress: '24:0A:C4:00:01:02',
            deviceKey: 'dev_key_server_vault_02',
            description: 'High-security magnetic lock for Datacenter 1',
            isOnline: true,
            lastSeen: new Date(),
            relayTime: 5,
            relayType: 'NC',
            adminId: admin.id,
        },
    });

    const rdLabDoor = await prisma.device.create({
        data: {
            name: 'R&D Laboratory Door',
            macAddress: '24:0A:C4:00:01:03',
            deviceKey: 'dev_key_rd_lab_03',
            description: 'Hardware prototyping and embedded systems laboratory',
            isOnline: false,
            lastSeen: new Date(Date.now() - 3600000 * 24),
            relayTime: 3,
            relayType: 'NO',
            adminId: admin.id,
        },
    });

    console.log('[Seed] Created 3 Access Control Devices');

    // 3. Create Employees with Different Access Levels
    const empAlice = await prisma.user.create({
        data: {
            name: 'Alice Johnson',
            email: 'alice@company.com',
            password: employeePassword,
            role: Role.USER,
            jobTitle: 'Senior Embedded Engineer',
            cardUid: '4B-88-C1-20',
            isActive: true,
            isInside: true,
            adminId: admin.id,
            allowedDevices: {
                connect: [{ id: turnstileMain.id }, { id: rdLabDoor.id }, { id: serverRoomDoor.id }],
            },
        },
    });

    const empBob = await prisma.user.create({
        data: {
            name: 'Bob Miller',
            email: 'bob@company.com',
            password: employeePassword,
            role: Role.USER,
            jobTitle: 'Junior Frontend Developer',
            cardUid: '9F-21-E4-10',
            isActive: true,
            isInside: false,
            adminId: admin.id,
            allowedDevices: {
                connect: [{ id: turnstileMain.id }],
            },
        },
    });

    const empClara = await prisma.user.create({
        data: {
            name: 'Clara Oswald',
            email: 'clara@company.com',
            password: employeePassword,
            role: Role.USER,
            jobTitle: 'HR Specialist (Blocked)',
            cardUid: '3E-55-AA-77',
            isActive: false,
            isInside: false,
            adminId: admin.id,
            allowedDevices: {
                connect: [{ id: turnstileMain.id }],
            },
        },
    });

    // 4. Create Guest Passes
    const now = new Date();
    const guestActiveExpires = new Date(now.getTime() + 1000 * 60 * 60 * 4); // 4 hours left
    const guestExpiredExpires = new Date(now.getTime() - 1000 * 60 * 60 * 2); // Expired 2 hours ago

    await prisma.user.create({
        data: {
            name: 'John Doe (Contractor)',
            email: null,
            password: null,
            role: Role.GUEST,
            jobTitle: 'Network Auditor',
            cardUid: '77-11-22-33',
            isActive: true,
            isInside: false,
            validFrom: new Date(now.getTime() - 1000 * 60 * 60 * 2),
            validUntil: guestActiveExpires,
            adminId: admin.id,
            allowedDevices: {
                connect: [{ id: turnstileMain.id }, { id: serverRoomDoor.id }],
            },
        },
    });

    await prisma.user.create({
        data: {
            name: 'Eve Visitor (Expired)',
            email: null,
            password: null,
            role: Role.GUEST,
            jobTitle: 'Client Representative',
            cardUid: '88-44-22-11',
            isActive: true,
            isInside: false,
            validFrom: new Date(now.getTime() - 1000 * 60 * 60 * 24),
            validUntil: guestExpiredExpires,
            adminId: admin.id,
            allowedDevices: {
                connect: [{ id: turnstileMain.id }],
            },
        },
    });

    console.log('[Seed] Created Employees and Guest passes');

    // 5. Generate Realistic Access Log History across past 7 days
    const logsData: any[] = [];
    const simulatedEmployees = [admin, empAlice, empBob];

    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
        const targetDate = new Date();
        targetDate.setDate(now.getDate() - dayOffset);

        for (const u of simulatedEmployees) {
            // Morning Entries (08:30 - 09:45)
            const entryHour = 8 + Math.floor(Math.random() * 2);
            const entryMinute = Math.floor(Math.random() * 60);
            const entryTime = new Date(targetDate);
            entryTime.setHours(entryHour, entryMinute, Math.floor(Math.random() * 60));

            logsData.push({
                timestamp: entryTime,
                accessGranted: true,
                userId: u.id,
                userName: u.name,
                userRole: u.role,
                cardUid: u.cardUid || 'UNKNOWN',
                deviceId: turnstileMain.id,
                direction: 'ENTRY',
                eventType: 'ACCESS',
            });

            // Evening Exits (17:15 - 19:30)
            if (dayOffset > 0 || u.id === empBob.id) {
                const exitHour = 17 + Math.floor(Math.random() * 3);
                const exitMinute = Math.floor(Math.random() * 60);
                const exitTime = new Date(targetDate);
                exitTime.setHours(exitHour, exitMinute, Math.floor(Math.random() * 60));

                logsData.push({
                    timestamp: exitTime,
                    accessGranted: true,
                    userId: u.id,
                    userName: u.name,
                    userRole: u.role,
                    cardUid: u.cardUid || 'UNKNOWN',
                    deviceId: turnstileMain.id,
                    direction: 'EXIT',
                    eventType: 'ACCESS',
                });
            }
        }
    }

    // Add some unauthorized attempts and security events
    const deniedTime1 = new Date(now.getTime() - 3600000 * 5);
    logsData.push({
        timestamp: deniedTime1,
        accessGranted: false,
        userId: empBob.id,
        userName: empBob.name,
        userRole: empBob.role,
        cardUid: empBob.cardUid || '9F-21-E4-10',
        deviceId: serverRoomDoor.id,
        direction: 'ENTRY',
        eventType: 'ACCESS',
    });

    const intrusionTime = new Date(now.getTime() - 3600000 * 18);
    logsData.push({
        timestamp: intrusionTime,
        accessGranted: false,
        userId: null,
        userName: null,
        userRole: null,
        cardUid: 'INTRUSION',
        deviceId: rdLabDoor.id,
        direction: 'ENTRY',
        eventType: 'INTRUSION',
    });

    await prisma.log.createMany({
        data: logsData,
    });

    console.log(`[Seed] Generated ${logsData.length} realistic access log entries.`);
    console.log('[Seed] Database seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error('[Seed] Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
