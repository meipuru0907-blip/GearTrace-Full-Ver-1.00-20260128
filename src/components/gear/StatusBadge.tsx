import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusLabel, getStatusColor } from "@/utils/constants";
import type { Gear } from "@/types";

interface StatusBadgeProps {
    status: Gear['status'];
    className?: string;
}

/**
 * StatusBadge Component
 * 
 * Displays a colored badge with the Japanese label for a gear's status.
 * Uses constants from Single Source of Truth (constants.ts)
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
    const label = getStatusLabel(status);
    const colorClasses = getStatusColor(status);

    return (
        <Badge
            variant="default"
            className={cn(colorClasses, "text-white font-semibold px-3 py-1", className)}
        >
            {label}
        </Badge>
    );
}
