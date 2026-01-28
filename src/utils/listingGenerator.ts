import { differenceInMonths, differenceInYears } from "date-fns";
import type { Gear, Log } from "@/types";

/**
 * Calculate ownership period in human-readable format
 * Example: "約2年半" (about 2.5 years)
 */
function calculateOwnershipPeriod(purchaseDate: string): string {
    const purchase = new Date(purchaseDate);
    const now = new Date();

    const years = differenceInYears(now, purchase);
    const months = differenceInMonths(now, purchase) % 12;

    if (years === 0) {
        if (months === 0) return "1ヶ月未満";
        return `約${months}ヶ月`;
    }

    if (months < 3) {
        return `約${years}年`;
    } else if (months < 9) {
        return `約${years}年半`;
    } else {
        return `約${years + 1}年`;
    }
}

/**
 * Mask serial number (last 3 digits) for privacy
 * Example: "ABC12345678" -> "ABC12345***"
 */
function maskSerialNumber(serial: string | undefined): string {
    if (!serial || serial === "N/A") return "シリアルNo省略";
    if (serial.length <= 3) return "***";
    return serial.slice(0, -3) + "***";
}

/**
 * Extract most recent maintenance/repair log for value-add messaging
 */
function getMaintenanceHighlight(logs: Log[] | undefined): string | null {
    if (!logs || logs.length === 0) return null;

    const maintenanceLogs = logs
        .filter(log => log.type === "Repair" || log.type === "Maintenance")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (maintenanceLogs.length === 0) return null;

    const latest = maintenanceLogs[0];
    const year = new Date(latest.date).getFullYear();
    return `${year}年に${latest.description}を実施済み`;
}

/**
 * Generate flea market listing text (Mercari, Yahoo Auctions, etc.)
 */
export function generateListingText(gear: Gear, logs?: Log[]): string {
    const ownershipPeriod = calculateOwnershipPeriod(gear.purchaseDate);
    const maskedSerial = maskSerialNumber(gear.serialNumber);
    const maintenanceNote = getMaintenanceHighlight(logs);

    const sections: string[] = [];

    // 1. Greeting
    sections.push("ご覧いただきありがとうございます。");
    sections.push("");

    // 2. Product Name
    sections.push(`【商品名】`);
    sections.push(`${gear.manufacturer} ${gear.model}`);
    sections.push("");

    // 3. Condition & Usage
    sections.push(`【状態・使用歴】`);
    sections.push(`購入から${ownershipPeriod}使用しました。`);
    sections.push("非喫煙・ペットなし環境での使用です。");

    if (gear.notes && gear.notes.trim()) {
        sections.push(`状態: ${gear.notes}`);
    } else {
        sections.push("目立った傷や汚れはなく、良好な状態です。");
    }
    sections.push("");

    // 4. Maintenance History (if any)
    if (maintenanceNote) {
        sections.push(`【メンテナンス履歴】`);
        sections.push(`※${maintenanceNote}`);
        sections.push("動作は良好で、すぐにお使いいただけます。");
        sections.push("");
    }

    // 5. Specs
    sections.push(`【仕様】`);
    sections.push(`メーカー: ${gear.manufacturer}`);
    sections.push(`型番: ${gear.model}`);
    sections.push(`カテゴリー: ${gear.category}`);
    sections.push(`シリアルNo: ${maskedSerial}`);
    sections.push("");

    // 6. Accessories
    sections.push(`【付属品】`);
    sections.push("写真に写っているものが全てです。");
    sections.push("");

    // 7. Closing
    sections.push("即購入OKです。丁寧な梱包を心がけます。");
    sections.push("ご質問があればお気軽にコメントください。");

    return sections.join("\n");
}
