import type { Gear, Log, PackingList } from "@/types";

/**
 * Format value for display - returns "-" for empty/null values
 */
function formatValue(value: string | undefined | null | number): string {
    if (value === undefined || value === null || value === "" || value === "N/A") {
        return "-";
    }
    return String(value);
}

const COMMON_STYLES = `
    font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'メイリオ', Meiryo, sans-serif;
    color: #333;
    box-sizing: border-box;
    width: 794px; /* A4 width at 96dpi (approx) */
    background: white;
    padding: 40px;
    position: relative;
`;

export function createResaleSheetHTML(
    gear: Gear,
    logs: Log[] = [],
    selectedAccessories: string[] = []
): string {
    const maintenanceLogs = logs.filter(log =>
        log.type === "Repair" || log.type === "Maintenance"
    );

    const accessoriesHTML = selectedAccessories.length > 0
        ? selectedAccessories.map(item => `
            <div style="display: inline-block; width: 48%; margin: 4px 0;">
                ✓ ${item}
            </div>
        `).join('')
        : '<div style="color: #999; font-style: italic;">付属品が選択されていません</div>';

    const maintenanceHTML = maintenanceLogs.length > 0
        ? maintenanceLogs.slice(0, 5).map(log => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${log.date}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${log.type}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${log.description}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${log.cost ? `¥${log.cost.toLocaleString()}` : '-'}</td>
            </tr>
        `).join('')
        : '<tr><td colspan="4" style="padding: 12px; color: #999; text-align: center; font-style: italic;">メンテナンス履歴がありません</td></tr>';

    const photoStyle = "width: 100%; height: 200px; border-radius: 8px; border: 2px solid #e5e7eb; object-fit: cover;";
    const placeholderStyle = "display: flex; align-items: center; justify-content: center; background: #f3f4f6; color: #9ca3af; font-size: 14px;";

    const getPhotoHTML = (src?: string, label?: string) => `
        <div>
            <div style="font-size: 11px; margin-bottom: 4px; color: #6b7280; font-weight: 600;">${label}</div>
            ${src
            ? `<img src="${src}" style="${photoStyle}" alt="${label}" />`
            : `<div style="${photoStyle} ${placeholderStyle}">No Photo</div>`
        }
        </div>
    `;

    return `
        <div style="${COMMON_STYLES} height: 1123px;">
            <!-- Header -->
            <div style="border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1e40af;">
                    GearTrace 販売シート
                </h1>
                <p style="margin: 8px 0 0 0; color: #666; font-size: 12px;">
                    作成日: ${new Date().toLocaleDateString('ja-JP')}
                </p>
            </div>

            <div style="margin-bottom: 16px;">
                <h2 style="margin: 0; font-size: 22px; font-weight: bold; color: #1f2937;">
                    ${gear.manufacturer} ${gear.model}
                </h2>
            </div>

            <!-- Photos -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #374151; border-left: 4px solid #ec4899; padding-left: 12px;">
                    写真
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                    ${getPhotoHTML(gear.photos?.hero, 'メイン写真')}
                    ${getPhotoHTML(gear.photos?.serial, 'シリアル番号')}
                    ${getPhotoHTML(gear.photos?.feature, '特徴/傷')}
                </div>
            </div>

            <!-- Specs -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #374151; border-left: 4px solid #3b82f6; padding-left: 12px;">
                    基本仕様
                </h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr style="background: #f3f4f6;">
                        <td style="padding: 8px; border: 1px solid #d1d5db; font-weight: bold; width: 30%;">メーカー</td>
                        <td style="padding: 8px; border: 1px solid #d1d5db;">${formatValue(gear.manufacturer)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #d1d5db; font-weight: bold;">モデル名</td>
                        <td style="padding: 8px; border: 1px solid #d1d5db;">${formatValue(gear.model)}</td>
                    </tr>
                    <tr style="background: #f3f4f6;">
                        <td style="padding: 8px; border: 1px solid #d1d5db; font-weight: bold;">カテゴリー</td>
                        <td style="padding: 8px; border: 1px solid #d1d5db;">${formatValue(gear.category)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #d1d5db; font-weight: bold;">シリアル番号</td>
                        <td style="padding: 8px; border: 1px solid #d1d5db;">${formatValue(gear.serialNumber)}</td>
                    </tr>
                    <tr style="background: #f3f4f6;">
                        <td style="padding: 8px; border: 1px solid #d1d5db; font-weight: bold;">購入日</td>
                        <td style="padding: 8px; border: 1px solid #d1d5db;">${formatValue(gear.purchaseDate)}</td>
                    </tr>
                </table>
            </div>

            <!-- Maintenance -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #374151; border-left: 4px solid #10b981; padding-left: 12px;">
                    メンテナンス履歴
                </h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <tr style="background: #10b981; color: white;">
                        <th style="padding: 8px; border: 1px solid #059669; text-align: left;">日付</th>
                        <th style="padding: 8px; border: 1px solid #059669; text-align: left;">種類</th>
                        <th style="padding: 8px; border: 1px solid #059669; text-align: left;">内容</th>
                        <th style="padding: 8px; border: 1px solid #059669; text-align: left;">費用</th>
                    </tr>
                    ${maintenanceHTML}
                </table>
            </div>

            <!-- Accessories -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #374151; border-left: 4px solid #f59e0b; padding-left: 12px;">
                    付属品
                </h3>
                <div style="padding: 14px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; font-size: 13px;">
                    ${accessoriesHTML}
                </div>
            </div>

             <div style="position: absolute; bottom: 30px; left: 40px; right: 40px; text-align: center; color: #9ca3af; font-size: 10px;">
                Generated by GearTrace
            </div>
        </div>
    `;
}

export function createPackingListHTML(
    list: PackingList,
    items: { gear: Gear; count: number }[]
): string {
    const itemsHTML = items.map((item, index) => {
        const { gear, count } = item;
        return `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px; text-align: center; color: #6b7280;">${index + 1}</td>
                <td style="padding: 10px;">
                    <div style="font-weight: bold; color: #1f2937;">${gear.manufacturer} ${gear.model}</div>
                    <div style="font-size: 11px; color: #6b7280;">${gear.category} ${gear.serialNumber ? `(S/N: ${gear.serialNumber})` : ''}</div>
                </td>
                <td style="padding: 10px; text-align: center;">
                    <span style="display: inline-block; background: #f3f4f6; padding: 2px 8px; border-radius: 12px; font-weight: bold; font-size: 12px;">
                        ${count}
                    </span>
                </td>
                <td style="padding: 10px;">
                    <div style="width: 16px; height: 16px; border: 2px solid #d1d5db; border-radius: 4px; margin: 0 auto;"></div>
                </td>
            </tr>
        `;
    }).join("");

    return `
        <div style="${COMMON_STYLES} min-height: 1123px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #000; padding-bottom: 16px; margin-bottom: 30px;">
                <div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">PACKING LIST</h1>
                    <div style="margin-top: 8px; font-size: 18px; color: #4b5563;">${list.name}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 14px; color: #6b7280;">DATE</div>
                    <div style="font-size: 18px; font-weight: bold;">${list.date}</div>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 10px; width: 40px; text-align: center; color: #6b7280;">#</th>
                        <th style="padding: 10px; text-align: left; color: #6b7280;">ITEM</th>
                        <th style="padding: 10px; width: 60px; text-align: center; color: #6b7280;">QTY</th>
                        <th style="padding: 10px; width: 40px; text-align: center; color: #6b7280;">CHK</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <div style="margin-top: 40px; border-top: 1px dotted #ccc; padding-top: 10px;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #6b7280;">NOTES</h3>
                <div style="min-height: 100px; background: #f9fafb; border-radius: 6px; padding: 12px; font-size: 12px; color: #333;">
                    <!-- Notes placeholder -->
                </div>
            </div>

             <div style="position: absolute; bottom: 30px; left: 40px; right: 40px; text-align: center; color: #9ca3af; font-size: 10px;">
                Generated by GearTrace
            </div>
        </div>
    `;
}
