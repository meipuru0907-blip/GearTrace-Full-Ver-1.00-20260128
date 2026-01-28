import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, ListChecks, Calendar } from "lucide-react";
import { db } from "@/db";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PackingLists() {
    const packingLists = useLiveQuery(() => db.packingLists.orderBy('createdAt').reverse().toArray());
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const handleCreateList = async () => {
        if (!name.trim()) {
            toast.error("リスト名を入力してください");
            return;
        }

        try {
            const id = await db.packingLists.add({
                name,
                date,
                gearIds: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            } as any);
            toast.success("リストを作成しました");
            setOpen(false);
            setName("");
            // Navigate to the new list details
            navigate(`/packing-lists/${id}`);
        } catch (error) {
            console.error(error);
            toast.error("リストの作成に失敗しました");
        }
    };

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">持ち出しリスト</h1>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> 新規リスト作成
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>新規リスト作成</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">リスト名 (現場名など)</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="例: ○○ライブハウス公演"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">日付</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
                                <Button onClick={handleCreateList}>作成</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {packingLists && packingLists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {packingLists.map(list => (
                            <div
                                key={list.id}
                                className="p-4 border rounded-lg bg-card hover:border-primary cursor-pointer transition-colors shadow-sm"
                                onClick={() => navigate(`/packing-lists/${list.id}`)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-lg truncate pr-2">{list.name}</h3>
                                    <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full whitespace-nowrap">
                                        {list.gearIds?.length || 0} items
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {list.date}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed rounded-lg bg-muted/10">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <ListChecks className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">リストがありません</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            機材を選んで持ち出しリストを作成しましょう。
                            現場ごとの機材管理に役立ちます。
                        </p>
                        <Button onClick={() => setOpen(true)} variant="outline">
                            <Plus className="mr-2 h-4 w-4" /> 最初のリストを作成
                        </Button>
                    </div>
                )}
            </div>
        </Layout>
    );
}
