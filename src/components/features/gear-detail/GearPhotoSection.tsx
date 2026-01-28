import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { db } from "@/db";
import type { Gear } from "@/types";

interface GearPhotoSectionProps {
    gear: Gear;
}

export function GearPhotoSection({ gear }: GearPhotoSectionProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<'hero' | 'serial' | 'feature'>('hero');
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // @ts-ignore
    const currentPhoto = gear.photos?.[selectedPhoto] || null;

    const handlePhotoUpload = async (type: 'hero' | 'serial' | 'feature', event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !gear.id) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            try {
                // @ts-ignore
                const updates: any = { updatedAt: Date.now() };
                updates[`photos.${type}`] = base64;

                await db.gear.update(gear.id, updates);
                toast.success("写真をアップロードしました！");
            } catch (error) {
                console.error(error);
                toast.error("アップロードに失敗しました。");
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-4">
            {/* Main Photo */}
            <Card className="overflow-hidden border-border shadow-sm">
                <CardContent className="p-0">
                    <div
                        className="relative aspect-[4/3] bg-muted cursor-pointer group"
                        onClick={() => fileInputRefs.current[selectedPhoto]?.click()}
                    >
                        {currentPhoto ? (
                            <img
                                src={currentPhoto}
                                alt={`${gear.manufacturer} ${gear.model}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src.includes('placeholder.svg')) return;
                                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='48' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Camera className="h-16 w-16 mb-3" />
                                <span className="text-sm">クリックして写真を追加</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Camera className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Photo Thumbnails */}
            <div className="grid grid-cols-3 gap-2">
                {(['hero', 'serial', 'feature'] as const).map(type => {
                    // @ts-ignore
                    const photoSrc = gear.photos?.[type];
                    return (
                        <div key={type} className="relative">
                            <input
                                ref={(el) => { fileInputRefs.current[type] = el; }}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(type, e)}
                                className="hidden"
                            />
                            <div
                                className={`relative aspect-video bg-muted rounded border-2 cursor-pointer hover:border-primary transition-colors ${selectedPhoto === type ? 'border-primary' : 'border-transparent'
                                    }`}
                                onClick={() => setSelectedPhoto(type)}
                            >
                                {photoSrc ? (
                                    <img src={photoSrc} alt={type} className="object-cover w-full h-full rounded" />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Camera className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="absolute bottom-1 left-1 bg-black/70 text-white px-1.5 py-0.5 text-[9px] rounded uppercase font-bold">
                                    {type}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
