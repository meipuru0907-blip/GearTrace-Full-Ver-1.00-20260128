import { useState, useMemo } from "react";
import { useGear } from "@/hooks/useGear";
import { supabase } from "@/lib/supabase";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Gear } from "@/types";

interface ContainerContentEditorProps {
    container: Gear;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ContainerContentEditor({ container, open, onOpenChange, onSuccess }: ContainerContentEditorProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isInitialized, setIsInitialized] = useState(false);

    const { gears: allGearRaw } = useGear();

    const allGear = useMemo(() => {
        return allGearRaw ? allGearRaw.filter(g => g.id !== container.id) : [];
    }, [allGearRaw, container.id]);

    useMemo(() => {
        if (allGear && !isInitialized && open) {
            const currentContents = allGear
                .filter(g => g.containerId === container.id)
                .map(g => g.id);
            setSelectedIds(new Set(currentContents));
            setIsInitialized(true);
        }
    }, [allGear, isInitialized, container.id, open]);

    useMemo(() => {
        if (!open) {
            setIsInitialized(false);
            setSearchTerm("");
        }
    }, [open]);

    const filteredGear = useMemo(() => {
        if (!allGear) return [];

        const lowerTerm = searchTerm.toLowerCase();
        return allGear.filter(g =>
            g.manufacturer.toLowerCase().includes(lowerTerm) ||
            g.model.toLowerCase().includes(lowerTerm) ||
            g.category.toLowerCase().includes(lowerTerm)
        ).sort((a, b) => {
            const aInThis = a.containerId === container.id;
            const bInThis = b.containerId === container.id;
            if (aInThis && !bInThis) return -1;
            if (!aInThis && bInThis) return 1;
            return a.category.localeCompare(b.category) ||
                a.manufacturer.localeCompare(b.manufacturer) ||
                a.model.localeCompare(b.model);
        });
    }, [allGear, searchTerm, container.id]);

    const handleToggle = (gearId: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(gearId)) {
            newSet.delete(gearId);
        } else {
            newSet.add(gearId);
        }
        setSelectedIds(newSet);
    };

    const handleSave = async () => {
        if (!allGear) return;
        setIsSaving(true);

        try {
            const updates: Promise<any>[] = [];

            for (const gear of allGear) {
                const isSelected = selectedIds.has(gear.id);
                const currentContainerId = gear.containerId;

                if (isSelected && currentContainerId !== container.id) {
                    updates.push(supabase.from('gear').update({
                        container_id: container.id,
                        updated_at: new Date().toISOString()
                    }).eq('id', gear.id) as unknown as Promise<any>);
                }

                if (!isSelected && currentContainerId === container.id) {
                    updates.push(supabase.from('gear').update({
                        container_id: null,
                        updated_at: new Date().toISOString()
                    }).eq('id', gear.id) as unknown as Promise<any>);
                }
            }

            await Promise.all(updates);

            toast.success(`${updates.length}件のアイテムを更新しました`);
            if (onSuccess) onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to update container contents", error);
            toast.error("更新に失敗しました");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (allGear) {
            const currentContents = allGear
                .filter(g => g.containerId === container.id)
                .map(g => g.id);
            setSelectedIds(new Set(currentContents));
        }
    };

    const changesCount = useMemo(() => {
        if (!allGear) return 0;
        let count = 0;
        for (const gear of allGear) {
            const isSelected = selectedIds.has(gear.id);
            const isInContainer = gear.containerId === container.id;
            if (isSelected !== isInContainer) count++;
        }
        return count;
    }, [allGear, selectedIds, container.id]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        コンテナ内容編集: {container.name || `${container.manufacturer} ${container.model}`}
                    </DialogTitle>
                    <DialogDescription>
                        このコンテナに収納する機材を選択してください。
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2 py-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="機材を検索 (メーカー, モデル, カテゴリ)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={handleReset} title="リセット">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden border rounded-md">
                    <div className="bg-muted/50 p-2 text-xs font-medium grid grid-cols-[auto_1fr_auto] gap-4 items-center border-b">
                        <div className="w-8 text-center">選択</div>
                        <div>機材情報</div>
                        <div className="w-24 text-right pr-2">現状</div>
                    </div>
                    <div className="h-[50vh] overflow-y-auto">
                        <div className="divide-y relative">
                            {filteredGear.map(gear => {
                                const isSelected = selectedIds.has(gear.id);
                                const isOtherContainer = gear.containerId && gear.containerId !== container.id;

                                return (
                                    <div
                                        key={gear.id}
                                        className={`grid grid-cols-[auto_1fr_auto] gap-4 items-center p-3 hover:bg-muted/50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex justify-center w-8">
                                            <Checkbox
                                                checked={isSelected}
                                                // @ts-ignore - Checkbox component wraps native input, forcing it to accept standard onClick/onChange
                                                onClick={() => handleToggle(gear.id)}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">
                                                {gear.manufacturer} {gear.model}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex gap-2">
                                                <span>{gear.category}</span>
                                                {gear.isContainer && <Badge variant="outline" className="text-[10px] h-4 py-0">コンテナ</Badge>}
                                                {gear.quantity > 1 && <span className="bg-secondary text-secondary-foreground rounded-full px-1.5 py-0.5">x{gear.quantity}</span>}
                                            </div>
                                        </div>
                                        <div className="w-32 text-right pr-2">
                                            {gear.containerId === container.id ? (
                                                <Badge variant="default" className="text-[10px]">このコンテナ</Badge>
                                            ) : isOtherContainer ? (
                                                <Badge variant="secondary" className="text-[10px] truncate max-w-[100px]" title="他のコンテナに収納中">
                                                    他のコンテナ
                                                </Badge>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredGear.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    該当する機材が見つかりません
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-between items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                        {selectedIds.size} 個選択中
                        {changesCount > 0 && <span className="ml-2 text-blue-600 font-bold">({changesCount}件の変更)</span>}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
                        <Button onClick={handleSave} disabled={isSaving || changesCount === 0}>
                            {isSaving ? "保存中..." : "変更を保存"}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
