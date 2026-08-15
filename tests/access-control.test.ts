import { describe, it, expect } from 'vitest';
import {
    evaluateAccessRequest,
    calculateDayWorkHours,
    formatGuestTimeRemaining,
    AccessCheckUser,
} from '../app/lib/access-control';

describe('Access Control Engine (evaluateAccessRequest)', () => {
    const defaultEmployee: AccessCheckUser = {
        id: 'user-1',
        name: 'John Doe',
        role: 'USER',
        isActive: true,
        isInside: false,
        allowedDevices: [{ macAddress: 'AA:BB:CC:DD:EE:01' }],
    };

    it('should grant access to active employee entering allowed door when outside', () => {
        const result = evaluateAccessRequest(defaultEmployee, 'AA:BB:CC:DD:EE:01', 'ENTRY');
        expect(result.granted).toBe(true);
        expect(result.code).toBe('ACCESS_GRANTED');
    });

    it('should reject access if user does not exist', () => {
        const result = evaluateAccessRequest(null, 'AA:BB:CC:DD:EE:01', 'ENTRY');
        expect(result.granted).toBe(false);
        expect(result.code).toBe('USER_NOT_FOUND');
    });

    it('should reject deactivated / blocked employee', () => {
        const blockedUser = { ...defaultEmployee, isActive: false };
        const result = evaluateAccessRequest(blockedUser, 'AA:BB:CC:DD:EE:01', 'ENTRY');
        expect(result.granted).toBe(false);
        expect(result.code).toBe('USER_INACTIVE');
    });

    it('should reject access to a door not assigned in allowedDevices', () => {
        const result = evaluateAccessRequest(defaultEmployee, 'FF:FF:FF:FF:FF:99', 'ENTRY');
        expect(result.granted).toBe(false);
        expect(result.code).toBe('NO_DEVICE_PERMISSION');
    });

    it('should allow ADMIN to access any device regardless of allowedDevices list', () => {
        const adminUser: AccessCheckUser = {
            id: 'admin-1',
            name: 'Security Chief',
            role: 'ADMIN',
            isActive: true,
            isInside: false,
            allowedDevices: [],
        };
        const result = evaluateAccessRequest(adminUser, 'ANY:RANDOM:MAC:01', 'ENTRY');
        expect(result.granted).toBe(true);
        expect(result.code).toBe('ACCESS_GRANTED');
    });

    describe('Anti-Passback (APB) Rules', () => {
        it('should reject ENTRY if user is already recorded inside', () => {
            const userInside = { ...defaultEmployee, isInside: true };
            const result = evaluateAccessRequest(userInside, 'AA:BB:CC:DD:EE:01', 'ENTRY');
            expect(result.granted).toBe(false);
            expect(result.code).toBe('ANTI_PASSBACK_ALREADY_INSIDE');
        });

        it('should allow EXIT if user is currently inside', () => {
            const userInside = { ...defaultEmployee, isInside: true };
            const result = evaluateAccessRequest(userInside, 'AA:BB:CC:DD:EE:01', 'EXIT');
            expect(result.granted).toBe(true);
            expect(result.code).toBe('ACCESS_GRANTED');
        });

        it('should reject EXIT if user is not recorded inside (never entered)', () => {
            const userOutside = { ...defaultEmployee, isInside: false };
            const result = evaluateAccessRequest(userOutside, 'AA:BB:CC:DD:EE:01', 'EXIT');
            expect(result.granted).toBe(false);
            expect(result.code).toBe('ANTI_PASSBACK_NOT_INSIDE');
        });
    });

    describe('Time-window and Guest Pass Expiration', () => {
        const now = new Date('2026-08-15T14:00:00Z');

        it('should reject guest pass before validFrom timestamp', () => {
            const futureGuest: AccessCheckUser = {
                id: 'guest-1',
                role: 'GUEST',
                isActive: true,
                isInside: false,
                validFrom: new Date('2026-08-15T15:00:00Z'),
                validUntil: new Date('2026-08-15T18:00:00Z'),
                allowedDevices: [{ macAddress: 'AA:BB:CC:DD:EE:01' }],
            };
            const result = evaluateAccessRequest(futureGuest, 'AA:BB:CC:DD:EE:01', 'ENTRY', now);
            expect(result.granted).toBe(false);
            expect(result.code).toBe('CARD_NOT_YET_VALID');
        });

        it('should reject guest pass after validUntil timestamp', () => {
            const expiredGuest: AccessCheckUser = {
                id: 'guest-2',
                role: 'GUEST',
                isActive: true,
                isInside: false,
                validFrom: new Date('2026-08-15T08:00:00Z'),
                validUntil: new Date('2026-08-15T12:00:00Z'),
                allowedDevices: [{ macAddress: 'AA:BB:CC:DD:EE:01' }],
            };
            const result = evaluateAccessRequest(expiredGuest, 'AA:BB:CC:DD:EE:01', 'ENTRY', now);
            expect(result.granted).toBe(false);
            expect(result.code).toBe('CARD_EXPIRED');
        });

        it('should grant access to guest within active validity window', () => {
            const validGuest: AccessCheckUser = {
                id: 'guest-3',
                role: 'GUEST',
                isActive: true,
                isInside: false,
                validFrom: new Date('2026-08-15T10:00:00Z'),
                validUntil: new Date('2026-08-15T18:00:00Z'),
                allowedDevices: [{ macAddress: 'AA:BB:CC:DD:EE:01' }],
            };
            const result = evaluateAccessRequest(validGuest, 'AA:BB:CC:DD:EE:01', 'ENTRY', now);
            expect(result.granted).toBe(true);
            expect(result.code).toBe('ACCESS_GRANTED');
        });
    });
});

