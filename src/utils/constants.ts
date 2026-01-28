/**
 * GearTrace Application Constants
 * 
 * Single Source of Truth for application-wide constants.
 * Following AI_RULES.md principles:
 * - Rule 1: Maintainability - centralized constant management
 * - Rule 2: DRY - no hardcoded values across components
 * - Rule 3: Type Safety - leveraging TypeScript's type system
 */

import type { Gear } from '@/types';

// ============================================================================
// Gear Status Constants
// ============================================================================

/**
 * Gear Status Labels - Japanese Display Names
 * 
 * This is the Single Source of Truth for all status labels in the application.
 * All components, exports, and displays MUST reference this constant.
 * 
 * @example
 * ```tsx
 * import { GEAR_STATUS_LABELS } from '@/utils/constants';
 * <div>{GEAR_STATUS_LABELS[gear.status]}</div>
 * ```
 */
export const GEAR_STATUS_LABELS: Record<Gear['status'], string> = {
    Available: '利用可能',
    InUse: '使用中',
    Maintenance: 'メンテナンス中',
    Repair: '修理中',
    Broken: '故障',
    Missing: '紛失',
    Sold: '売却済み'
} as const;

/**
 * Gear Status Colors - Tailwind CSS Classes
 * 
 * Provides consistent color schemes for status badges across the application.
 * Format: "bg-{color}-500 hover:bg-{color}-600"
 */
export const GEAR_STATUS_COLORS: Record<Gear['status'], string> = {
    Available: 'bg-green-500 hover:bg-green-600',
    InUse: 'bg-blue-500 hover:bg-blue-600',
    Maintenance: 'bg-yellow-500 hover:bg-yellow-600',
    Repair: 'bg-orange-500 hover:bg-orange-600',
    Broken: 'bg-red-500 hover:bg-red-600',
    Missing: 'bg-purple-500 hover:bg-purple-600',
    Sold: 'bg-gray-500 hover:bg-gray-600'
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the Japanese label for a given status
 * 
 * @param status - The gear status
 * @returns Japanese label string
 * 
 * @example
 * ```ts
 * getStatusLabel('Available') // => '利用可能'
 * ```
 */
export function getStatusLabel(status: Gear['status']): string {
    return GEAR_STATUS_LABELS[status] || status;
}

/**
 * Get the Tailwind CSS color classes for a given status
 * 
 * @param status - The gear status
 * @returns Tailwind CSS class string
 * 
 * @example
 * ```ts
 * getStatusColor('Available') // => 'bg-green-500 hover:bg-green-600'
 * ```
 */
export function getStatusColor(status: Gear['status']): string {
    return GEAR_STATUS_COLORS[status] || 'bg-gray-500';
}

/**
 * Get all available statuses as array
 * Useful for dropdowns and filters
 * 
 * @returns Array of status keys
 */
export function getAllStatuses(): Gear['status'][] {
    return Object.keys(GEAR_STATUS_LABELS) as Gear['status'][];
}

/**
 * Get all statuses with labels for dropdown options
 * 
 * @returns Array of {value, label} objects
 * 
 * @example
 * ```tsx
 * {getStatusOptions().map(opt => (
 *   <option key={opt.value} value={opt.value}>{opt.label}</option>
 * ))}
 * ```
 */
export function getStatusOptions() {
    return getAllStatuses().map(status => ({
        value: status,
        label: GEAR_STATUS_LABELS[status]
    }));
}
