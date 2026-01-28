import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface DashboardMetricCardProps {
    title: string;
    icon: ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'primary' | 'success' | 'warning';
}

/**
 * DashboardMetricCard Component
 * 
 * Interactive card displaying financial metrics on the dashboard.
 * Clicking opens detailed analysis modal.
 * 
 * Design: Provides quick overview with visual hints for interactivity.
 */
export function DashboardMetricCard({
    title,
    icon,
    onClick,
    variant = 'default'
}: DashboardMetricCardProps) {
    const isClickable = !!onClick;

    const variantStyles = {
        default: "bg-card",
        primary: "bg-primary/5 border-primary/20",
        success: "bg-green-500/5 border-green-500/20",
        warning: "bg-yellow-500/5 border-yellow-500/20"
    };

    return (
        <Card
            className={cn(
                "transition-all",
                variantStyles[variant],
                isClickable && "cursor-pointer hover:shadow-md hover:border-primary/50 group"
            )}
            onClick={onClick}
        >
            <CardContent className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        {icon}
                        <span>{title}</span>
                    </div>
                    {isClickable && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                </div>
                {isClickable && (
                    <div className="text-xs text-muted-foreground mt-1.5 text-center">
                        クリックして詳細を表示
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
