import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { differenceInDays, format, addYears } from "date-fns";
import type { Gear } from "@/types";
import { TrendingDown, CalendarClock, Calculator, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DepreciationModalProps {
    gear: Gear;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * DepreciationModal Component
 * 
 * Detailed depreciation simulator view.
 * Displays comprehensive financial information including:
 * - Year-by-year depreciation breakdown
 * - Graph visualization
 * - Calculation methodology
 * - Tax implications
 */
export function DepreciationModal({ gear, open, onOpenChange }: DepreciationModalProps) {
    const lifespan = gear.lifespan || 5;

    // Guard: Validate purchase date
    const purchaseDate = new Date(gear.purchaseDate);
    const isValidDate = !isNaN(purchaseDate.getTime()) && purchaseDate.getFullYear() > 1900 && purchaseDate.getFullYear() < 2100;

    if (!isValidDate) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-primary" />
                            減価償却シミュレーター (定額法)
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-8 text-center text-muted-foreground">
                        購入日が未設定または無効です。機材情報を編集してください。
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const purchasePrice = gear.purchasePrice;
    const residualValue = 1; // 備忘価額
    const today = new Date();
    const daysElapsed = differenceInDays(today, purchaseDate);
    const totalDays = lifespan * 365.25;

    let progress = Math.max(0, Math.min(1, daysElapsed / totalDays));
    let currentBookValue = Math.floor(purchasePrice * (1 - progress));

    if (progress >= 1) {
        currentBookValue = residualValue;
    }

    const depreciationEnd = addYears(purchaseDate, lifespan);
    const isFullyDepreciated = progress >= 1;
    const annualDepreciation = Math.floor((purchasePrice - residualValue) / lifespan);
    const monthlyDepreciation = Math.floor(annualDepreciation / 12);

    // Calculate year-by-year breakdown
    const yearlyBreakdown = Array.from({ length: lifespan }, (_, i) => {
        const year = purchaseDate.getFullYear() + i;
        const yearEndValue = Math.max(residualValue, purchasePrice - annualDepreciation * (i + 1));
        return {
            year,
            depreciation: i === lifespan - 1 ? (purchasePrice - residualValue - annualDepreciation * i) : annualDepreciation,
            bookValue: yearEndValue
        };
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        減価償却シミュレーター (定額法)
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Summary Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <TrendingDown className="h-4 w-4" />
                                現在の帳簿価額
                            </div>
                            <div className="text-3xl font-bold">
                                ¥{currentBookValue.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                取得: ¥{purchasePrice.toLocaleString()}
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <CalendarClock className="h-4 w-4" />
                                償却完了予定
                            </div>
                            <div className="text-2xl font-bold">
                                {format(depreciationEnd, 'yyyy年MM月')}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                耐用年数: {lifespan}年
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground mb-2">
                                年間償却額
                            </div>
                            <div className="text-2xl font-bold">
                                ¥{annualDepreciation.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                月額: ¥{monthlyDepreciation.toLocaleString()}
                            </div>
                        </Card>
                    </div>

                    {/* Progress Visualization */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>償却進捗</span>
                            <span className={isFullyDepreciated ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}>
                                {Math.floor(progress * 100)}% {isFullyDepreciated ? "（完了）" : ""}
                            </span>
                        </div>
                        <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${isFullyDepreciated ? "bg-green-500" : "bg-primary"}`}
                                style={{ width: `${progress * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{format(purchaseDate, 'yyyy年MM月')}</span>
                            <span>{format(depreciationEnd, 'yyyy年MM月')}</span>
                        </div>
                    </div>

                    {/* Yearly Breakdown Table */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">年度別償却内訳</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="p-2 text-left font-medium">年度</th>
                                        <th className="p-2 text-right font-medium">償却額</th>
                                        <th className="p-2 text-right font-medium">期末帳簿価額</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {yearlyBreakdown.map((row, index) => (
                                        <tr key={row.year} className={index === yearlyBreakdown.length - 1 ? "bg-accent/20" : ""}>
                                            <td className="p-2">{row.year}年</td>
                                            <td className="p-2 text-right font-mono">¥{row.depreciation.toLocaleString()}</td>
                                            <td className="p-2 text-right font-mono font-semibold">¥{row.bookValue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Info Panel */}
                    <Card className="p-4 bg-accent/30">
                        <div className="flex gap-2">
                            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>
                                    <strong>定額法</strong>: 毎年一定額を償却する計算方法です。
                                </p>
                                <p>
                                    <strong>備忘価額</strong>: 最終的な帳簿価額は1円まで償却されます（日本の税法に準拠）。
                                </p>
                                <p className="text-yellow-700 dark:text-yellow-400">
                                    ※ このシミュレーションは簡易計算です。実際の税務申告では、端数処理や月割計算が異なる場合があります。正確な金額は税理士にご相談ください。
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
