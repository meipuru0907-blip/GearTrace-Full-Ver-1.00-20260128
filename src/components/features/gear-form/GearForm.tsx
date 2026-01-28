import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorTagger } from "@/components/ColorTagger";

import type { Gear } from "@/types";
import { Save, ChevronLeft } from "lucide-react";
import { getStatusOptions } from "@/utils/constants";

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


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
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
                        <Input // Switched to Input with datalist or just Input for flexibility based on AddGear vs Edit differences, but keeping simple for now
                            // Edit used select, Add used Input. Let's standardize on Input with suggestions or Select. 
                            // Guideline says: "Consistency". Let's use Select as it's cleaner.
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
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
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
                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2 mb-4">ステータス・識別</h3>
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
                            value={formData.purchasePrice}
                            onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lifespan">耐用年数 *</Label>
                        <Input
                            id="lifespan"
                            type="number"
                            value={formData.lifespan}
                            onChange={(e) => setFormData({ ...formData, lifespan: Number(e.target.value) })}
                            required
                            min="1"
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
