import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Printer, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartStatusBadge } from "@/components/gear/SmartStatusBadge";
import { IdentificationBadge } from "@/components/gear/IdentificationBadge";
import type { Gear } from "@/types";

interface GearHeaderProps {
    gear: Gear;
    parentContainer?: Gear; // Made optional as it might be null
    onEdit: () => void;
    onLabel: () => void;
    onDelete: () => void;
}

export function GearHeader({ gear, parentContainer, onEdit, onLabel, onDelete }: GearHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Title & Status */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Button
                            onClick={() => navigate('/')}
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 min-w-0">
                            {/* Parent Link */}
                            {parentContainer && (
                                <div
                                    onClick={() => navigate(`/gear/${parentContainer.id}`)}
                                    className="flex items-center text-xs text-muted-foreground hover:text-primary cursor-pointer mb-1 transition-colors"
                                >
                                    <Package className="h-3 w-3 mr-1" />
                                    保管場所: {parentContainer.manufacturer} {parentContainer.model}
                                </div>
                            )}

                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight truncate flex items-center gap-2">
                                    {gear.manufacturer} {gear.model}
                                    {gear.quantity > 1 && (
                                        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                                            x{gear.quantity}
                                        </span>
                                    )}
                                </h1>

                                {/* Integrated Identification Badge */}
                                <IdentificationBadge
                                    color={gear.colorTag}
                                    serial={gear.serialNumber}
                                />

                                {/* Smart Status Badge */}
                                <SmartStatusBadge status={gear.status} />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                <span>{gear.category} {gear.subCategory && `/ ${gear.subCategory}`}</span>
                                {gear.isContainer && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                        <Package className="h-3 w-3 mr-1" /> コンテナ
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="hidden sm:flex" onClick={onEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            編集
                        </Button>
                        <Button variant="outline" size="sm" className="hidden sm:flex" onClick={onLabel}>
                            <Printer className="h-4 w-4 mr-2" />
                            ラベル
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDelete}
                            className="hidden sm:flex text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            削除
                        </Button>
                        {/* Mobile menu button could be added here later */}
                    </div>
                </div>
            </div>
        </div>
    );
}
