import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { differenceInDays, format, addYears } from "date-fns";
import type { Gear } from "@/types";
import { TrendingDown, CalendarClock, Calculator, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DepreciationHelpModal } from "./DepreciationHelpModal";
import { useState } from "react";

interface DepreciationCardProps {
    gear: Gear;
}

export function DepreciationCard({ gear }: DepreciationCardProps) {
    const [showHelp, setShowHelp] = useState(false);
    const lifespan = gear.lifespan || 5; // Default 5 years if not set

    // Guard: Validate purchase date
    const purchaseDate = new Date(gear.purchaseDate);
    const isValidDate = !isNaN(purchaseDate.getTime()) && purchaseDate.getFullYear() > 1900 && purchaseDate.getFullYear() < 2100;

    if (!isValidDate) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        減価償却シミュレーター (定額法)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground text-center py-8">
                        購入日が未設定または無効です。機材情報を入力してください。
                    </div>
                </CardContent>
            </Card>
        );
    }

    const purchasePrice = gear.purchasePrice;

    // Japanese Tax Law: 1 yen limit for fully depreciated assets
    const residualValue = 1;

    // Calc elapsed time
    const today = new Date();
    const daysElapsed = differenceInDays(today, purchaseDate);
    const totalDays = lifespan * 365.25;

    // Progress (0 to 1)
    let progress = Math.max(0, Math.min(1, daysElapsed / totalDays));

    // Current Book Value (Straight-line)
    let currentBookValue = Math.floor(purchasePrice * (1 - progress));

    // Helper: If fully depreciated, set to 1 yen
    if (progress >= 1) {
        currentBookValue = residualValue;
    }

    const depreciationEnd = addYears(purchaseDate, lifespan);
    const isFullyDepreciated = progress >= 1;

    return (
        <>
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-primary" />
                            減価償却シミュレーター (定額法)
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setShowHelp(true)}
                        >
                            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted/40 rounded-lg">
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                    <TrendingDown className="h-3 w-3" /> 現在の帳簿価額
                                </div>
                                <div className="text-2xl font-bold">
                                    ¥{currentBookValue.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    取得: ¥{purchasePrice.toLocaleString()}
                                </div>
                            </div>
                            <div className="p-3 bg-muted/40 rounded-lg">
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                    <CalendarClock className="h-3 w-3" /> 償却完了予定
                                </div>
                                <div className="text-xl font-bold">
                                    {format(depreciationEnd, 'yyyy年MM月')}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    耐用年数: {lifespan}年
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>償却率: {Math.floor(progress * 100)}%</span>
                                <span>{isFullyDepreciated ? "償却完了" : "償却中"}</span>
                            </div>
                            {/* Simple Progress Bar */}
                            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${progress * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                                <span>{format(purchaseDate, 'yyyy/MM')}</span>
                                <span>{format(depreciationEnd, 'yyyy/MM')}</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="text-xs text-muted-foreground bg-accent/20 p-2 rounded">
                            ※ 最終的な償却額は1円（備忘価額）まで計算されます。実際の税務処理とは端数処理などで異なる場合があります。
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Help Modal */}
            {showHelp && <DepreciationHelpModal onClose={() => setShowHelp(false)} />}
        </>
    );
}
