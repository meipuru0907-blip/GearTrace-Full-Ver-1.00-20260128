import type { Gear } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface GearCardProps {
    gear: Gear;
    onClick?: () => void;
}

export function GearCard({ gear, onClick }: GearCardProps) {
    const { t } = useLanguage();

    const statusColor = useMemo(() => {
        switch (gear.status) {
            case 'Available': return 'default'; // Primary/Black
            case 'InUse': return 'secondary'; // Gray/Blueish
            case 'Maintenance': return 'destructive'; // Red
            case 'Broken': return 'destructive';
            case 'Sold': return 'outline';
            default: return 'default';
        }
    }, [gear.status]);

    return (
        <Card
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={onClick}
        >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {gear.photos.hero ? (
                    <img
                        src={gear.photos.hero}
                        alt={gear.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No Image
                    </div>
                )}

            </div>
            <CardHeader className="p-4">
                <h3 className="font-semibold leading-none tracking-tight">{gear.manufacturer} {gear.model}</h3>
                <p className="text-sm text-muted-foreground">{gear.category} {gear.subCategory && `/ ${gear.subCategory}`}</p>
            </CardHeader>
            <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between">
                <span>{t('dashboard.sn')}: {gear.serialNumber || 'N/A'}</span>
            </CardFooter>
        </Card>
    );
}
