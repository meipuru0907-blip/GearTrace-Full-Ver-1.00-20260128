import { useState } from "react";
import { db } from "@/db";
import type { Gear } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorTagger } from "@/components/ColorTagger";
import { X } from "lucide-react";
import { toast } from "sonner";

interface EditGearModalProps {
    gear: Gear;
    onClose: () => void;
    onUpdate: () => void;
}

export function EditGearModal({ gear, onClose, onUpdate }: EditGearModalProps) {
    const [formData, setFormData] = useState<{
        name: string;
        manufacturer: string;
        model: string;
        category: string;
        subCategory: string;
        serialNumber: string;
        status: Gear['status'];
        purchaseDate: string;
        purchasePrice: number;
        lifespan: number;
        colorTag: string | undefined;
        notes: string;
    }>({
        name: gear.name,
        manufacturer: gear.manufacturer,
        model: gear.model,
        category: gear.category,
        subCategory: gear.subCategory || "",
        serialNumber: gear.serialNumber || "",
        status: gear.status,
        purchaseDate: gear.purchaseDate,
        purchasePrice: gear.purchasePrice,
        lifespan: gear.lifespan,
        colorTag: gear.colorTag || undefined,
        notes: gear.notes || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Convert empty string to undefined, otherwise cast to proper Gear colorTag type
            const colorTagValue: Gear['colorTag'] = !formData.colorTag || formData.colorTag === ""
                ? undefined
                : formData.colorTag as Gear['colorTag'];

            await db.gear.update(gear.id, {
                ...formData,
                colorTag: colorTagValue,
                updatedAt: Date.now(),
            });

            toast.success("機材情報を更新しました");
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("更新に失敗しました");
        }
    };

    return (
        <>
            {/* Modal Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div
                    className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
                        <h2 className="text-xl font-bold">機材情報を編集</h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-manufacturer">メーカー *</Label>
                                <Input
                                    id="edit-manufacturer"
                                    value={formData.manufacturer}
                                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-model">モデル名 *</Label>
                                <Input
                                    id="edit-model"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit-name">機材名（自由記述）</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="例: メインボーカル用"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-category">カテゴリ *</Label>
                                <select
                                    id="edit-category"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="Microphone">Microphone</option>
                                    <option value="Speaker">Speaker</option>
                                    <option value="Mixer">Mixer</option>
                                    <option value="Amplifier">Amplifier</option>
                                    <option value="Cable">Cable</option>
                                    <option value="Accessory">Accessory</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="edit-subcategory">サブカテゴリ</Label>
                                <Input
                                    id="edit-subcategory"
                                    value={formData.subCategory}
                                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                    placeholder="例: Dynamic"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit-serialNumber">シリアル番号</Label>
                            <Input
                                id="edit-serialNumber"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                placeholder="例: ABC123456"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-status">ステータス *</Label>
                                <select
                                    id="edit-status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Gear['status'] })}
                                    required
                                >
                                    <option value="Available">Available</option>
                                    <option value="InUse">InUse</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Broken">Broken</option>
                                    <option value="Sold">Sold</option>
                                    <option value="Repair">Repair</option>
                                    <option value="Missing">Missing</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="edit-colorTag">識別タグ</Label>
                                <div className="pt-2">
                                    <ColorTagger
                                        selectedColor={formData.colorTag}
                                        onSelect={(c) => setFormData({ ...formData, colorTag: c === "" ? undefined : c })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-purchaseDate">購入日 *</Label>
                                <Input
                                    id="edit-purchaseDate"
                                    type="date"
                                    value={formData.purchaseDate}
                                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-purchasePrice">購入価格 (円) *</Label>
                                <Input
                                    id="edit-purchasePrice"
                                    type="number"
                                    value={formData.purchasePrice}
                                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="edit-lifespan">耐用年数 *</Label>
                            <Input
                                id="edit-lifespan"
                                type="number"
                                value={formData.lifespan}
                                onChange={(e) => setFormData({ ...formData, lifespan: Number(e.target.value) })}
                                required
                                min="1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                通常は5年、音響機器は減価償却時に考慮されます
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="edit-notes">メモ</Label>
                            <textarea
                                id="edit-notes"
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="補足情報など"
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="flex gap-2 justify-end pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose}>
                                キャンセル
                            </Button>
                            <Button type="submit">
                                更新
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
