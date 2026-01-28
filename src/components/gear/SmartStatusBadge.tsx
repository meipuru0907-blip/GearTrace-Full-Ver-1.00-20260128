import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/utils/constants";
import type { Gear } from "@/types";

interface SmartStatusBadgeProps {
    status: Gear['status'];
    className?: string;
}

/**
 * SmartStatusBadge Component
 * 
 * Displays status with smart visual weight:
 * - Normal states (Available, InUse): Subtle, outlined style
 * - Alert states (Broken, Repair, Missing): Bold, filled style
 * - Maintenance: Medium emphasis
 * 
 * Design rationale:
 * - Reduces visual noise by making "everything is fine" states less prominent
 * - Immediately draws attention to problems that need action
 * - Follows the principle: "Only highlight exceptions, not the norm"
 */
export function SmartStatusBadge({ status, className }: SmartStatusBadgeProps) {
    const label = getStatusLabel(status);

    // Determine styling based on status severity
    const getStatusStyles = (): { variant: "default" | "outline" | "destructive"; classes: string } => {
        switch (status) {
            // Normal states - subtle
            case 'Available':
                return {
                    variant: "outline",
                    classes: "border-green-300 text-green-700 dark:border-green-700 dark:text-green-400"
                };

            case 'InUse':
                return {
                    variant: "outline",
                    classes: "border-blue-400 text-blue-700 dark:border-blue-600 dark:text-blue-400 font-medium"
                };

            // Maintenance - medium emphasis
            case 'Maintenance':
                return {
                    variant: "default",
                    classes: "bg-yellow-500 hover:bg-yellow-600 text-white"
                };

            // Alert states - high emphasis
            case 'Broken':
                return {
                    variant: "destructive",
                    classes: "bg-red-600 hover:bg-red-700 text-white font-bold"
                };

            case 'Repair':
                return {
                    variant: "default",
                    classes: "bg-orange-500 hover:bg-orange-600 text-white font-bold"
                };

            case 'Missing':
                return {
                    variant: "destructive",
                    classes: "bg-purple-600 hover:bg-purple-700 text-white font-bold"
                };

            case 'Sold':
                return {
                    variant: "outline",
                    classes: "border-gray-400 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                };

            default:
                return {
                    variant: "outline",
                    classes: "border-gray-300 text-gray-600"
                };
        }
    };

    const { variant, classes } = getStatusStyles();

    return (
        <Badge
            variant={variant}
            className={cn("px-2.5 py-0.5 text-xs", classes, className)}
        >
            {label}
        </Badge>
    );
}
