import { cn } from "@/lib/utils";

interface IdentificationBadgeProps {
    color?: string;
    serial?: string;
    className?: string;
}

/**
 * IdentificationBadge Component
 * 
 * Combines color tag and serial number into a single visual element.
 * Reduces cognitive load by presenting physical identification as one unified badge.
 * 
 * Design philosophy:
 * - Color tag provides visual quick-reference
 * - Serial number provides specific identification
 * - Combined presentation mimics real-world color-coded labeling
 */
export function IdentificationBadge({ color, serial, className }: IdentificationBadgeProps) {
    // Handle color display (empty string or undefined means no color)
    const hasColor = color && color.trim() !== '' && color !== 'none';
    const hasSerial = serial && serial.trim() !== '';

    // If neither color nor serial, don't render anything
    if (!hasColor && !hasSerial) {
        return null;
    }

    // Determine badge styling based on color
    const getBadgeStyles = () => {
        if (!hasColor) {
            // Serial only - neutral gray
            return "bg-gray-100 text-gray-700 border border-gray-300";
        }

        // Color-coded badge with high contrast
        switch (color) {
            case '#ef4444': // Red
                return "bg-red-500 text-white border border-red-600";
            case '#f97316': // Orange
                return "bg-orange-500 text-white border border-orange-600";
            case '#eab308': // Yellow
                return "bg-yellow-400 text-gray-900 border border-yellow-500";
            case '#22c55e': // Green
                return "bg-green-500 text-white border border-green-600";
            case '#3b82f6': // Blue
                return "bg-blue-500 text-white border border-blue-600";
            case '#a855f7': // Purple
                return "bg-purple-500 text-white border border-purple-600";
            case '#ec4899': // Pink
                return "bg-pink-500 text-white border border-pink-600";
            default:
                return "bg-gray-500 text-white border border-gray-600";
        }
    };

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
            getBadgeStyles(),
            className
        )}>
            {hasColor && (
                <div
                    className="w-2 h-2 rounded-full ring-1 ring-white/50"
                    style={{ backgroundColor: color }}
                    title="Color Tag"
                />
            )}
            {hasSerial ? (
                <span className="font-mono font-semibold tracking-tight">
                    S/N: {serial}
                </span>
            ) : (
                hasColor && <span className="text-[10px] opacity-90">Tagged</span>
            )}
        </div>
    );
}
