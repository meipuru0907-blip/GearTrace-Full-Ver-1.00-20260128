import { useState } from "react";
import { Plus, AlertCircle, Wrench, ClipboardList, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Log } from "@/types";

interface GearHistoryProps {
    gearId: string;
    logs: Log[] | undefined;
    onUpdate?: () => void;
}

export function GearHistory({ gearId, logs, onUpdate }: GearHistoryProps) {
    const [showLogDialog, setShowLogDialog] = useState(false);
    const [newLog, setNewLog] = useState<Partial<Log>>({
        date: new Date().toISOString().split('T')[0],
        type: 'Maintenance',
        description: '',
        cost: 0
    });

    const handleAddLog = async () => {
        if (!gearId || !newLog.description) {
            toast.error("説明を入力してください。");
            return;
        }

        try {
            const { error } = await supabase.from('logs').insert({
                gear_id: gearId,
                date: newLog.date,
                type: newLog.type,
                description: newLog.description,
                cost: newLog.cost || 0
            });

            if (error) throw error;

            toast.success("ログを追加しました！");
            setShowLogDialog(false);
            setNewLog({
                date: new Date().toISOString().split('T')[0],
                type: 'Maintenance',
                description: '',
                cost: 0
            });

            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("ログの追加に失敗しました。");
        }
    };

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'Trouble': return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'Repair': return <Wrench className="h-4 w-4 text-blue-500" />;
            case 'Maintenance': return <ClipboardList className="h-4 w-4 text-green-500" />;
            case 'Lending': return <Users className="h-4 w-4 text-purple-500" />;
            default: return <ClipboardList className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-4 mt-4">
            <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>メンテナンス履歴</CardTitle>
                    <Button size="sm" onClick={() => setShowLogDialog(true)}>
                        <Plus className="h-4 w-4 mr-1" /> ログ追加
                    </Button>
                </CardHeader>
                <CardContent>
                    {logs && logs.length > 0 ? (
                        <div className="space-y-3">
                            {logs.map(log => (
                                <div key={log.id} className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="mt-1">{getLogIcon(log.type)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {log.type === 'Trouble' && '不具合'}
                                                    {log.type === 'Repair' && '修理'}
                                                    {log.type === 'Maintenance' && 'メンテナンス'}
                                                    {log.type === 'Lending' && '貸出'}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground">
                                                <div>{log.date}</div>
                                                {log.cost && log.cost > 0 && (
                                                    <div className="font-medium text-foreground mt-1">
                                                        ¥{log.cost.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-muted-foreground text-sm text-center py-8">
                            まだログがありません
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Log Dialog */}
            {showLogDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>ログを追加</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">日付</label>
                                <Input
                                    type="date"
                                    value={newLog.date}
                                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">種類</label>
                                <select
                                    value={newLog.type}
                                    onChange={(e) => setNewLog({ ...newLog, type: e.target.value as any })}
                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                >
                                    <option value="Maintenance">メンテナンス</option>
                                    <option value="Repair">修理</option>
                                    <option value="Trouble">不具合</option>
                                    <option value="Lending">貸出</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">説明</label>
                                <Input
                                    value={newLog.description}
                                    onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                                    placeholder="詳細を入力"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">費用 (円)</label>
                                <Input
                                    type="number"
                                    value={newLog.cost || 0}
                                    onChange={(e) => setNewLog({ ...newLog, cost: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setShowLogDialog(false)}>
                                    キャンセル
                                </Button>
                                <Button onClick={handleAddLog}>
                                    追加
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
