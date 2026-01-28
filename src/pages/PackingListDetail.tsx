import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PackingListDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const list = useLiveQuery(async () => {
        if (!id) return null;
        return await db.packingLists.get(Number(id)); // id is number in Dexie logic if auto-increment, but UUID string in types? Check types.
    });

    // Check if ID is string (UUID) or number (auto-increment) based on type definition vs implementation
    // types.ts says string, but db.ts says ++id which is number. Dexie ++id is number.
    // The type definition might be wrong or I should cast. Let's assume number for Dexie ++id.
    const numericId = Number(id);

    const gearList = useLiveQuery(() => db.gear.orderBy('category').toArray());

    const handleToggleGear = async (gearId: string) => {
        if (!list) return;
        const currentGearIds = list.gearIds || [];
        const newGearIds = currentGearIds.includes(gearId)
            ? currentGearIds.filter(id => id !== gearId)
            : [...currentGearIds, gearId];

        await db.packingLists.update(numericId, {
            gearIds: newGearIds,
            updatedAt: Date.now()
        });
    };

    const handleDelete = async () => {
        if (!confirm("本当に削除しますか？")) return;
        await db.packingLists.delete(numericId);
        toast.success("リストを削除しました");
        navigate("/packing-lists");
    };

    const handlePrint = () => {
        if (!list || !gearList) return;
        const selectedGear = gearList.filter(g => list.gearIds?.includes(g.id));

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(list.name, 20, 20);
        doc.setFontSize(12);
        doc.text(`日付: ${list.date}`, 20, 30);
        doc.text(`機材数: ${selectedGear.length}`, 20, 38);

        const tableData = selectedGear.map(g => [
            g.category,
            g.manufacturer,
            g.model,
            g.serialNumber || '-'
        ]);

        autoTable(doc, {
            startY: 45,
            head: [['Category', 'Manufacturer', 'Model', 'Serial']],
            body: tableData,
        });

        doc.save(`${list.name}.pdf`);
    };

    // Filter gear
    const filteredGear = gearList?.filter(g =>
        g.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (!list) return <Layout><div className="p-8">Loading...</div></Layout>;

    const selectedCount = list.gearIds?.length || 0;

    return (
        <Layout>
            <div className="space-y-6 animate-in fade-in pb-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/packing-lists")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight">{list.name}</h1>
                        <p className="text-muted-foreground">{list.date} • {selectedCount} items</p>
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
                                    const isSelected = list.gearIds?.includes(g.id);
                                    return (
                                        <div
                                            key={g.id}
                                            className={`flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                                            onClick={() => handleToggleGear(g.id)}
                                        >
                                            <Checkbox checked={isSelected} />
                                            <div className="flex-1">
                                                <div className="font-medium">{g.manufacturer} {g.model}</div>
                                                <div className="text-xs text-muted-foreground">{g.category} • {g.serialNumber}</div>
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded-full border ${g.status === 'Available' ? 'bg-green-100 text-green-700 border-green-200' :
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
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>持ち出しリスト ({selectedCount})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {list.gearIds && list.gearIds.length > 0 ? (
                                    <div className="space-y-2 max-h-[500px] overflow-auto pr-2">
                                        {gearList?.filter(g => list.gearIds.includes(g.id)).map(g => (
                                            <div key={g.id} className="text-sm flex justify-between items-start border-b pb-2 last:border-0">
                                                <span>{g.manufacturer} {g.model}</span>
                                                <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{g.category}</span>
                                            </div>
                                        ))}
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
        </Layout>
    );
}
