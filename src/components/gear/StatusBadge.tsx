import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusConfig = {
    Available: {
        label: "稼働中",
        variant: "default" as const,
        className: "bg-green-500 hover:bg-green-600 text-white"
    },
    Maintenance: {
        label: "メンテナンス中",
        variant: "secondary" as const,
        className: "bg-yellow-500 hover:bg-yellow-600 text-white"
    },
    Repair: {
        label: "修理中",
        variant: "secondary" as const,
        className: "bg-orange-500 hover:bg-orange-600 text-white"
    },
    Broken: {
        label: "故障",
        variant: "destructive" as const,
        className: "bg-red-500 hover:bg-red-600 text-white"
    },
    Missing: {
        label: "紛失",
        variant: "secondary" as const,
        className: "bg-purple-500 hover:bg-purple-600 text-white"
    }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: "outline" as const,
        className: ""
    };

    return (
        <Badge
            variant={config.variant}
            className={cn(config.className, "font-semibold px-3 py-1", className)}
        >
            {config.label}
        </Badge>
    );
}
