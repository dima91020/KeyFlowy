export interface AccessCheckUser {
    id: string;
    name?: string | null;
    role: 'ADMIN' | 'USER' | 'GUEST';
    isActive: boolean;
    isInside: boolean;
    validFrom?: Date | null;
    validUntil?: Date | null;
    allowedDevices?: Array<{ macAddress: string }>;
}

export type AccessDecisionCode =
    | 'ACCESS_GRANTED'
    | 'USER_NOT_FOUND'
    | 'USER_INACTIVE'
    | 'CARD_NOT_YET_VALID'
    | 'CARD_EXPIRED'
    | 'NO_DEVICE_PERMISSION'
    | 'ANTI_PASSBACK_ALREADY_INSIDE'
    | 'ANTI_PASSBACK_NOT_INSIDE';

export interface AccessDecision {
    granted: boolean;
    code: AccessDecisionCode;
    reason: string;
}

/**
 * Pure evaluation function for physical access control decisions.
 * Implements Anti-Passback, validity time windows, role hierarchy, and device whitelist.
 */
export function evaluateAccessRequest(
    user: AccessCheckUser | null,
    deviceMac: string,
    direction: 'ENTRY' | 'EXIT' = 'ENTRY',
    currentTime: Date = new Date()
): AccessDecision {
    if (!user) {
        return {
            granted: false,
            code: 'USER_NOT_FOUND',
            reason: 'Card is not assigned to any user.',
        };
    }

    if (!user.isActive) {
        return {
            granted: false,
            code: 'USER_INACTIVE',
            reason: 'User account has been deactivated.',
        };
    }

    const normalizedMac = deviceMac.toUpperCase();

    // Time window validation (especially for guests & temporary passes)
    if (user.validFrom && currentTime < user.validFrom) {
        return {
            granted: false,
            code: 'CARD_NOT_YET_VALID',
            reason: 'Access pass is not yet active.',
        };
    }

    if (user.validUntil && currentTime > user.validUntil) {
        return {
            granted: false,
            code: 'CARD_EXPIRED',
            reason: 'Access pass has expired.',
        };
    }

    // Device permission check (ADMINs have universal access; others must be explicit)
    const hasDeviceAccess =
        user.role === 'ADMIN' ||
        (user.allowedDevices &&
            user.allowedDevices.some(
                (d) => d.macAddress.toUpperCase() === normalizedMac
            ));

    if (!hasDeviceAccess) {
        return {
            granted: false,
            code: 'NO_DEVICE_PERMISSION',
            reason: 'No access permissions for this door/device.',
        };
    }

    // Anti-Passback (APB) Enforcement
    if (direction === 'ENTRY') {
        if (user.isInside) {
            return {
                granted: false,
                code: 'ANTI_PASSBACK_ALREADY_INSIDE',
                reason: 'Anti-passback violation: User is already recorded inside.',
            };
        }
    } else if (direction === 'EXIT') {
        if (!user.isInside) {
            return {
                granted: false,
                code: 'ANTI_PASSBACK_NOT_INSIDE',
                reason: 'Anti-passback violation: User is not recorded inside.',
            };
        }
    }

    return {
        granted: true,
        code: 'ACCESS_GRANTED',
        reason: 'Access successfully authorized.',
    };
}

export interface AccessLogItem {
    timestamp: Date;
    direction: string | null;
}

/**
 * Calculates work hours from a chronological list of access logs for a specific day.
 */
export function calculateDayWorkHours(logs: AccessLogItem[]): number {
    if (!logs || logs.length === 0) return 0;

    const firstEntry = logs.find((l) => l.direction === 'ENTRY');
    const lastExit = [...logs].reverse().find((l) => l.direction === 'EXIT');

    if (firstEntry && lastExit && lastExit.timestamp > firstEntry.timestamp) {
        const diffMs = lastExit.timestamp.getTime() - firstEntry.timestamp.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        return Number(hours.toFixed(1));
    }

    return 0;
}

/**
 * Formats time remaining for a temporary guest pass.
 */
export function formatGuestTimeRemaining(
    validUntil: Date | null | undefined,
    currentTime: Date = new Date()
): string | null {
    if (!validUntil) return null;

    const diffMs = validUntil.getTime() - currentTime.getTime();
    if (diffMs <= 0) return null;

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
}
