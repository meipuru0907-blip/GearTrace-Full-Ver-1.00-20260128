import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { X, Printer, Download, FileDown } from "lucide-react";
import type { Gear } from "@/types";
import { toast } from "sonner";

interface LabelPrintModalProps {
    gear: Gear;
    onClose: () => void;
}

export function LabelPrintModal({ gear, onClose }: LabelPrintModalProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    // QR Code: Embed full URL for PWA/Browser access
    // Uses window.location.origin to adapt to dev/prod environments automatically
    const qrData = `${window.location.origin}/gear/${gear.id}${gear.isContainer ? '?view=contents' : ''}`;

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadJpg = async () => {
        setIsDownloading(true);
        try {
            const element = document.getElementById('label-capture-target');
            if (!element) {
                toast.error("ラベル要素が見つかりません");
                return;
            }

            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 3, // Higher resolution for tape labels
                logging: false,
            });

            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `label_${gear.manufacturer}_${gear.model}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("ラベル画像をダウンロードしました");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("画像のダウンロードに失敗しました");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleExportCSV = () => {
        try {
            // CSV data for TEPRA/P-touch software
            const csvHeader = "Manufacturer,Model,Name,SerialNumber,GearID,QRCodeURL,Type\n";
            const qrCodeURL = gear.isContainer
                ? `https://geartrace.app/gear/${gear.id}?view=contents`
                : `https://geartrace.app/gear/${gear.id}`;

            const csvRow = [
                gear.manufacturer,
                gear.model,
                gear.name,
                gear.serialNumber || 'N/A',
                gear.id,
                qrCodeURL,
                gear.isContainer ? 'Container' : 'Gear'
            ].map(field => `"${field}"`).join(',');

            const csvContent = csvHeader + csvRow;

            // UTF-8 BOM for Excel/Label software compatibility
            const bom = '\uFEFF';
            const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `label_${gear.manufacturer}_${gear.model}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("CSV exported successfully");
        } catch (error) {
            console.error("CSV export error:", error);
            toast.error("CSV出力に失敗しました");
        }
    };

    return (
        <>
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold">ラベル作成</h2>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Info Text */}
                        <p className="text-sm text-muted-foreground">
                            24mmテープ想定のラベルプレビューです。印刷またはJPG保存してラベルプリンターで出力できます。
                            {gear.isContainer && <span className="block text-blue-600 font-medium mt-1">※コンテナモード: QRコードは中身リストへのリンクを含みます。</span>}
                        </p>

                        {/* Preview Area - Tape Style (300x90 ratio) */}
                        <div className="flex justify-center">
                            <div
                                id="label-capture-target"
                                className="bg-white text-black border-2 border-black flex items-center gap-3 relative overflow-hidden"
                                style={{
                                    width: '450px',
                                    height: '135px',
                                    padding: '12px'
                                }}
                            >
                                {/* Container Marker */}
                                {gear.isContainer && (
                                    <div className="absolute right-0 top-0 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-md z-10">
                                        CONTENT LIST
                                    </div>
                                )}

                                {/* Left: QR Code */}
                                <div className="flex-shrink-0">
                                    <QRCodeCanvas
                                        value={qrData}
                                        size={110}
                                        level="H"
                                        style={{ display: 'block' }}
                                    />
                                </div>

                                {/* Right: Text Info */}
                                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                                    {/* Line 1: Manufacturer */}
                                    <div className="text-xs font-medium text-gray-600 truncate">
                                        {gear.manufacturer}
                                    </div>

                                    {/* Line 2: Model (Large, Bold) */}
                                    <div className="text-2xl font-bold leading-tight truncate">
                                        {gear.model}
                                    </div>

                                    {/* Line 3: ID/Serial */}
                                    <div className="text-[10px] font-mono text-gray-500 truncate mt-1">
                                        S/N: {gear.serialNumber || 'N/A'} | ID: {gear.id.slice(0, 8)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap gap-3 justify-center">
                            <Button onClick={handlePrint} variant="outline" className="gap-2">
                                <Printer className="h-4 w-4" />
                                印刷
                            </Button>
                            <Button
                                onClick={handleDownloadJpg}
                                disabled={isDownloading}
                                variant="outline"
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                {isDownloading ? "処理中..." : "JPG保存"}
                            </Button>
                            <Button
                                onClick={handleExportCSV}
                                variant="secondary"
                                className="gap-2"
                            >
                                <FileDown className="h-4 w-4" />
                                テプラ/P-touch用CSV
                            </Button>
                        </div>

                        {/* Usage Hint */}
                        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                            <p className="font-semibold mb-1">💡 ラベルソフトでの使い方:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>「JPG保存」で画像を保存</li>
                                <li>Brother P-touch EditorやKing Jim TEPRA等で画像を読み込み</li>
                                <li>または「CSV」で一括データ作成し、差し込み印刷</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #label-capture-target,
                    #label-capture-target * {
                        visibility: visible;
                    }
                    #label-capture-target {
                        position: absolute;
                        left: 0;
                        top: 0;
                        border: 2px solid black !important;
                    }
                }
            `}</style>
        </>
    );
}