describe('Analytics (calculateDayWorkHours)', () => {
    it('should return 0 for empty logs', () => {
        expect(calculateDayWorkHours([])).toBe(0);
    });

    it('should calculate correct work hours between first entry and last exit', () => {
        const logs = [
            { timestamp: new Date('2026-08-15T09:00:00Z'), direction: 'ENTRY' },
            { timestamp: new Date('2026-08-15T13:00:00Z'), direction: 'EXIT' },
            { timestamp: new Date('2026-08-15T14:00:00Z'), direction: 'ENTRY' },
            { timestamp: new Date('2026-08-15T17:30:00Z'), direction: 'EXIT' },
        ];
        // 9:00 to 17:30 = 8.5 hours
        expect(calculateDayWorkHours(logs)).toBe(8.5);
    });

    it('should return 0 if only ENTRY log is recorded (employee still inside)', () => {
        const logs = [{ timestamp: new Date('2026-08-15T09:00:00Z'), direction: 'ENTRY' }];
        expect(calculateDayWorkHours(logs)).toBe(0);
    });
});

describe('Guest Time Formatter (formatGuestTimeRemaining)', () => {
    const now = new Date('2026-08-15T10:00:00Z');

    it('should return null when validUntil is null', () => {
        expect(formatGuestTimeRemaining(null, now)).toBeNull();
    });

    it('should return null when time has expired', () => {
        const past = new Date('2026-08-15T09:00:00Z');
        expect(formatGuestTimeRemaining(past, now)).toBeNull();
    });

    it('should format minutes left', () => {
        const soon = new Date('2026-08-15T10:45:00Z');
        expect(formatGuestTimeRemaining(soon, now)).toBe('45m left');
    });

    it('should format hours and minutes left', () => {
        const laterToday = new Date('2026-08-15T13:30:00Z');
        expect(formatGuestTimeRemaining(laterToday, now)).toBe('3h 30m left');
    });

    it('should format days and hours left', () => {
        const daysLater = new Date('2026-08-17T15:00:00Z');
        expect(formatGuestTimeRemaining(daysLater, now)).toBe('2d 5h left');
    });
});
