import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
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

export default function Subscriptions() {
    const subscriptions = useLiveQuery(() => db.subscriptions.toArray());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        category: "Software" as SubscriptionCategory,
        price: "",
        billingCycle: "monthly" as BillingCycle,
        startDate: new Date().toISOString().split('T')[0],
        nextPaymentDate: new Date().toISOString().split('T')[0],
        autoRenew: true,
        notes: ""
    });

    const resetForm = () => {
        setFormData({
            name: "",
            category: "Software",
            price: "",
            billingCycle: "monthly",
            startDate: new Date().toISOString().split('T')[0],
            nextPaymentDate: new Date().toISOString().split('T')[0],
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
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        resetForm();
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
                await db.subscriptions.update(editingSubscription.id, {
                    name: formData.name,
                    category: formData.category,
                    price: price,
                    billingCycle: formData.billingCycle,
                    startDate: formData.startDate,
                    nextPaymentDate: formData.nextPaymentDate,
                    autoRenew: formData.autoRenew,
                    notes: formData.notes,
                    updatedAt: Date.now()
                });
                toast.success("サブスクリプションを更新しました");
            } else {
                // Create new
                const newSubscription: Subscription = {
                    id: crypto.randomUUID(),
                    name: formData.name,
                    category: formData.category,
                    price: price,
                    billingCycle: formData.billingCycle,
                    startDate: formData.startDate,
                    nextPaymentDate: formData.nextPaymentDate,
                    autoRenew: formData.autoRenew,
                    notes: formData.notes,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                await db.subscriptions.add(newSubscription);
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
            await db.subscriptions.delete(id);
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
                {subscriptions && subscriptions.length > 0 ? (
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
                                <select
                                    id="category"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as SubscriptionCategory })}
                                >
                                    <option value="Software">Software</option>
                                    <option value="Plugin">Plugin</option>
                                    <option value="Cloud Storage">Cloud Storage</option>
                                    <option value="Streaming">Streaming</option>
                                    <option value="Other">Other</option>
                                </select>
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

                                <div>
                                    <Label htmlFor="billingCycle">課金周期</Label>
                                    <select
                                        id="billingCycle"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.billingCycle}
                                        onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as BillingCycle })}
                                    >
                                        <option value="monthly">月額</option>
                                        <option value="yearly">年額</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate">開始日</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="nextPaymentDate">次回支払日</Label>
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
