import { useState } from 'react';
import type { Gear } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { db } from "@/db";
import { toast } from "sonner";

interface GearCardProps {
    gear: Gear;
    onClick?: () => void;
}

export function GearCard({ gear, onClick }: GearCardProps) {
    const { t } = useLanguage();
    const [isChangingStatus, setIsChangingStatus] = useState(false);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation(); // Prevent card click
        const newStatus = e.target.value;
        setIsChangingStatus(true);

        try {
            await db.gear.update(gear.id, {
                status: newStatus as any,
                updatedAt: Date.now()
            });
            toast.success("ステータスを更新しました！");
        } catch (error) {
            console.error(error);
            toast.error("ステータスの更新に失敗しました。");
        } finally {
            setIsChangingStatus(false);
        }
    };

    return (
        <Card
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={onClick}
        >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {gear.photos?.hero ? (
                    <img
                        src={gear.photos.hero}
                        alt={gear.model}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('placeholder.svg')) return;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='48' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
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
            <CardFooter className="p-4 pt-0 text-xs flex flex-col gap-2">
                <div className="text-muted-foreground flex justify-between w-full">
                    <span>{t('dashboard.sn')}: {gear.serialNumber || 'N/A'}</span>
                </div>
                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                    <select
                        value={gear.status}
                        onChange={handleStatusChange}
                        disabled={isChangingStatus}
                        className="w-full px-2 py-1 text-xs border rounded-md bg-background hover:bg-accent transition-colors"
                    >
                        <option value="Available">稼働中</option>
                        <option value="Maintenance">メンテナンス中</option>
                        <option value="Repair">修理中</option>
                        <option value="Broken">故障</option>
                        <option value="Missing">紛失</option>
                    </select>
                </div>
            </CardFooter>
        </Card>
    );
}
