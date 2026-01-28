import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Printer, Plus, Minus, Package, Boxes, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { PdfService } from "@/lib/printing/pdf-generator";
import { ContainerContentEditor } from "@/components/gear/ContainerContentEditor";
import { LabelPrintModal } from "@/components/gear/LabelPrintModal";
import type { Gear } from "@/types";

export default function PackingListDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [editingContainer, setEditingContainer] = useState<Gear | null>(null);
    const [printingLabelContainer, setPrintingLabelContainer] = useState<Gear | null>(null);

    const list = useLiveQuery(async () => {
        if (!id) return null;
        return await db.packingLists.get(Number(id));
    }, [id]);

    const numericId = Number(id);

    const gearList = useLiveQuery(() => db.gear.orderBy('category').toArray());

    // Helper to count quantities in the list
    const getGearCounts = (gearIds: string[] = []) => {
        return gearIds.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    };

    const gearCounts = getGearCounts(list?.gearIds);

    const handleAddGear = async (gear: Gear) => {
        if (!list) return;
        const currentCount = gearCounts[gear.id] || 0;

        // Limit to owned quantity
        if (currentCount >= (gear.quantity || 1)) {
            toast.error(`在庫数量(${gear.quantity || 1})を超えています`);
            return;
        }

        const newGearIds = [...(list.gearIds || []), gear.id];
        await updateList(newGearIds);
    };

    const handleRemoveGear = async (gearId: string) => {
        if (!list || !list.gearIds) return;

        // Remove only one instance of the ID
        const index = list.gearIds.indexOf(gearId);
        if (index > -1) {
            const newGearIds = [...list.gearIds];
            newGearIds.splice(index, 1);
            await updateList(newGearIds);
        }
    };

    const handleUnpackContainer = async (containerId: string) => {
        if (!list || !gearList) return;

        // Find contents
        const contents = gearList.filter(g => g.containerId === containerId);
        if (contents.length === 0) {
            toast.info("中身が空です");
            return;
        }

        const newGearIds = [...(list.gearIds || [])];
        let addedCount = 0;

        contents.forEach(item => {
            // Check current count in list
            // Optimization: Re-calculating counts here is a bit expensive but safe
            const currentCountInList = newGearIds.filter(id => id === item.id).length;
            const available = (item.quantity || 1) - currentCountInList;

            if (available > 0) {
                // Add as many as possible/needed. Here just add 1 for "unpacking" action
                // Or should we add ALL inventory of that item? Usually 1 set.
                newGearIds.push(item.id);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            await updateList(newGearIds);
            toast.success(`${addedCount}個のアイテムをリストに追加しました`);
        } else {
            toast.info("追加できるアイテムがありません（在庫上限）");
        }
    };

    const updateList = async (gearIds: string[]) => {
        await db.packingLists.update(numericId, {
            gearIds,
            updatedAt: Date.now()
        });
    };

    const handleDelete = async () => {
        if (!confirm("本当に削除しますか？")) return;
        await db.packingLists.delete(numericId);
        toast.success("リストを削除しました");
        navigate("/packing-lists");
    };

    const handlePrint = async () => {
        if (!list || !gearList) return;

        // Get unique gears in list and map to structure with count
        const uniqueIds = Array.from(new Set(list.gearIds));
        const items = uniqueIds.map(id => {
            const gear = gearList.find(g => g.id === id);
            return gear ? { gear, count: gearCounts[id] || 0 } : null;
        }).filter((item): item is { gear: Gear; count: number } => item !== null);

        try {
            await PdfService.exportPackingList(list, items);
            toast.success("PDFを出力しました");
        } catch (error) {
            console.error(error);
            toast.error("PDF出力に失敗しました");
        }
    };

    // Filter gear
    const filteredGear = gearList?.filter(g =>
        g.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (!list) return <Layout><div className="p-8">Loading...</div></Layout>;

    const totalItems = list.gearIds?.length || 0;

    return (
        <Layout>
            <div className="space-y-6 animate-in fade-in pb-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/packing-lists")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight">{list.name}</h1>
                        <p className="text-muted-foreground">{list.date} • {totalItems} items</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> PDF出力
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" /> 削除
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Gear Selection */}
                    <Card className="md:col-span-2 h-[calc(100vh-200px)] flex flex-col">
                        <CardHeader>
                            <CardTitle>機材を選択</CardTitle>
                            <Input
                                placeholder="機材を検索..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto p-0">
                            <div className="divide-y">
                                {filteredGear.map(g => {
                                    const count = gearCounts[g.id] || 0;
                                    const max = g.quantity || 1;
                                    const isMaxed = count >= max;

                                    return (
                                        <div
                                            key={g.id}
                                            className={`flex items-center gap-3 p-4 hover:bg-muted/50 ${count > 0 ? 'bg-primary/5' : ''}`}
                                        >
                                            <div className="flex flex-col items-center gap-1 w-20 flex-shrink-0">
                                                <div className="flex items-center border rounded-md overflow-hidden bg-background">
                                                    <button
                                                        className="px-2 py-1 hover:bg-muted disabled:opacity-30"
                                                        onClick={() => handleRemoveGear(g.id)}
                                                        disabled={count === 0}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <div className="w-8 text-center text-sm font-medium border-x">
                                                        {count}
                                                    </div>
                                                    <button
                                                        className="px-2 py-1 hover:bg-muted disabled:opacity-30"
                                                        onClick={() => handleAddGear(g)}
                                                        disabled={isMaxed}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    在庫: {max}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium truncate">{g.manufacturer} {g.model}</span>
                                                    {g.isContainer && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                                                            <Package className="h-3 w-3 mr-1" /> Container
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {g.category} • {g.serialNumber || 'N/A'}
                                                </div>
                                            </div>

                                            {/* Container Helper Actions */}
                                            {g.isContainer && (
                                                <div className="flex items-center gap-1">
                                                    {count > 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-xs"
                                                            onClick={() => handleUnpackContainer(g.id)}
                                                            title="中身を一括追加"
                                                        >
                                                            <Boxes className="h-4 w-4 mr-1" /> 中身追加
                                                        </Button>
                                                    )}

                                                    {/* Label Print Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPrintingLabelContainer(g);
                                                        }}
                                                        title="ラベル発行"
                                                    >
                                                        <Printer className="h-4 w-4 text-muted-foreground" />
                                                    </Button>

                                                    {/* Contents Edit Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingContainer(g);
                                                        }}
                                                        title="コンテナの中身を編集"
                                                    >
                                                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            )}

                                            <div className={`flex-shrink-0 text-xs px-2 py-1 rounded-full border ${g.status === 'Available' ? 'bg-green-100 text-green-700 border-green-200' :
                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                }`}>
                                                {g.status}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Selected List Summary */}
                    <Card className="h-fit max-h-[calc(100vh-200px)] flex flex-col">
                        <CardHeader>
                            <CardTitle>持ち出しリスト ({totalItems})</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-auto flex-1">
                            <div className="space-y-4">
                                {list.gearIds && list.gearIds.length > 0 ? (
                                    <div className="space-y-2">
                                        {Array.from(new Set(list.gearIds)).map(id => {
                                            const g = gearList?.find(item => item.id === id);
                                            if (!g) return null;
                                            const count = gearCounts[id];

                                            // Find contents count if it's a container
                                            // This is purely for display context
                                            const contentsCount = gearList?.filter(c => c.containerId === g.id && list.gearIds?.includes(c.id)).reduce((acc, c) => acc + (gearCounts[c.id] || 0), 0);

                                            return (
                                                <div key={id} className="flex justify-between items-start border-b pb-2 last:border-0 group">
                                                    <div className="flex-1 min-w-0 mr-4">
                                                        <div className="text-sm font-medium flex items-center gap-2">
                                                            <span className="truncate">{g.manufacturer} {g.model}</span>
                                                            <span className="inline-flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold px-1.5 min-w-[1.25rem] h-5 rounded-full">
                                                                {count}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {g.category}
                                                            {g.isContainer && contentsCount ? ` • Includes ${contentsCount} items` : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            className="text-muted-foreground hover:text-destructive p-1"
                                                            onClick={async () => {
                                                                // Remove ALL instances of this ID
                                                                const newIds = list.gearIds?.filter(existingId => existingId !== id) || [];
                                                                await updateList(newIds);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground text-center py-8">
                                        機材が選択されていません
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Container Editor Modal */}
            {editingContainer && (
                <ContainerContentEditor
                    container={editingContainer}
                    open={!!editingContainer}
                    onOpenChange={(open) => !open && setEditingContainer(null)}
                    onSuccess={() => {
                        // Optional: Refresh any derived state if needed
                    }}
                />
            )}

            {/* Label Print Modal */}
            {printingLabelContainer && (
                <LabelPrintModal
                    gear={printingLabelContainer}
                    onClose={() => setPrintingLabelContainer(null)}
                />
            )}
        </Layout >
    );
}
