import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorTagger } from "@/components/ColorTagger";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import type { Gear } from "@/types";
import { Save, ChevronLeft } from "lucide-react";
import { getStatusOptions, getAllStatuses, GEAR_STATUS_LABELS } from "@/utils/constants";

export interface GearFormValues {
    manufacturer: string;
    model: string;
    name: string;
    category: string;
    subCategory: string;
    serialNumber: string;
    status: Gear['status'];
    purchaseDate: string;
    purchasePrice: number;
    lifespan: number;
    colorTag: string | undefined;
    notes: string;
    quantity: number;
    isContainer: boolean;
    containerId: string | undefined;
    // New field for splitting
    statusBreakdown?: Record<string, number>;
}

interface GearFormProps {
    defaultValues: Partial<GearFormValues>;
    onSubmit: (values: GearFormValues) => void;
    onCancel: () => void;
    submitLabel?: string;
}

export function GearForm({ defaultValues, onSubmit, onCancel, submitLabel = "保存" }: GearFormProps) {
    const [formData, setFormData] = useState<GearFormValues>({
        manufacturer: defaultValues.manufacturer || "",
        model: defaultValues.model || "",
        name: defaultValues.name || "",
        category: defaultValues.category || "",
        subCategory: defaultValues.subCategory || "",
        serialNumber: defaultValues.serialNumber || "",
        status: defaultValues.status || "Available",
        purchaseDate: defaultValues.purchaseDate || new Date().toISOString().split('T')[0],
        purchasePrice: defaultValues.purchasePrice || 0,
        lifespan: defaultValues.lifespan || 5,
        colorTag: defaultValues.colorTag || undefined,
        notes: defaultValues.notes || "",
        quantity: defaultValues.quantity || 1,
        isContainer: defaultValues.isContainer || false,
        containerId: defaultValues.containerId || undefined,
    });

    const [isSplitMode, setIsSplitMode] = useState(false);
    const [breakdown, setBreakdown] = useState<Record<string, number>>({});

    const handleBreakdownChange = (status: string, val: number) => {
        setBreakdown(prev => ({
            ...prev,
            [status]: val
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isSplitMode) {
            // Validate total
            const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
            if (total !== formData.quantity) {
                toast.error(`ステータス内訳の合計(${total})が総数量(${formData.quantity})と一致しません`);
                return;
            }
            // Filter out 0s
            const cleanBreakdown = Object.fromEntries(
                Object.entries(breakdown).filter(([_, v]) => v > 0)
            );
            onSubmit({ ...formData, statusBreakdown: cleanBreakdown });
        } else {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-card p-6 rounded-lg border space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2 mb-4">基本情報</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="manufacturer">メーカー *</Label>
                        <Input
                            id="manufacturer"
                            list="manufacturer-options"
                            placeholder="e.g. Shure"
                            value={formData.manufacturer}
                            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                            required
                        />
                        <datalist id="manufacturer-options">
                            <option value="Shure" />
                            <option value="Sennheiser" />
                            <option value="Audio-Technica" />
                            <option value="Yamaha" />
                            <option value="Sony" />
                            <option value="Bose" />
                            <option value="JBL" />
                            <option value="Behringer" />
                            <option value="Roland" />
                            <option value="AKG" />
                        </datalist>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model">モデル名 *</Label>
                        <Input
                            id="model"
                            placeholder="e.g. SM58"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">カテゴリ *</Label>
                        <Input
                            id="category"
                            list="category-options"
                            placeholder="e.g. Microphone"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        />
                        <datalist id="category-options">
                            <option value="Microphone" />
                            <option value="Speaker" />
                            <option value="Mixer" />
                            <option value="Amplifier" />
                            <option value="Cable" />
                            <option value="Accessory" />
                            <option value="Other" />
                        </datalist>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subCategory">サブカテゴリ</Label>
                        <Input
                            id="subCategory"
                            placeholder="e.g. Dynamic"
                            value={formData.subCategory}
                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Inventory Section */}
            <div className="bg-card p-6 rounded-lg border space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2 mb-4">数量</h3>
                <div className="space-y-2">
                    <Label htmlFor="quantity">数量 (本/個)</Label>
                    <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity === 0 ? '' : formData.quantity}
                        onChange={(e) => {
                            const val = e.target.value;
                            const num = val === '' ? 0 : parseInt(val);
                            setFormData({ ...formData, quantity: Math.max(0, num) });
                        }}
                    />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="isContainer"
                        checked={formData.isContainer}
                        onChange={(e) => setFormData({ ...formData, isContainer: e.target.checked })}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="isContainer" className="text-sm font-medium leading-none cursor-pointer">
                            これはコンテナ（ケース/ラック）です
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            他の機材を収納する場合にチェックを入れてください
                        </p>
                    </div>
                </div>
            </div>

            {/* Status & ID */}
            <div className="bg-card p-6 rounded-lg border space-y-4">
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">ステータス・識別</h3>
                    {formData.quantity >= 2 && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="splitMode"
                                checked={isSplitMode}
                                onCheckedChange={(c) => {
                                    setIsSplitMode(!!c);
                                    if (c) {
                                        // Init breakdown with current status
                                        setBreakdown({ [formData.status]: formData.quantity });
                                    } else {
                                        setBreakdown({});
                                    }
                                }}
                            />
                            <Label htmlFor="splitMode" className="cursor-pointer text-xs">ステータスを振り分ける</Label>
                        </div>
                    )}
                </div>

                {isSplitMode ? (
                    <div className="space-y-4 bg-muted/30 p-4 rounded-md">
                        <p className="text-xs text-muted-foreground mb-2">
                            合計数量: {formData.quantity} になるように割り振ってください
                        </p>
                        {getAllStatuses().map(status => (
                            <div key={status} className="flex items-center justify-between gap-4">
                                <Label className="w-32">{GEAR_STATUS_LABELS[status]}</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    className="h-8"
                                    value={breakdown[status] === 0 || !breakdown[status] ? '' : breakdown[status]}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const num = val === '' ? 0 : parseInt(val);
                                        handleBreakdownChange(status, Math.max(0, num));
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        ))}
                        <div className="flex justify-end pt-2 border-t mt-2">
                            <span className={cn("text-sm font-bold",
                                Object.values(breakdown).reduce((a, b) => a + b, 0) === formData.quantity
                                    ? "text-green-600"
                                    : "text-red-500"
                            )}>
                                現在計: {Object.values(breakdown).reduce((a, b) => a + b, 0)} / {formData.quantity}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">ステータス *</Label>
                            <select
                                id="status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Gear['status'] })}
                                required
                            >
                                {getStatusOptions().map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>識別タグ</Label>
                            <div className="pt-2">
                                <ColorTagger
                                    selectedColor={formData.colorTag}
                                    onSelect={(c) => setFormData({ ...formData, colorTag: c === "" ? undefined : c })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="serialNumber">シリアル番号</Label>
                    <Input
                        id="serialNumber"
                        placeholder="e.g. ABC123456"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    />
                </div>
            </div>

            {/* Financials */}
            <div className="bg-card p-6 rounded-lg border space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2 mb-4">購入・資産情報</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="purchaseDate">購入日 *</Label>
                        <Input
                            id="purchaseDate"
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="purchasePrice">購入価格 (円) *</Label>
                        <Input
                            id="purchasePrice"
                            type="number"
                            min="0"
                            value={formData.purchasePrice === 0 ? '' : formData.purchasePrice}
                            onChange={(e) => {
                                const val = e.target.value;
                                const num = val === '' ? 0 : parseInt(val);
                                setFormData({ ...formData, purchasePrice: Math.max(0, num) });
                            }}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lifespan">耐用年数 *</Label>
                        <Input
                            id="lifespan"
                            type="number"
                            min="0"
                            value={formData.lifespan === 0 ? '' : formData.lifespan}
                            onChange={(e) => {
                                const val = e.target.value;
                                const num = val === '' ? 0 : parseInt(val);
                                setFormData({ ...formData, lifespan: Math.max(0, num) });
                            }}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="bg-card p-6 rounded-lg border space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="notes">メモ</Label>
                    <textarea
                        id="notes"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="補足情報など"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> キャンセル
                </Button>
                <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" /> {submitLabel}
                </Button>
            </div>
        </form>
    );
}
