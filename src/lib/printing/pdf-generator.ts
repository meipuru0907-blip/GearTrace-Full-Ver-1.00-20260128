import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Gear, Log, PackingList } from "@/types";
import { createResaleSheetHTML, createPackingListHTML } from "./pdf-templates";

export class PdfService {
    private static async generatePdfFromHtml(html: string, filename: string): Promise<void> {
        // Create container
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);

        try {
            container.innerHTML = html;
            await document.fonts.ready;

            // Wait a bit for images to load if they are not base64 (though our templates use base64 mostly or fast loads)
            // HTML2Canvas capture
            const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            // A4 dimensions in mm
            const pdfWidth = 210;


            // Calculate height ratio to see if we need multiple pages (not implemented yet for this simple version, typically one page)
            // But for Packing Lists it might be long.
            // For now, let's assume single page scaling or fit-to-width.
            // The template uses fixed width 794px (~210mm at 96dpi).
            // We just map it 1:1 to A4.

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfImageHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // If height > 297, we might need auto-paging, but jsPDF addImage doesn't auto-page.
            // For MVP, we just print as is, maybe it gets cut off if too long. 
            // Better approach for long lists: multiple canvas captures or jspdf autotable (but autotable has font issues).
            // Current Compromise: Fit to one page or just let it cut off. 
            // Ideally packing list should use multi-page if needed.
            // Let's stick to single page for now unless requested.

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfImageHeight);
            pdf.save(filename);

        } catch (error) {
            console.error("PDF Generation failed", error);
            throw error;
        } finally {
            document.body.removeChild(container);
        }
    }

    static async exportResaleSheet(gear: Gear, logs: Log[] = [], accessories: string[] = []) {
        const html = createResaleSheetHTML(gear, logs, accessories);
        await this.generatePdfFromHtml(html, `${gear.manufacturer}_${gear.model}_resale_sheet.pdf`);
    }

    static async exportPackingList(list: PackingList, items: { gear: Gear; count: number }[]) {
        const html = createPackingListHTML(list, items);
        await this.generatePdfFromHtml(html, `${list.name.replace(/\s+/g, '_')}_packing_list.pdf`);
    }
}
