import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Copy, FileDown, Info } from "lucide-react";
import { toast } from "sonner";
import type { Gear, Log } from "@/types";
import { generateListingText } from "@/utils/listingGenerator";
import { generateSalesSheetPDF } from "@/utils/pdfGenerator";

interface ResaleAssistantModalProps {
    gear: Gear;
    logs?: Log[];
    onClose: () => void;
}

export function ResaleAssistantModal({ gear, logs, onClose }: ResaleAssistantModalProps) {
    const [listingText, setListingText] = useState("");
    const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

    const accessoryOptions = [
        "元箱",
        "取扱説明書",
        "電源ケーブル/アダプタ",
        "純正ケース",
        "保証書",
        "その他付属品"
    ];

    useEffect(() => {
        // Auto-generate listing text when modal opens
        const generated = generateListingText(gear, logs);
        setListingText(generated);
    }, [gear, logs]);

    const handleAccessoryToggle = (accessory: string) => {
        setSelectedAccessories(prev =>
            prev.includes(accessory)
                ? prev.filter(item => item !== accessory)
                : [...prev, accessory]
        );
    };

    const handleCopyText = async () => {
        try {
            await navigator.clipboard.writeText(listingText);
            toast.success("テキストをクリップボードにコピーしました！");
        } catch (error) {
            console.error("Copy failed:", error);
            toast.error("コピーに失敗しました。");
        }
    };

    const handleDownloadPDF = async () => {
        try {
            toast.info("PDFを生成中...", { duration: 2000 });
            const pdfBlob = await generateSalesSheetPDF(gear, logs, selectedAccessories);
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${gear.manufacturer}_${gear.model}_SalesSheet.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("販売シート(PDF)をダウンロードしました！");
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("PDF生成に失敗しました。");
        }
    };

    return (
        <>
            {/* Modal Overlay */}
            <div
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div
                    className="bg-background rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/10 to-primary/5">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                🏪 Resale Assistant
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {gear.manufacturer} {gear.model}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        <div className="grid md:grid-cols-2 gap-6 h-full">
                            {/* LEFT: Text Preview */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">📱 出品用テキスト</h3>
                                    <span className="text-xs text-muted-foreground">編集可能</span>
                                </div>

                                <textarea
                                    value={listingText}
                                    onChange={(e) => setListingText(e.target.value)}
                                    className="flex-1 min-h-[400px] w-full p-4 border rounded-lg bg-muted/30 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="自動生成されたテキストがここに表示されます..."
                                />

                                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-900">
                                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p>
                                        <strong>ヒント:</strong> シリアル番号は下3桁が自動で伏せ字になっています。
                                        メルカリやヤフオクに出品する際は、このテキストをコピーしてご利用ください。
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT: Actions */}
                            <div className="flex flex-col gap-4">
                                <h3 className="font-semibold text-lg">⚙️ アクション</h3>

                                {/* Copy Text Button */}
                                <div className="space-y-2">
                                    <Button
                                        onClick={handleCopyText}
                                        className="w-full h-14 text-base gap-2"
                                        variant="default"
                                    >
                                        <Copy className="h-5 w-5" />
                                        テキストをコピー
                                    </Button>
                                    <p className="text-xs text-muted-foreground pl-2">
                                        → メルカリ、ヤフオク、ジモティーなどに貼り付け
                                    </p>
                                </div>

                                {/* Accessories Selector */}
                                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                        📦 付属品を選択（PDF用）
                                    </h4>
                                    <div className="space-y-2">
                                        {accessoryOptions.map((accessory) => (
                                            <label
                                                key={accessory}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors"
                                            >
                                                <Checkbox
                                                    checked={selectedAccessories.includes(accessory)}
                                                    onChange={() => handleAccessoryToggle(accessory)}
                                                />
                                                <span className="text-sm">{accessory}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        選択した項目がPDFに記載されます
                                    </p>
                                </div>

                                {/* Download PDF Button */}
                                <div className="space-y-2">
                                    <Button
                                        onClick={handleDownloadPDF}
                                        className="w-full h-14 text-base gap-2"
                                        variant="secondary"
                                    >
                                        <FileDown className="h-5 w-5" />
                                        販売シート(PDF)を保存
                                    </Button>
                                    <p className="text-xs text-muted-foreground pl-2">
                                        → リサイクルショップ、委託販売店に持ち込み
                                    </p>
                                </div>

                                {/* Separator */}
                                <div className="border-t my-2"></div>

                                {/* Usage Guide */}
                                <div className="bg-accent/50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                        📋 使い分けガイド
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div>
                                            <p className="font-medium">🛒 フリマアプリで売る場合</p>
                                            <p className="text-muted-foreground pl-4">
                                                「テキストをコピー」→ メルカリやヤフオクの商品説明欄に貼り付け
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium">🏪 店舗で売る場合</p>
                                            <p className="text-muted-foreground pl-4">
                                                「販売シート(PDF)を保存」→ プリントして店舗に持参
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Card */}
                                <div className="bg-muted/50 p-4 rounded-lg border text-xs space-y-2">
                                    <p className="font-medium">💡 高値で売るポイント</p>
                                    <ul className="space-y-1 text-muted-foreground pl-4">
                                        <li>✓ メンテナンス履歴があれば積極的にアピール</li>
                                        <li>✓ 付属品は全て揃えると査定UP</li>
                                        <li>✓ 写真は明るく、傷も正直に撮影</li>
                                        <li>✓ 相場を事前リサーチ（相場リサーチカード活用）</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
