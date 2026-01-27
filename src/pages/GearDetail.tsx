import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Wrench, AlertCircle, ClipboardList, Users, Camera, FileText, Upload, Download, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import type { Log } from "@/types";
import { ProFeature } from "@/components/common/ProFeature";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function GearDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [showLogDialog, setShowLogDialog] = useState(false);
    const [newLog, setNewLog] = useState<Partial<Log>>({
        date: new Date().toISOString().split('T')[0],
        type: 'Maintenance',
        description: '',
        cost: 0
    });
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const gear = useLiveQuery(() => {
        return id ? db.gear.get(id) : undefined;
    }, [id]);

    const logs = useLiveQuery(() => {
        return id ? db.logs.where('gearId').equals(id).reverse().sortBy('date') : [];
    }, [id]);

    const handleAddLog = async () => {
        if (!id || !newLog.description) {
            toast.error("説明を入力してください。");
            return;
        }

        try {
            await db.logs.add({
                id: crypto.randomUUID(),
                gearId: id,
                date: newLog.date!,
                type: newLog.type as 'Trouble' | 'Repair' | 'Maintenance' | 'Lending',
                description: newLog.description,
                cost: newLog.cost || 0
            });

            toast.success("ログを追加しました！");
            setShowLogDialog(false);
            setNewLog({
                date: new Date().toISOString().split('T')[0],
                type: 'Maintenance',
                description: '',
                cost: 0
            });
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

    const handleStatusChange = async (newStatus: string) => {
        if (!id) return;

        try {
            await db.gear.update(id, {
                status: newStatus as any,
                updatedAt: Date.now()
            });
            toast.success("ステータスを更新しました！");
        } catch (error) {
            console.error(error);
            toast.error("ステータスの更新に失敗しました。");
        }
    };

    const handlePhotoUpload = async (photoType: 'hero' | 'serial' | 'feature', event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                await db.gear.update(id, {
                    photos: {
                        ...gear?.photos,
                        [photoType]: base64
                    } as any,
                    updatedAt: Date.now()
                });
                toast.success("写真を更新しました！");
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
            toast.error("写真の更新に失敗しました。");
        }
    };

    const handleGeneratePDF = () => {
        if (!gear) return;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text("Resale Sheet / Spec Sheet", 20, 20);

        // Basic Info
        doc.setFontSize(12);
        doc.text(`Model: ${gear.manufacturer} ${gear.model}`, 20, 40);
        doc.text(`Category: ${gear.category}`, 20, 50);
        doc.text(`Serial No: ${gear.serialNumber || 'N/A'}`, 20, 60);
        doc.text(`Purchase Date: ${gear.purchaseDate}`, 20, 70);
        doc.text(`Status: ${gear.status}`, 20, 80);

        // Add Logs Table
        const tableData = logs?.map(log => [
            log.date,
            log.type,
            log.description,
            log.cost ? `¥${log.cost.toLocaleString()}` : '-'
        ]) || [];

        autoTable(doc, {
            startY: 90,
            head: [['Date', 'Type', 'Description', 'Cost']],
            body: tableData,
        });

        doc.save(`${gear.manufacturer}_${gear.model}_Sheet.pdf`);
        toast.success("PDFが出力されました！");
    };

    const documentInputRef = useRef<HTMLInputElement>(null);

    const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        if (file.type !== 'application/pdf') {
            toast.error("PDFファイルのみアップロード可能です。");
            return;
        }

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const newDoc = {
                    id: crypto.randomUUID(),
                    name: file.name,
                    data: base64,
                    uploadDate: Date.now()
                };

                // @ts-ignore
                const currentDocs = gear.documents || [];

                await db.gear.update(id, {
                    documents: [...currentDocs, newDoc]
                } as any);
                toast.success("ドキュメントを追加しました！");
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
            toast.error("アップロードに失敗しました。");
        }
    };

    if (!gear) return <Layout><div>{t('detail.loading')}</div></Layout>;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button onClick={() => navigate('/')} variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            {gear.manufacturer} {gear.model}
                        </h1>
                        <p className="text-muted-foreground">{gear.category} {gear.subCategory && `/ ${gear.subCategory}`}</p>
                    </div>
                </div>

                {/* Actions & Status */}
                <div className="flex justify-end gap-3">
                    <ProFeature>
                        <Button variant="outline" size="sm" onClick={handleGeneratePDF}>
                            <FileText className="mr-2 h-4 w-4" /> 売却シート作成
                        </Button>
                    </ProFeature>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">ステータス:</label>
                        <select
                            value={gear.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="px-3 py-1.5 border rounded-md bg-background text-sm"
                        >
                            <option value="Available">稼働中</option>
                            <option value="InUse">使用中</option>
                            <option value="Maintenance">メンテナンス中</option>
                            <option value="Repair">修理中</option>
                            <option value="Broken">故障</option>
                            <option value="Missing">紛失</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['hero', 'serial', 'feature'].map(type => (
                    <div key={type} className="relative">
                        <input
                            ref={(el) => { fileInputRefs.current[type] = el; }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(type as any, e)}
                            className="hidden"
                        />
                        <div
                            className="relative aspect-video bg-muted rounded-lg overflow-hidden border cursor-pointer hover:border-primary transition-colors group"
                            onClick={() => fileInputRefs.current[type]?.click()}
                        >
                            {/* @ts-ignore */}
                            {gear.photos[type] ? (
                                /* @ts-ignore */
                                <img src={gear.photos[type]} alt={type} className="object-cover w-full h-full" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                                    <Camera className="h-8 w-8 mb-2" />
                                    <span className="capitalize">写真を追加</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 text-[10px] rounded uppercase font-bold">
                                {type}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Info */}
            <div className="max-w-4xl">
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>{t('detail.assetDetails')}</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">{t('addGear.serialNumber')}</span>
                                <div className="font-medium">{gear.serialNumber || 'N/A'}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{t('addGear.purchaseDate')}</span>
                                <div className="font-medium">{gear.purchaseDate}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{t('detail.originalCost')}</span>
                                <div className="font-medium">¥{gear.purchasePrice.toLocaleString()}</div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{t('addGear.lifespan')}</span>
                                <div className="font-medium">{gear.lifespan} {t('common.years')}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Maintenance Logs */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{t('detail.history')}</CardTitle>
                            <Button size="sm" onClick={() => setShowLogDialog(true)}>
                                <Plus className="h-4 w-4 mr-1" /> ログ追加
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {logs && logs.length > 0 ? (
                                <div className="space-y-3">
                                    {logs.map(log => (
                                        <div key={log.id} className="flex gap-3 p-3 border rounded-lg">
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
                                                        <p className="text-sm text-muted-foreground">{log.description}</p>
                                                    </div>
                                                    <div className="text-right text-xs text-muted-foreground">
                                                        <div>{log.date}</div>
                                                        {log.cost && log.cost > 0 && (
                                                            <div className="font-medium text-foreground">¥{log.cost.toLocaleString()}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted-foreground text-sm">{t('detail.noLogs')}</div>
                            )}
                        </CardContent>
                    </Card>
                    {/* Documents Section (Pro Only for Upload) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>ドキュメント管理</CardTitle>
                            <ProFeature>
                                <div onClick={() => documentInputRef.current?.click()}>
                                    <Button size="sm" variant="secondary">
                                        <Upload className="h-4 w-4 mr-1" /> PDFを追加
                                    </Button>
                                </div>
                            </ProFeature>
                            <input
                                type="file"
                                accept="application/pdf"
                                ref={documentInputRef}
                                className="hidden"
                                onChange={handleUploadDocument}
                            />
                        </CardHeader>
                        <CardContent>
                            {/* @ts-ignore */}
                            {gear.documents && gear.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {/* @ts-ignore */}
                                    {gear.documents.map(doc => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded bg-muted/20">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FileText className="h-4 w-4 flex-shrink-0 text-red-500" />
                                                <span className="truncate text-sm font-medium">{doc.name}</span>
                                            </div>
                                            <a href={doc.data} download={doc.name} className="text-primary hover:underline text-xs flex items-center">
                                                <Download className="h-3 w-3 mr-1" /> ダウンロード
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    保証書やマニュアルのPDFを保存できます。
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Log Creation Dialog */}
            {showLogDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLogDialog(false)}>
                    <div className="bg-background p-6 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4">メンテナンスログを追加</h2>
                        <div className="space-y-4">
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
                                <textarea
                                    value={newLog.description}
                                    onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md bg-background min-h-[80px]"
                                    placeholder="詳細を入力..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">費用（円）</label>
                                <Input
                                    type="number"
                                    value={newLog.cost || 0}
                                    onChange={(e) => setNewLog({ ...newLog, cost: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setShowLogDialog(false)}>キャンセル</Button>
                                <Button onClick={handleAddLog}>追加</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </Layout>
    );
}
