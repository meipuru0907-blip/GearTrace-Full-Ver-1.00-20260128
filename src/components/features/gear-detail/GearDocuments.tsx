import { useRef } from "react";
import { Upload, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { db } from "@/db";
import type { Gear } from "@/types";

interface GearDocumentsProps {
    gear: Gear;
}

export function GearDocuments({ gear }: GearDocumentsProps) {
    const documentInputRef = useRef<HTMLInputElement>(null);

    const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !gear.id) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            try {
                // @ts-ignore
                const currentDocs = gear?.documents || [];
                await db.gear.update(gear.id, {
                    // @ts-ignore
                    documents: [...currentDocs, {
                        id: crypto.randomUUID(),
                        name: file.name,
                        data: base64,
                        uploadDate: Date.now()
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

    return (
        <div className="space-y-4 mt-4">
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
        </div>
    );
}
