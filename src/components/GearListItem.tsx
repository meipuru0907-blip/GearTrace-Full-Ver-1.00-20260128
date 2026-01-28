import type { Gear } from "@/types";
import { ChevronRight, Package } from "lucide-react";
import { IdentificationBadge } from "@/components/gear/IdentificationBadge";
import { SmartStatusBadge } from "@/components/gear/SmartStatusBadge";

interface GearListItemProps {
    gear: Gear;
    onClick?: () => void;
}

export function GearListItem({ gear, onClick }: GearListItemProps) {
    return (
        <div
            className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={onClick}
        >
            {/* Thumbnail */}
            <div className="h-12 w-12 rounded bg-muted overflow-hidden shrink-0">
                {gear.photos?.hero ? (
                    <img
                        src={gear.photos.hero}
                        alt={gear.model}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">画像なし</div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                {/* Name */}
                <div className="md:col-span-1">
                    <div className="font-semibold truncate">{gear.manufacturer}</div>
                    <div className="text-sm text-muted-foreground truncate">{gear.model}</div>
                </div>

                {/* Identification Badge (Color + Serial) */}
                <div className="hidden md:flex items-center gap-2">
                    <IdentificationBadge
                        color={gear.colorTag}
                        serial={gear.serialNumber}
                    />
                    {gear.isContainer && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">
                            <Package className="h-3 w-3" />
                            コンテナ
                        </div>
                    )}
                </div>

                {/* Category (shown on larger screens) */}
                <div className="hidden lg:block text-sm text-muted-foreground">
                    {gear.category}
                </div>
            </div>

            {/* Smart Status Badge (Right side) */}
            <div className="shrink-0">
                <SmartStatusBadge status={gear.status} />
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
    );
}
