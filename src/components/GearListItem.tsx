import type { Gear } from "@/types";
import { ChevronRight } from "lucide-react";

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
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="md:col-span-1">
                    <div className="font-semibold truncate">{gear.manufacturer}</div>
                    <div className="text-sm text-muted-foreground truncate">{gear.model}</div>
                </div>

                <div className="hidden md:block text-sm text-muted-foreground">
                    {gear.category}
                </div>

                <div className="hidden md:block text-sm font-mono text-muted-foreground">
                    SN: {gear.serialNumber || '-'}
                </div>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
    );
}
