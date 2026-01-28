import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, Database, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import XLSX from "xlsx-js-style";
import { useRef } from "react";
import { exportTaxLedger } from "@/lib/excel";
import { downloadTaxGuideExcel, getTaxGuideEntryCount } from "@/utils/excelExport";
import { openBugReportForm } from "@/utils/systemInfo";

export default function Settings() {
    const gears = useLiveQuery(() => db.gear.toArray());
    const logs = useLiveQuery(() => db.logs.toArray());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExportXlsx = () => {
        if (!gears || gears.length === 0) {
            toast.error("データがありません。");
            return;
        }

        try {
            const data = gears.map(g => {
                return {
                    "資産ID": g.id,
                    "メーカー": g.manufacturer,
                    "モデル名": g.model,
                    "カテゴリー": g.category,
                    "シリアル番号": g.serialNumber,
                    "ステータス": g.status,
                    "取得年月日": g.purchaseDate,
                    "購入価格": g.purchasePrice,
                    "耐用年数": g.lifespan
                };
            });

            const ws = XLSX.utils.json_to_sheet(data);

            // カラム幅を設定
            ws['!cols'] = [
                { wch: 38 },  // 資産ID
                { wch: 18 },  // メーカー
                { wch: 25 },  // モデル名
                { wch: 18 },  // カテゴリー
                { wch: 20 },  // シリアル番号
                { wch: 15 },  // ステータス
                { wch: 13 },  // 取得年月日
                { wch: 12 },  // 購入価格
                { wch: 10 }   // 耐用年数
            ];

            // スタイルを適用
            const range = XLSX.utils.decode_range(ws['!ref']!);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[cellRef]) continue;

                    const cellStyle: any = {
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } }
                        },
                        alignment: { vertical: "center" },
                        font: { name: "Yu Gothic", sz: 11 }
                    };

                    if (R === 0) {
                        // ヘッダー行
                        cellStyle.fill = { fgColor: { rgb: "4472C4" } };
                        cellStyle.font = {
                            ...cellStyle.font,
                            color: { rgb: "FFFFFF" },
                            bold: true,
                            sz: 12
                        };
                        cellStyle.alignment = { horizontal: "center", vertical: "center" };
                    } else {
                        // データ行
                        // 購入価格列は右揃えで数値フォーマット
                        if (C === 7) {
                            cellStyle.alignment.horizontal = "right";
                            ws[cellRef].z = '#,##0';
                        }
                        // 耐用年数列は中央揃えで太字
                        if (C === 8) {
                            cellStyle.alignment.horizontal = "center";
                            cellStyle.font.bold = true;
                        }
                        // ステータス列に応じて背景色を設定
                        if (C === 5) {
                            const status = ws[cellRef].v;
                            if (status === "Available" || status === "稼働中") {
                                cellStyle.fill = { fgColor: { rgb: "E8F5E9" } }; // 緑
                            } else if (status === "Maintenance" || status === "メンテナンス中") {
                                cellStyle.fill = { fgColor: { rgb: "FFF9C4" } }; // 黄
                            } else if (status === "Repair" || status === "修理中") {
                                cellStyle.fill = { fgColor: { rgb: "FFE0B2" } }; // オレンジ
                            } else if (status === "Broken" || status === "故障") {
                                cellStyle.fill = { fgColor: { rgb: "FFCDD2" } }; // 赤
                            } else if (status === "Missing" || status === "紛失") {
                                cellStyle.fill = { fgColor: { rgb: "F3E5F5" } }; // 紫
                            }
                        }
                    }

                    ws[cellRef].s = cellStyle;
                }
            }

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "資産台帳");

            // メタデータ
            wb.Props = {
                Title: '資産台帳（GearTrace）',
                Subject: '機材資産管理リスト',
                Author: 'GearTrace',
                CreatedDate: new Date()
            };

            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const filename = `GearTrace_資産台帳_${dateStr}.xlsx`;

            XLSX.writeFile(wb, filename);
            toast.success("資産台帳をダウンロードしました！");
        } catch (err) {
            console.error(err);
            toast.error("出力に失敗しました。");
        }
    };

    const handleBackupJson = () => {
        try {
            const backup = {
                exportDate: new Date().toISOString(),
                version: "1.0",
                gear: gears || [],
                logs: logs || []
            };

            const jsonStr = JSON.stringify(backup, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = new Date().toISOString().split('T')[0];
            a.download = `GearTrace_Backup_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("バックアップファイルを作成しました！");
        } catch (err) {
            console.error(err);
            toast.error("バックアップに失敗しました。");
        }
    };

    const handleTaxExport = () => {
        if (!gears || gears.length === 0) {
            toast.error("データがありません。");
            return;
        }
        try {
            exportTaxLedger(gears);
            toast.success("確定申告用データを出力しました！");
        } catch (err) {
            console.error(err);
            toast.error("出力に失敗しました。");
        }
    };

    const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.gear || !Array.isArray(data.gear)) {
                throw new Error("Invalid format");
            }

            if (!confirm("現在のデータを上書き・マージしますか？この操作は取り消せません。")) {
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            await db.transaction('rw', db.gear, db.logs, async () => {
                await db.gear.bulkPut(data.gear);
                if (data.logs && Array.isArray(data.logs)) {
                    await db.logs.bulkPut(data.logs);
                }
            });

            toast.success("データの復元が完了しました！");
            setTimeout(() => window.location.reload(), 1000);

        } catch (err) {
            console.error(err);
            toast.error("ファイルの読み込みに失敗しました。形式を確認してください。");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDownloadTaxGuide = () => {
        try {
            const success = downloadTaxGuideExcel();
            if (success) {
                const count = getTaxGuideEntryCount();
                toast.success(`耐用年数マスターガイド（${count}項目）をダウンロードしました！`);
            } else {
                toast.error("ダウンロードに失敗しました。");
            }
        } catch (error) {
            console.error(error);
            toast.error("ダウンロードに失敗しました。");
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">設定</h1>
                </div>

                {/* Data Management */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Database className="h-5 w-5" /> データ管理
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Exports */}
                        <div className="p-4 border rounded-lg space-y-4 bg-card">
                            <h3 className="font-medium">データ書き出し</h3>
                            <div className="space-y-2">
                                <Button onClick={handleExportXlsx} variant="outline" className="w-full justify-start">
                                    <Download className="mr-2 h-4 w-4" /> Excel出力 (資産台帳)
                                </Button>
                                <Button onClick={handleTaxExport} variant="outline" className="w-full justify-start">
                                    <Download className="mr-2 h-4 w-4" /> 確定申告用データ (.xlsx)
                                </Button>
                                <Button onClick={handleDownloadTaxGuide} variant="outline" className="w-full justify-start">
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> 耐用年数ガイド (.xlsx)
                                </Button>
                                <p className="text-xs text-muted-foreground pl-1">
                                    主要なメーカー・機種別の詳細リスト（全100機種以上）
                                </p>
                                <Button onClick={handleBackupJson} variant="secondary" className="w-full justify-start">
                                    <Download className="mr-2 h-4 w-4" /> JSONバックアップ (無料)
                                </Button>
                            </div>
                        </div>

                        {/* Imports (Pro) */}
                        <div className="p-4 border rounded-lg space-y-4 bg-card">
                            <h3 className="font-medium">データ復元</h3>
                            <p className="text-xs text-muted-foreground">
                                バックアップファイル(.json)からデータを復元します。<br />
                                ※同じIDのデータは上書きされます。
                            </p>
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".json"
                                    onChange={handleImportJson}
                                    className="hidden"
                                />
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <Upload className="mr-2 h-4 w-4" /> JSONファイルをインポート
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bug Report & Feedback Section */}
                <div className="space-y-4 mt-8">
                    <h2 className="text-xl font-semibold">サポート</h2>
                    <div className="p-4 border rounded-lg space-y-4 bg-card">
                        <div>
                            <h3 className="font-medium mb-2">フィードバック</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                バグの報告や機能のリクエストを送信できます。<br />
                                お使いの環境情報が自動で入力されます。
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto gap-2"
                            onClick={openBugReportForm}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                <path d="m8 2 1.88 1.88" />
                                <path d="M14.12 3.88 16 2" />
                                <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
                                <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
                                <path d="M12 20v-9" />
                                <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
                                <path d="M6 13H2" />
                                <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
                                <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
                                <path d="M22 13h-4" />
                                <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
                            </svg>
                            🐛 バグを報告 / 要望を送る
                        </Button>
                    </div>
                </div>
            </div>
        </Layout >
    );
}
