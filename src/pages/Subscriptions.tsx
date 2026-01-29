import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, DollarSign, RefreshCw, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Subscription, BillingCycle, SubscriptionCategory } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Subscriptions() {
    const { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription } = useSubscriptions();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        category: "Software", // Default text, technically type is SubscriptionCategory but we allow string input now
        price: "",
        billingCycle: "monthly" as BillingCycle,
        startDate: new Date().toISOString().split('T')[0],
        nextPaymentDate: new Date().toISOString().split('T')[0],
        autoRenew: true,
        notes: ""
    });

    const resetForm = () => {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
            name: "",
            category: "",
            price: "",
            billingCycle: "monthly",
            startDate: today,
            nextPaymentDate: today, // Will be updated by effect ideally or left as today if no date entered logic
            autoRenew: true,
            notes: ""
        });
        setEditingSubscription(null);
    };

    const handleOpenDialog = (subscription?: Subscription) => {
        if (subscription) {
            setEditingSubscription(subscription);
            setFormData({
                name: subscription.name,
                category: subscription.category,
                price: subscription.price.toString(),
                billingCycle: subscription.billingCycle,
                startDate: subscription.startDate,
                nextPaymentDate: subscription.nextPaymentDate,
                autoRenew: subscription.autoRenew,
                notes: subscription.notes || ""
            });
        } else {
            resetForm();
            // Initial auto-calc for new form will happen via useEffect if we trigger it, 
            // but let's set a reasonable default for nextPaymentDate based on today + 1 month
            const today = new Date();
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);
            setFormData(prev => ({
                ...prev,
                nextPaymentDate: nextMonth.toISOString().split('T')[0]
            }));
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    // Helper to calculate next payment date safely
    const calculateNextPaymentDate = (startDateStr: string, cycle: BillingCycle): string => {
        if (!startDateStr) return "";

        const [year, month, day] = startDateStr.split('-').map(Number);
        if (!year || !month || !day) return "";

        // Create date at noon to verify valid date
        const date = new Date(year, month - 1, day, 12, 0, 0);

        if (cycle === 'monthly') {
            const currentDay = date.getDate();
            date.setMonth(date.getMonth() + 1);

            // Handle month rollover (e.g., Jan 31 -> Feb 28/29 instead of Mar 2/3)
            if (date.getDate() !== currentDay) {
                date.setDate(0); // Set to last day of previous month
            }
        } else {
            date.setFullYear(date.getFullYear() + 1);
        }

        const nextYear = date.getFullYear();
        // Month is 0-indexed in JS Date, so +1. padStart ensures '05' format.
        const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
        const nextDay = String(date.getDate()).padStart(2, '0');

        return `${nextYear}-${nextMonth}-${nextDay}`;
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        const newNextPaymentDate = calculateNextPaymentDate(newStartDate, formData.billingCycle);
        setFormData(prev => ({
            ...prev,
            startDate: newStartDate,
            nextPaymentDate: newNextPaymentDate || prev.nextPaymentDate // Fallback to current if invalid
        }));
    };

    const handleBillingCycleChange = (value: BillingCycle) => {
        const newNextPaymentDate = calculateNextPaymentDate(formData.startDate, value);
        setFormData(prev => ({
            ...prev,
            billingCycle: value,
            nextPaymentDate: newNextPaymentDate || prev.nextPaymentDate
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            toast.error("名前と金額は必須です");
            return;
        }

        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) {
            toast.error("有効な金額を入力してください");
            return;
        }

        try {
            if (editingSubscription) {
                // Update existing
                await updateSubscription(editingSubscription.id, {
                    name: formData.name,
                    category: formData.category as SubscriptionCategory,
                    price: price,
                    billingCycle: formData.billingCycle,
                    startDate: formData.startDate,
                    nextPaymentDate: formData.nextPaymentDate,
                    autoRenew: formData.autoRenew,
                    notes: formData.notes
                });
                toast.success("サブスクリプションを更新しました");
            } else {
                // Create new
                await addSubscription({
                    name: formData.name,
                    category: formData.category as SubscriptionCategory,
                    price: price,
                    billingCycle: formData.billingCycle,
                    startDate: formData.startDate,
                    nextPaymentDate: formData.nextPaymentDate,
                    autoRenew: formData.autoRenew,
                    notes: formData.notes
                });
                toast.success("サブスクリプションを追加しました");
            }
            handleCloseDialog();
        } catch (error) {
            console.error(error);
            toast.error("保存に失敗しました");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`「${name}」を削除しますか？`)) {
            return;
        }

        try {
            await deleteSubscription(id);
            toast.success("削除しました");
        } catch (error) {
            console.error(error);
            toast.error("削除に失敗しました");
        }
    };

    // Calculate total costs
    const calculateMonthlyCost = () => {
        if (!subscriptions) return 0;
        return subscriptions.reduce((sum, sub) => {
            const monthlyCost = sub.billingCycle === 'monthly' ? sub.price : sub.price / 12;
            return sum + monthlyCost;
        }, 0);
    };

    const calculateYearlyCost = () => {
        if (!subscriptions) return 0;
        return subscriptions.reduce((sum, sub) => {
            const yearlyCost = sub.billingCycle === 'yearly' ? sub.price : sub.price * 12;
            return sum + yearlyCost;
        }, 0);
    };

    const getCategoryIcon = (_category: SubscriptionCategory) => {
        // Use DollarSign as default icon for all categories
        return DollarSign;
    };

    const getBillingCycleLabel = (cycle: BillingCycle) => {
        return cycle === 'monthly' ? '月額' : '年額';
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">サブスクリプション管理</h1>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" /> 新規追加
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                月額コスト（概算）
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">¥{calculateMonthlyCost().toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                年額課金を12ヶ月で割った値を含む
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                年間コスト（概算）
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">¥{calculateYearlyCost().toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                月額課金を12倍した値を含む
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Subscriptions List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : subscriptions && subscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subscriptions.map((sub) => {
                            const Icon = getCategoryIcon(sub.category);
                            const monthlyCost = sub.billingCycle === 'monthly' ? sub.price : sub.price / 12;

                            return (
                                <Card key={sub.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-2">
                                                <Icon className="h-5 w-5 text-primary mt-0.5" />
                                                <div>
                                                    <CardTitle className="text-base">{sub.name}</CardTitle>
                                                    <p className="text-xs text-muted-foreground">{sub.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    onClick={() => handleOpenDialog(sub)}
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 text-destructive"
                                                    onClick={() => handleDelete(sub.id, sub.name)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-2xl font-bold">¥{sub.price.toLocaleString()}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {getBillingCycleLabel(sub.billingCycle)}
                                            </span>
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            月額換算: ¥{Math.round(monthlyCost).toLocaleString()}
                                        </div>

                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            次回: {sub.nextPaymentDate}
                                        </div>

                                        {sub.autoRenew && (
                                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                <RefreshCw className="h-3 w-3" />
                                                自動更新
                                            </div>
                                        )}

                                        {sub.notes && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                                                {sub.notes}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">サブスクリプションがありません</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Adobe CC、Smaart、Pro Toolsなどの定期課金サービスを追加しましょう
                            </p>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> 最初のサブスクリプションを追加
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Add/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingSubscription ? "サブスクリプションを編集" : "新規サブスクリプション"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">サービス名 *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="例: Adobe Creative Cloud"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="category">カテゴリ</Label>
                                <Input
                                    id="category"
                                    list="category-options"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="例: Software, Plugin..."
                                />
                                <datalist id="category-options">
                                    <option value="Software" />
                                    <option value="Plugin" />
                                    <option value="Cloud Storage" />
                                    <option value="Streaming" />
                                    <option value="Other" />
                                </datalist>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="price">料金 *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="5000"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="mb-2 block">課金周期</Label>
                                <RadioGroup
                                    value={formData.billingCycle}
                                    onValueChange={(value) => handleBillingCycleChange(value as BillingCycle)}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="monthly" id="monthly" />
                                        <Label htmlFor="monthly">月額 (Monthly)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yearly" id="yearly" />
                                        <Label htmlFor="yearly">年額 (Yearly)</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate">開始日</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleStartDateChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="nextPaymentDate">次回支払日 (自動計算)</Label>
                                    <Input
                                        id="nextPaymentDate"
                                        type="date"
                                        value={formData.nextPaymentDate}
                                        onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="autoRenew"
                                    checked={formData.autoRenew}
                                    onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="autoRenew" className="font-normal">自動更新</Label>
                            </div>

                            <div>
                                <Label htmlFor="notes">メモ</Label>
                                <textarea
                                    id="notes"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="プラン詳細やライセンス情報など"
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    キャンセル
                                </Button>
                                <Button type="submit">
                                    {editingSubscription ? "更新" : "追加"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
