import XLSX from 'xlsx-js-style';
import { format } from 'date-fns';
import type { Gear } from '@/types';
import { getStatusLabel } from '@/utils/constants';

/**
 * 確定申告用データ（減価償却費の計算）をスタイリング付きでExcel出力
 */
export const exportTaxLedger = (gears: Gear[]) => {
    const data = gears.map((gear) => {
        const purchasePrice = gear.purchasePrice;
        const purchaseDate = new Date(gear.purchaseDate);
        const lifespan = gear.lifespan || 5;

        // Calc current year depreciation (simplified)
        const depreciationRate = 1 / lifespan;
        const depreciationAmount = Math.floor(purchasePrice * depreciationRate);
        const yearsElapsed = (new Date().getFullYear()) - purchaseDate.getFullYear();

        let currentBookValue = purchasePrice - (depreciationAmount * yearsElapsed);
        if (currentBookValue < 1) currentBookValue = 1;

        return {
            '資産名称': `${gear.manufacturer} ${gear.model}`,
            '取得年月': gear.purchaseDate,
            '取得価額': purchasePrice,
            '耐用年数': lifespan,
            '本年償却額(見積)': depreciationAmount,
            '期末帳簿価額(見積)': currentBookValue,
            '摘要': gear.serialNumber || ''
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

    // カラム幅を設定
    const max_width = data.reduce((w, r) => Math.max(w, r['資産名称'].length), 10);
    worksheet["!cols"] = [
        { wch: Math.max(max_width, 25) },  // 資産名称
        { wch: 12 },  // 取得年月
        { wch: 12 },  // 取得価額
        { wch: 10 },  // 耐用年数
        { wch: 16 },  // 本年償却額
        { wch: 16 },  // 期末帳簿価額
        { wch: 22 }   // 摘要
    ];

    // スタイルを適用
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (!worksheet[cellRef]) continue;

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
                cellStyle.fill = { fgColor: { rgb: "2F75B5" } };
                cellStyle.font = {
                    ...cellStyle.font,
                    color: { rgb: "FFFFFF" },
                    bold: true,
                    sz: 12
                };
                cellStyle.alignment = { horizontal: "center", vertical: "center" };
            } else {
                // データ行
                if (C >= 2 && C <= 5) {
                    // 数値列は右揃え
                    cellStyle.alignment.horizontal = "right";
                    // 金額列は数値フォーマット
                    if (C === 2 || C === 4 || C === 5) {
                        worksheet[cellRef].z = '#,##0';
                    }
                }
                // 耐用年数列は中央揃え
                if (C === 3) {
                    cellStyle.alignment.horizontal = "center";
                    cellStyle.font.bold = true;
                }
            }

            worksheet[cellRef].s = cellStyle;
        }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "減価償却費の計算");

    // メタデータ
    workbook.Props = {
        Title: '確定申告用データ（減価償却費の計算）',
        Subject: 'GearTrace資産管理システム',
        Author: 'GearTrace',
        CreatedDate: new Date()
    };

    // ダウンロード
    XLSX.writeFile(workbook, `確定申告用データ_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};

/**
 * 全機材データを日本語でExcel出力
 * ステータスなど全て日本語で表示される
 */
export const exportAllGear = (gears: Gear[]) => {
    const data = gears.map((gear) => ({
        'メーカー': gear.manufacturer,
        'モデル名': gear.model,
        '機材名': gear.name || '',
        'カテゴリ': gear.category,
        'サブカテゴリ': gear.subCategory || '',
        'ステータス': getStatusLabel(gear.status), // 日本語化
        'シリアル番号': gear.serialNumber || '',
        '数量': gear.quantity || 1,
        '購入日': gear.purchaseDate,
        '購入価格': gear.purchasePrice,
        '耐用年数': gear.lifespan,
        'コンテナ': gear.isContainer ? 'はい' : 'いいえ',
        'メモ': gear.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    // カラム幅を設定
    worksheet["!cols"] = [
        { wch: 20 },  // メーカー
        { wch: 20 },  // モデル名
        { wch: 20 },  // 機材名
        { wch: 15 },  // カテゴリ
        { wch: 15 },  // サブカテゴリ
        { wch: 15 },  // ステータス
        { wch: 20 },  // シリアル番号
        { wch: 8 },   // 数量
        { wch: 12 },  // 購入日
        { wch: 12 },  // 購入価格
        { wch: 10 },  // 耐用年数
        { wch: 10 },  // コンテナ
        { wch: 30 }   // メモ
    ];

    // スタイルを適用
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (!worksheet[cellRef]) continue;

            const cellStyle: any = {
                border: {
                    top: { style: "thin", color: { rgb: "CCCCCC" } },
                    bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                    left: { style: "thin", color: { rgb: "CCCCCC" } },
                    right: { style: "thin", color: { rgb: "CCCCCC" } }
                },
                alignment: { vertical: "center" },
                font: { name: "Yu Gothic", sz: 10 }
            };

            if (R === 0) {
                // ヘッダー行
                cellStyle.fill = { fgColor: { rgb: "4472C4" } };
                cellStyle.font = {
                    ...cellStyle.font,
                    color: { rgb: "FFFFFF" },
                    bold: true,
                    sz: 11
                };
                cellStyle.alignment = { horizontal: "center", vertical: "center" };
            } else {
                // データ行
                // 数値列は右揃え
                if (C === 7 || C === 8 || C === 9 || C === 10) {
                    cellStyle.alignment.horizontal = "right";
                    // 金額列は数値フォーマット
                    if (C === 9) {
                        worksheet[cellRef].z = '#,##0';
                    }
                }
                // ステータス列は中央揃え
                if (C === 5 || C === 11) {
                    cellStyle.alignment.horizontal = "center";
                }
            }

            worksheet[cellRef].s = cellStyle;
        }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "機材一覧");

    // メタデータ
    workbook.Props = {
        Title: '機材一覧データ',
        Subject: 'GearTrace機材管理システム',
        Author: 'GearTrace',
        CreatedDate: new Date()
    };

    // ダウンロード
    XLSX.writeFile(workbook, `機材一覧_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};
