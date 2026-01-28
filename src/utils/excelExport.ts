import XLSX from 'xlsx-js-style';
import { ASSET_MASTER_GUIDE } from '@/data/assetMasterGuide';

/**
 * 資産耐用年数マスターガイド（スタイリング版）をExcelでダウンロード
 * 
 * 機能:
 * - xlsx-js-styleを使用した高度なスタイリング
 * - 罫線、背景色、フォント、セル結合対応
 * - カラム幅の最適化
 * - 視認性の高い出力
 */
export function downloadMasterGuideExcel() {
    try {
        // 1. データをシート形式に変換
        const sheetData = ASSET_MASTER_GUIDE.map(item => ({
            "大分類": item.category,
            "種類": item.subCategory,
            "主な機種・キーワード": item.items,
            "耐用年数": item.years,
            "備考・注意点": item.note
        }));

        const ws = XLSX.utils.json_to_sheet(sheetData);

        // 2. カラム幅を設定
        ws['!cols'] = [
            { wch: 15 },  // 大分類
            { wch: 22 },  // 種類
            { wch: 55 },  // 主な機種・キーワード（広めに）
            { wch: 10 },  // 耐用年数
            { wch: 45 },  // 備考・注意点
        ];

        // 3. 行の高さを設定（ヘッダーは少し高く）
        ws['!rows'] = [
            { hpt: 28 }, // ヘッダー行
        ];

        // 4. スタイルを適用
        const range = XLSX.utils.decode_range(ws['!ref']!);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef]) continue;

                // 基本スタイル（全セル共通）
                const cellStyle: any = {
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    },
                    alignment: {
                        vertical: "center",
                        wrapText: true
                    },
                    font: {
                        name: "Yu Gothic",
                        sz: 11
                    }
                };

                if (R === 0) {
                    // ヘッダー行のスタイル
                    cellStyle.fill = { fgColor: { rgb: "2F75B5" } };
                    cellStyle.font = {
                        ...cellStyle.font,
                        color: { rgb: "FFFFFF" },
                        bold: true,
                        sz: 12
                    };
                    cellStyle.alignment = {
                        horizontal: "center",
                        vertical: "center",
                        wrapText: false
                    };
                } else {
                    // データ行のスタイル
                    if (C === 3) {
                        // 耐用年数列は中央揃え
                        cellStyle.alignment.horizontal = "center";
                        cellStyle.font.bold = true;
                        cellStyle.font.sz = 12;
                    }

                    // カテゴリ別に背景色を設定
                    const categoryCell = XLSX.utils.encode_cell({ r: R, c: 0 });
                    const category = ws[categoryCell]?.v;

                    if (C === 0) {
                        // カテゴリ列を太字に
                        cellStyle.font.bold = true;

                        // カテゴリごとに薄い背景色を設定
                        if (category === "音響機器") {
                            cellStyle.fill = { fgColor: { rgb: "E7F3FF" } };
                        } else if (category === "PC・制御機器") {
                            cellStyle.fill = { fgColor: { rgb: "FFF3E0" } };
                        } else if (category === "照明機器") {
                            cellStyle.fill = { fgColor: { rgb: "FFF9C4" } };
                        } else if (category === "映像機器") {
                            cellStyle.fill = { fgColor: { rgb: "F3E5F5" } };
                        } else if (category === "家具・什器") {
                            cellStyle.fill = { fgColor: { rgb: "FFEBEE" } };
                        } else if (category === "車両") {
                            cellStyle.fill = { fgColor: { rgb: "E0F2F1" } };
                        }
                    }

                    // 備考欄で "⚠️" を含むセルを強調
                    if (C === 4 && ws[cellRef].v && String(ws[cellRef].v).includes("⚠️")) {
                        cellStyle.fill = { fgColor: { rgb: "FFF9E6" } };
                        cellStyle.font.color = { rgb: "D84315" };
                    }
                }

                ws[cellRef].s = cellStyle;
            }
        }

        // 5. ワークブックを作成
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "耐用年数ガイド");

        // メタデータを追加
        wb.Props = {
            Title: '資産・耐用年数マスターガイド（完全版）',
            Subject: 'エンタメ業界機材の減価償却資産耐用年数リスト',
            Author: 'GearTrace',
            CreatedDate: new Date()
        };

        // 6. Excelファイルとして出力
        const fileName = `GearTrace_耐用年数マスターガイド_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        return true;
    } catch (error) {
        console.error('Excel export failed:', error);
        return false;
    }
}

/**
 * マスターガイドのエントリー数を取得
 */
export function getMasterGuideEntryCount(): number {
    return ASSET_MASTER_GUIDE.length;
}

/**
 * マスターガイドのカテゴリ一覧を取得
 */
export function getMasterGuideCategories(): string[] {
    const categories = [...new Set(ASSET_MASTER_GUIDE.map(entry => entry.category))];
    return categories;
}

// 後方互換性のため、旧関数もエクスポート（内部的に新関数を使用）
export const downloadTaxGuideExcel = downloadMasterGuideExcel;
export const getTaxGuideEntryCount = getMasterGuideEntryCount;
export const getTaxGuideCategories = getMasterGuideCategories;
