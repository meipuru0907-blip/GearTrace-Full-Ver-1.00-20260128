import type { Gear } from "@/types";

/**
 * Get the display color tag for a gear item.
 * Handles backward compatibility with visualTagColor field.
 * 
 * @param gear - The gear object
 * @returns HEX color code or null if no color tag is set
 * 
 * @example
 * // User selected a color
 * getDisplayColorTag({ colorTag: '#ef4444' }) // => '#ef4444'
 * 
 * // User selected "none"
 * getDisplayColorTag({ colorTag: '' }) // => null
 * 
 * // Legacy data (visualTagColor only)
 * getDisplayColorTag({ visualTagColor: '#3b82f6' }) // => '#3b82f6'
 */
export function getDisplayColorTag(gear: Gear): string | null {
    // Priority 1: Check colorTag (current field)
    // Important: distinguish between undefined (not set) and empty string (explicitly set to "none")
    if (gear.colorTag !== undefined) {
        return gear.colorTag || null; // Empty string becomes null
    }

    // Priority 2: Fallback to visualTagColor (legacy field for backward compatibility)
    return gear.visualTagColor || null;
}

/**
 * Validate if a string is a valid HEX color code.
 * 
 * @param color - Color string to validate
 * @returns true if valid HEX color code
 * 
 * @example
 * isValidHexColor('#ef4444') // => true
 * isValidHexColor('red') // => false
 * isValidHexColor('') // => false (empty is valid for "none", but not a color)
 */
export function isValidHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Get Tailwind CSS class for predefined color names.
 * Used for backward compatibility with old string literal color values.
 * 
 * @param color - Color name or HEX code
 * @returns Tailwind CSS background class
 * 
 * @deprecated This function is for legacy support only. New code should use HEX colors directly.
 */
export function getColorClass(color: string): string {
    const colorMap: Record<string, string> = {
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-400',
        pink: 'bg-pink-500',
        orange: 'bg-orange-500',
        purple: 'bg-purple-500',
    };
    return colorMap[color] || 'bg-gray-200';
}
