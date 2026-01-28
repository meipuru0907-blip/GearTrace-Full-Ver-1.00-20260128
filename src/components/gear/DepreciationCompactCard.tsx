import { Card, CardContent } from "@/components/ui/card";
import type { Gear } from "@/types";
import { TrendingDown, ChevronRight } from "lucide-react";

interface DepreciationCompactCardProps {
    gear: Gear;
    onClick: () => void;
}

/**
 * DepreciationCompactCard Component
 * 
 * Compact summary view of depreciation information.
 * Clicking opens detailed DepreciationModal.
 * 
 * Design: Reduces screen space by ~70% compared to full DepreciationCard
 * while maintaining quick access to key metrics.
 */
export function DepreciationCompactCard({ gear, onClick }: DepreciationCompactCardProps) {
    // Guard: Validate purchase date
    const purchaseDate = new Date(gear.purchaseDate);
    const isValidDate = !isNaN(purchaseDate.getTime()) && purchaseDate.getFullYear() > 1900 && purchaseDate.getFullYear() < 2100;

    if (!isValidDate) {
        return (
            <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={onClick}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">資産価値</div>
                            <div className="text-lg font-semibold text-muted-foreground">データ未設定</div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group"
            onClick={onClick}
        >
            <CardContent className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">減価償却シミュレーター</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-xs text-muted-foreground mt-1.5 text-center">
                    クリックして詳細を表示
                </div>
            </CardContent>
        </Card>
    );
}
