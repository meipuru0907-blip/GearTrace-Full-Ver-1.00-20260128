import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, Database } from "lucide-react";
import { toast } from "sonner";
import { utils, write } from "xlsx";
import { useLicense } from "@/contexts/LicenseContext";
import { ProFeature } from "@/components/common/ProFeature";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Settings() {
    const gears = useLiveQuery(() => db.gear.toArray());
    const logs = useLiveQuery(() => db.logs.toArray());
    const { isPro, activateLicense } = useLicense();
    const [licenseKey, setLicenseKey] = useState("");

    const handleActivate = () => {
        if (activateLicense(licenseKey)) {
            setLicenseKey("");
        }
    };

    const handleExportXlsx = () => {
        if (!gears || gears.length === 0) {
            toast.error("データがありません。");
            return;
        }

        try {
            // Japanese Fixed Asset Ledger format
            const data = gears.map(g => {
                return {
                    "資産ID": g.id,
                    "メーカー": g.manufacturer,
                    "モデル名": g.model,
                    "カテゴリー": g.category,
                    "シリアル番号": g.serialNumber,
                    "ステータス": g.status,
                    "取得年月日": g.purchaseDate,
                    "取得価額": g.purchasePrice,
                    "耐用年数": g.lifespan
                };
            });

            const ws = utils.json_to_sheet(data);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Assets");

            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const filename = `GearTrace_Export_${dateStr}.xlsx`;

            const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Excelファイルをダウンロードしました！");
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



    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">設定</h1>
                    <p className="text-muted-foreground mt-1">
                        データのバックアップや書き出しを行います。
                    </p>
                </div>

                <div className="bg-card p-6 rounded-lg border space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">ライセンス管理</h2>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/20">
                            <div>
                                <h3 className="font-medium">現在のプラン</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {isPro ? "Pro Plan (有効化済み)" : "Free Plan (無料版)"}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isPro ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {isPro ? "PRO" : "FREE"}
                            </div>
                        </div>

                        {!isPro && (
                            <div className="mt-4 flex gap-2">
                                <Input
                                    placeholder="ライセンスキーを入力 (例: GEAR-PRO-2026)"
                                    value={licenseKey}
                                    onChange={(e) => setLicenseKey(e.target.value)}
                                    className="max-w-md"
                                />
                                <Button onClick={handleActivate}>有効化</Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-card p-6 rounded-lg border space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">データ管理</h2>
                        <div className="space-y-3">
                            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="flex-1">
                                    <h3 className="font-medium">Excelエクスポート (.xlsx)</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        現在のインベントリをExcel形式でダウンロードします。
                                    </p>
                                </div>
                                <ProFeature>
                                    <Button
                                        onClick={handleExportXlsx}
                                        disabled={!gears || gears.length === 0}
                                        variant="outline"
                                    >
                                        <Download className="mr-2 h-4 w-4" /> エクスポート
                                    </Button>
                                </ProFeature>
                            </div>

                            <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="flex-1">
                                    <h3 className="font-medium">全データをバックアップ (JSON)</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        機材データとログを含む全データをJSONファイルとして保存します。復元時に使用できます。
                                    </p>
                                </div>
                                <Button
                                    onClick={handleBackupJson}
                                    variant="outline"
                                    className="ml-4"
                                >
                                    <Database className="mr-2 h-4 w-4" />
                                    バックアップ
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                            💡 ヒント: 定期的なバックアップを推奨します。JSONバックアップは全データを含むため、データ復元に使用できます。
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
