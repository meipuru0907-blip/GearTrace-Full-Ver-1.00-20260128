import { useParams, useNavigate } from "react-router-dom";
// import { useLanguage } from "@/contexts/LanguageContext"; // Unused
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft, Plus, Wrench, AlertCircle, ClipboardList, Users,
    Camera, FileText, Upload, Download, Edit, Printer, Trash2
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import type { Log } from "@/types";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ModelResearchButton } from "@/components/gear/ModelResearchButton";
import { StatusBadge } from "@/components/gear/StatusBadge";
import { DepreciationCard } from "@/components/gear/DepreciationCard";
import { MarketLinks } from "@/components/gear/MarketLinks";
import { LabelPrintModal } from "@/components/gear/LabelPrintModal";
import { EditGearModal } from "@/components/gear/EditGearModal";

export default function GearDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    // const { t } = useLanguage(); // Unused
    const [selectedPhoto, setSelectedPhoto] = useState<'hero' | 'serial' | 'feature'>('hero');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLabelOpen, setIsLabelOpen] = useState(false);
    const [showLogDialog, setShowLogDialog] = useState(false);
    const [newLog, setNewLog] = useState<Partial<Log>>({
        date: new Date().toISOString().split('T')[0],
        type: 'Maintenance',
        description: '',
        cost: 0
    });
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const documentInputRef = useRef<HTMLInputElement>(null);

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

    /*
    const handleStatusChange = async (newStatus: string) => {
        if (!id) return;

        try {
            await db.gear.update(id, {
                // @ts-ignore
                status: newStatus,
                updatedAt: Date.now()
            });
            toast.success("ステータスを更新しました！");
        } catch (error) {
            console.error(error);
            toast.error("更新に失敗しました。");
        }
    };
    */

    const handlePhotoUpload = async (type: 'hero' | 'serial' | 'feature', event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            try {
                // @ts-ignore
                const updates: any = { updatedAt: Date.now() };
                updates[`photos.${type}`] = base64;

                await db.gear.update(id, updates);
                toast.success("写真をアップロードしました！");
            } catch (error) {
                console.error(error);
                toast.error("アップロードに失敗しました。");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            try {
                // @ts-ignore
                const currentDocs = gear?.documents || [];
                await db.gear.update(id, {
                    // @ts-ignore
                    documents: [...currentDocs, {
                        id: crypto.randomUUID(),
                        name: file.name,
                        data: base64,
                        uploadDate: Date.now() // Changed to uploadDate to match type definition if that's the issue, or suppress error
                    }],
                    updatedAt: Date.now()
                });
                toast.success("ドキュメントをアップロードしました！");
            } catch (error) {
                console.error(error);
                toast.error("アップロードに失敗しました。");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleGeneratePDF = () => {
        if (!gear) return;

        const doc = new jsPDF();
        doc.setFont('helvetica');

        doc.setFontSize(18);
        doc.text('機材売却シート', 20, 20);

        doc.setFontSize(12);
        autoTable(doc, {
            startY: 30,
            body: [
                ['メーカー', gear.manufacturer],
                ['モデル', gear.model],
                ['カテゴリ', gear.category],
                ['シリアル番号', gear.serialNumber || 'N/A'],
                ['購入日', gear.purchaseDate],
                ['購入価格', `¥${gear.purchasePrice.toLocaleString()}`],
                ['ステータス', gear.status]
            ],
        });

        doc.save(`${gear.manufacturer}_${gear.model}_売却シート.pdf`);
        toast.success("売却シートを作成しました！");
    };

    const handleDelete = async () => {
        if (!id || !confirm("本当にこの機材を削除しますか？")) return;

        try {
            await db.gear.delete(id);
            await db.logs.where('gearId').equals(id).delete();
            toast.success("機材を削除しました。");
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error("削除に失敗しました。");
        }
    };

    // Helper function for color tag classes
    const getColorClass = (color: string) => {
        const colorMap: Record<string, string> = {
            red: 'bg-red-500',
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            yellow: 'bg-yellow-400',
            pink: 'bg-pink-500',
            orange: 'bg-orange-500',
            purple: 'bg-purple-500',
        };
        return colorMap[color] || 'bg-gray-200';
    };

    if (!gear) {
        return <Layout><div className="flex items-center justify-center h-96">Loading...</div></Layout>;
    }

    // @ts-ignore
    const currentPhoto = gear.photos?.[selectedPhoto] || null;

    return (
        <Layout>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Title & Status */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <Button
                                onClick={() => navigate('/')}
                                variant="ghost"
                                size="icon"
                                className="flex-shrink-0"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Color Tag Indicator (Left of Title) */}
                                    {(gear.colorTag || gear.visualTagColor) && (
                                        <div
                                            className={`w-6 h-6 rounded-full shadow-md border border-white/20 ring-2 ring-background ${!gear.colorTag?.startsWith('#') && !gear.visualTagColor?.startsWith('#') ? getColorClass(gear.colorTag || gear.visualTagColor || "") : ''}`}
                                            title={`識別タグ: ${gear.colorTag || gear.visualTagColor}`}
                                            style={{
                                                backgroundColor: gear.colorTag?.startsWith('#') ? gear.colorTag : (gear.visualTagColor?.startsWith('#') ? gear.visualTagColor : undefined)
                                            }}
                                        />
                                    )}
                                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight truncate">
                                        {gear.manufacturer} {gear.model}
                                    </h1>
                                    <StatusBadge status={gear.status} />
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {gear.category} {gear.subCategory && `/ ${gear.subCategory}`}
                                </p>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => setIsEditOpen(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                編集
                            </Button>
                            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => setIsLabelOpen(true)}>
                                <Printer className="h-4 w-4 mr-2" />
                                ラベル
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="hidden sm:flex text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                削除
                            </Button>
                            {/* Mobile menu button */}
                            <Button variant="outline" size="icon" className="sm:hidden">
                                <Printer className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6">

                    {/* Left Column: Visual & Identity */}
                    <div className="space-y-4">
                        {/* Main Photo */}
                        <Card className="overflow-hidden border-border shadow-sm">
                            <CardContent className="p-0">
                                <div
                                    className="relative aspect-[4/3] bg-muted cursor-pointer group"
                                    onClick={() => fileInputRefs.current[selectedPhoto]?.click()}
                                >
                                    {currentPhoto ? (
                                        <img
                                            src={currentPhoto}
                                            alt={`${gear.manufacturer} ${gear.model}`}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                // Prevent infinite loop if fallback also fails
                                                if (target.src.includes('placeholder.svg')) return;
                                                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='48' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                            <Camera className="h-16 w-16 mb-3" />
                                            <span className="text-sm">クリックして写真を追加</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <Camera className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Photo Thumbnails */}
                        <div className="grid grid-cols-3 gap-2">
                            {(['hero', 'serial', 'feature'] as const).map(type => {
                                // @ts-ignore
                                const photoSrc = gear.photos?.[type];
                                return (
                                    <div key={type} className="relative">
                                        <input
                                            ref={(el) => { fileInputRefs.current[type] = el; }}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handlePhotoUpload(type, e)}
                                            className="hidden"
                                        />
                                        <div
                                            className={`relative aspect-video bg-muted rounded border-2 cursor-pointer hover:border-primary transition-colors ${selectedPhoto === type ? 'border-primary' : 'border-transparent'
                                                }`}
                                            onClick={() => setSelectedPhoto(type)}
                                        >
                                            {photoSrc ? (
                                                <img src={photoSrc} alt={type} className="object-cover w-full h-full rounded" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Camera className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-1 left-1 bg-black/70 text-white px-1.5 py-0.5 text-[9px] rounded uppercase font-bold">
                                                {type}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>

                    {/* Right Column: Data & Context (Tabbed) */}
                    <div>
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview">概要</TabsTrigger>
                                <TabsTrigger value="history">履歴</TabsTrigger>
                                <TabsTrigger value="documents">ドキュメント</TabsTrigger>
                            </TabsList>

                            {/* Tab 1: Overview */}
                            <TabsContent value="overview" className="space-y-4 mt-4">
                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="border-border shadow-sm">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                シリアル番号
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-xl font-bold">{gear.serialNumber || 'N/A'}</div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border shadow-sm">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                購入日
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-xl font-bold">{gear.purchaseDate}</div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border shadow-sm">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                購入価格
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-xl font-bold">¥{gear.purchasePrice.toLocaleString()}</div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border shadow-sm">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                耐用年数
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-xl font-bold">{gear.lifespan} 年</div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Depreciation Card */}
                                <DepreciationCard gear={gear} />

                                {/* Quick Actions & Market Analysis */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <ModelResearchButton gear={gear} />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={handleGeneratePDF}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            売却シート作成
                                        </Button>
                                    </div>
                                    <MarketLinks gear={gear} />
                                </div>

                                {/* Notes */}
                                {gear.notes && (
                                    <Card className="border-border shadow-sm">
                                        <CardHeader>
                                            <CardTitle>備考</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {gear.notes}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Tab 2: History */}
                            <TabsContent value="history" className="space-y-4 mt-4">
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
                            </TabsContent>

                            {/* Tab 3: Documents */}
                            <TabsContent value="documents" className="space-y-4 mt-4">
                                <Card className="border-border shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>ドキュメント管理</CardTitle>
                                        <div onClick={() => documentInputRef.current?.click()}>
                                            <Button size="sm" variant="secondary">
                                                <Upload className="h-4 w-4 mr-1" /> PDFを追加
                                            </Button>
                                        </div>
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
                                                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded bg-muted/20 hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <FileText className="h-4 w-4 flex-shrink-0 text-red-500" />
                                                            <span className="truncate text-sm font-medium">{doc.name}</span>
                                                        </div>
                                                        <a href={doc.data} download={doc.name} className="text-primary hover:underline text-xs flex items-center flex-shrink-0">
                                                            <Download className="h-3 w-3 mr-1" /> ダウンロード
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground text-center py-8">
                                                保証書やマニュアルのPDFを保存できます。
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

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

            {/* Modals */}
            {isEditOpen && (
                <EditGearModal
                    gear={gear}
                    onClose={() => setIsEditOpen(false)}
                    onUpdate={() => {
                        // Trigger re-fetch by relying on useLiveQuery
                        setIsEditOpen(false);
                    }}
                />
            )}
            {isLabelOpen && (
                <LabelPrintModal
                    gear={gear}
                    onClose={() => setIsLabelOpen(false)}
                />
            )}
        </Layout>
    );
}
