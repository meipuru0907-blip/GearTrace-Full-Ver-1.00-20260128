import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, CalendarDays, DollarSign } from "lucide-react";
import type { Gear, Subscription } from "@/types";
import { getStatusLabel } from "@/utils/constants";

interface FinanceAnalysisModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTab?: 'assets' | 'costs';
    gears: Gear[];
    subscriptions: Subscription[];
}

/**
 * FinanceAnalysisModal Component
 * 
 * Detailed financial analysis modal for Dashboard.
 * Displays:
 * - Asset breakdown by category and status
 * - Running costs breakdown (subscriptions)
 * - Depreciation summary
 */
export function FinanceAnalysisModal({
    open,
    onOpenChange,
    defaultTab = 'assets',
    gears,
    subscriptions
}: FinanceAnalysisModalProps) {
    // Asset calculations
    const totalAssetValue = gears.reduce((sum, g) => sum + g.purchasePrice, 0);

    // Category breakdown
    const categoryBreakdown = gears.reduce((acc, gear) => {
        const category = gear.category || 'その他';
        if (!acc[category]) {
            acc[category] = { count: 0, value: 0 };
        }
        acc[category].count += 1;
        acc[category].value += gear.purchasePrice;
        return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Status breakdown
    const statusBreakdown = gears.reduce((acc, gear) => {
        const status = gear.status;
        if (!acc[status]) {
            acc[status] = { count: 0, value: 0 };
        }
        acc[status].count += 1;
        acc[status].value += gear.purchasePrice;
        return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Subscription calculations
    const monthlySubscriptions = subscriptions.filter(s => s.billingCycle === 'monthly');
    const yearlySubscriptions = subscriptions.filter(s => s.billingCycle === 'yearly');

    const monthlyTotal = monthlySubscriptions.reduce((sum, s) => sum + s.price, 0);
    const yearlyAsMonthly = yearlySubscriptions.reduce((sum, s) => sum + (s.price / 12), 0);
    const totalMonthlyCost = monthlyTotal + yearlyAsMonthly;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        財務分析
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="assets">資産分析</TabsTrigger>
                        <TabsTrigger value="costs">ランニングコスト</TabsTrigger>
                    </TabsList>

                    {/* Assets Tab */}
                    <TabsContent value="assets" className="space-y-4 mt-4">
                        {/* Total Summary */}
                        <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">総資産価値</p>
                                        <p className="text-3xl font-bold">¥{totalAssetValue.toLocaleString()}</p>
                                    </div>
                                    <Package className="h-12 w-12 text-primary opacity-20" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {gears.length}個の機材
                                </p>
                            </CardContent>
                        </Card>

                        {/* Category Breakdown */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3">カテゴリ別内訳</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="p-2 text-left font-medium">カテゴリ</th>
                                            <th className="p-2 text-right font-medium">機材数</th>
                                            <th className="p-2 text-right font-medium">合計価値</th>
                                            <th className="p-2 text-right font-medium">割合</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {Object.entries(categoryBreakdown)
                                            .sort(([, a], [, b]) => b.value - a.value)
                                            .map(([category, data]) => (
                                                <tr key={category}>
                                                    <td className="p-2 font-medium">{category}</td>
                                                    <td className="p-2 text-right">{data.count}個</td>
                                                    <td className="p-2 text-right font-mono">¥{data.value.toLocaleString()}</td>
                                                    <td className="p-2 text-right text-muted-foreground">
                                                        {((data.value / totalAssetValue) * 100).toFixed(1)}%
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Status Breakdown */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3">ステータス別内訳</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(statusBreakdown).map(([status, data]) => (
                                    <Card key={status}>
                                        <CardContent className="p-3">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {getStatusLabel(status as any)}
                                            </p>
                                            <p className="text-lg font-bold">
                                                {data.count}個
                                            </p>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                ¥{data.value.toLocaleString()}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Costs Tab */}
                    <TabsContent value="costs" className="space-y-4 mt-4">
                        {/* Total Summary */}
                        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">月間ランニングコスト</p>
                                        <p className="text-3xl font-bold">¥{Math.round(totalMonthlyCost).toLocaleString()}</p>
                                    </div>
                                    <DollarSign className="h-12 w-12 text-blue-500 opacity-20" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {subscriptions.length}個のサブスクリプション
                                </p>
                            </CardContent>
                        </Card>

                        {/* Billing Cycle Summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        月額払い
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">¥{monthlyTotal.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {monthlySubscriptions.length}件
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        年額払い
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">¥{Math.round(yearlyAsMonthly).toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {yearlySubscriptions.length}件 (月額換算)
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Subscription List */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3">サブスクリプション一覧</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="p-2 text-left font-medium">サービス</th>
                                            <th className="p-2 text-right font-medium">支払額</th>
                                            <th className="p-2 text-right font-medium">周期</th>
                                            <th className="p-2 text-right font-medium">月額換算</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {subscriptions.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                                    サブスクリプションが登録されていません
                                                </td>
                                            </tr>
                                        ) : (
                                            subscriptions.map((sub) => (
                                                <tr key={sub.id}>
                                                    <td className="p-2 font-medium">{sub.name}</td>
                                                    <td className="p-2 text-right font-mono">¥{sub.price.toLocaleString()}</td>
                                                    <td className="p-2 text-right">
                                                        {sub.billingCycle === 'monthly' ? '月額' : '年額'}
                                                    </td>
                                                    <td className="p-2 text-right font-mono">
                                                        ¥{Math.round(sub.billingCycle === 'monthly' ? sub.price : sub.price / 12).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Annual Summary */}
                        <Card className="bg-accent/30">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarDays className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold">年間コスト予測</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    ¥{Math.round(totalMonthlyCost * 12).toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    月額 ¥{Math.round(totalMonthlyCost).toLocaleString()} × 12ヶ月
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
