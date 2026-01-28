import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Gear, Log } from "@/types";

/**
 * Format value for display - returns "-" for empty/null values
 */
function formatValue(value: string | undefined | null): string {
    if (!value || value.trim() === "" || value === "N/A") {
        return "-";
    }
    return value;
}

/**
 * Create HTML template for sales sheet
 */
function createSalesSheetHTML(
    gear: Gear,
    logs?: Log[],
    selectedAccessories?: string[]
): string {
    const maintenanceLogs = logs?.filter(log =>
        log.type === "Repair" || log.type === "Maintenance"
    ) || [];

    const accessoriesHTML = selectedAccessories && selectedAccessories.length > 0
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

    // Photo sections
    const photoStyle = "width: 100%; height: 200px; border-radius: 8px; border: 2px solid #e5e7eb;";
    const placeholderStyle = "display: flex; align-items: center; justify-content: center; background: #f3f4f6; color: #9ca3af; font-size: 14px;";

    const heroPhotoHTML = gear.photos?.hero
        ? `<img src="${gear.photos.hero}" style="${photoStyle} object-fit: cover;" alt="Hero Photo" />`
        : `<div style="${photoStyle} ${placeholderStyle}">📷 写真を追加</div>`;

    const serialPhotoHTML = gear.photos?.serial
        ? `<img src="${gear.photos.serial}" style="${photoStyle} object-fit: cover;" alt="Serial Photo" />`
        : `<div style="${photoStyle} ${placeholderStyle}">📷 写真を追加</div>`;

    const featurePhotoHTML = gear.photos?.feature
        ? `<img src="${gear.photos.feature}" style="${photoStyle} object-fit: cover;" alt="Feature Photo" />`
        : `<div style="${photoStyle} ${placeholderStyle}">📷 写真を追加</div>`;

    return `
        <div style="
            width: 794px;
            height: 1123px;
            background: white;
            padding: 40px;
            font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'メイリオ', Meiryo, sans-serif;
            color: #333;
            box-sizing: border-box;
            position: relative;
        ">
            <!-- Header -->
            <div style="border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1e40af;">
                    GearTrace 販売シート
                </h1>
                <p style="margin: 8px 0 0 0; color: #666; font-size: 12px;">
                    作成日: ${new Date().toLocaleDateString('ja-JP')}
                </p>
            </div>

            <!-- Product Name -->
            <div style="margin-bottom: 16px;">
                <h2 style="margin: 0; font-size: 22px; font-weight: bold; color: #1f2937;">
                    ${gear.manufacturer} ${gear.model}
                </h2>
            </div>

            <!-- Photos Section -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #374151; border-left: 4px solid #ec4899; padding-left: 12px;">
                    写真
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                    <div>
                        <div style="font-size: 11px; margin-bottom: 4px; color: #6b7280; font-weight: 600;">メイン写真</div>
                        ${heroPhotoHTML}
                    </div>
                    <div>
                        <div style="font-size: 11px; margin-bottom: 4px; color: #6b7280; font-weight: 600;">シリアル番号</div>
                        ${serialPhotoHTML}
                    </div>
                    <div>
                        <div style="font-size: 11px; margin-bottom: 4px; color: #6b7280; font-weight: 600;">特徴/傷</div>
                        ${featurePhotoHTML}
                    </div>
                </div>
            </div>

            <!-- Specs Table -->
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

            <!-- Maintenance History -->
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

            <!-- Footer -->
            <div style="position: absolute; bottom: 30px; left: 40px; right: 40px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 10px;">
                このドキュメントは GearTrace により生成されました - プロフェッショナル機材管理システム
            </div>
        </div>
    `;
}

/**
 * Generate professional A4 sales sheet PDF using html2canvas
 * This method renders HTML as an image to avoid Japanese font issues
 */
export async function generateSalesSheetPDF(
    gear: Gear,
    logs?: Log[],
    selectedAccessories?: string[]
): Promise<Blob> {
    // Create temporary container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    try {
        // Set HTML content
        container.innerHTML = createSalesSheetHTML(gear, logs, selectedAccessories);

        // Wait for fonts to load
        await document.fonts.ready;

        // Capture as canvas
        const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true
        });

        // Create PDF (A4 size: 210mm x 297mm)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 210;
        const pdfHeight = 297;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        return pdf.output('blob');
    } finally {
        // Clean up
        document.body.removeChild(container);
    }
}
