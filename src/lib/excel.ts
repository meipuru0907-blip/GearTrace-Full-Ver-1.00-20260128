import XLSX from 'xlsx-js-style';
import { format } from 'date-fns';
import type { Gear } from '@/types';


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


