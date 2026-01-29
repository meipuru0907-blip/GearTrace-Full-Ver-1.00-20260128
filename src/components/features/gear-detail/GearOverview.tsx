import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepreciationCompactCard } from "@/components/gear/DepreciationCompactCard";
import { DepreciationModal } from "@/components/gear/DepreciationModal";
import { ModelResearchButton } from "@/components/gear/ModelResearchButton";
import { MarketLinks } from "@/components/gear/MarketLinks";
import type { Gear } from "@/types";
import { useState } from "react";

import { ResaleAssistantModal } from "@/components/gear/ResaleAssistantModal";

interface GearOverviewProps {
    gear: Gear;
}

export function GearOverview({ gear }: GearOverviewProps) {
    const [depreciationModalOpen, setDepreciationModalOpen] = useState(false);
    const [resaleModalOpen, setResaleModalOpen] = useState(false);

    return (
        <div className="space-y-4 mt-4">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            シリアル番号
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{gear.serialNumber || 'N/A'}</div>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            購入日
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{gear.purchaseDate}</div>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            購入価格
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">¥{gear.purchasePrice.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            耐用年数
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{gear.lifespan} 年</div>
                    </CardContent>
                </Card>
            </div>

            {/* Depreciation Compact Card - Click to open modal */}
            <DepreciationCompactCard
                gear={gear}
                onClick={() => setDepreciationModalOpen(true)}
            />

            {/* Quick Actions & Market Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <ModelResearchButton gear={gear} />
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setResaleModalOpen(true)}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        売却シート作成
                    </Button>
                </div>
                <MarketLinks gear={gear} />
            </div>

            {/* Notes */}
            {gear.notes && (
                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle>備考</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {gear.notes}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Depreciation Detail Modal */}
            <DepreciationModal
                gear={gear}
                open={depreciationModalOpen}
                onOpenChange={setDepreciationModalOpen}
            />

            {resaleModalOpen && (
                <ResaleAssistantModal
                    gear={gear}
                    onClose={() => setResaleModalOpen(false)}
                />
            )}
        </div>
    );
}
