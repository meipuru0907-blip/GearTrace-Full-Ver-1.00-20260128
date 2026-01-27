import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ColorTaggerProps {
    selectedColor?: string;
    onSelect: (color: string) => void;
    colors?: string[];
}

const DEFAULT_COLORS = [
    '#ef4444', // Red 500
    '#3b82f6', // Blue 500
    '#eab308', // Yellow 500
    '#22c55e', // Green 500
    '#a855f7', // Purple 500
    '#ec4899', // Pink 500
    '#f97316', // Orange 500
    '#64748b', // Slate 500
];

export function ColorTagger({ selectedColor, onSelect, colors = DEFAULT_COLORS }: ColorTaggerProps) {
    const { t } = useLanguage();

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium leading-none">
                {t('addGear.visualTag')}
            </label>
            <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                    <button
                        key={color}
                        type="button"
                        className={cn(
                            "h-8 w-8 rounded-full border-2 border-transparent transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            selectedColor === color && "border-white ring-2 ring-primary ring-offset-2 scale-110 shadow-md"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => onSelect(color)}
                        aria-label={`Select color ${color}`}
                    >
                        {selectedColor === color && <Check className="h-4 w-4 m-auto text-white drop-shadow-sm" />}
                    </button>
                ))}
                <button
                    type="button"
                    className={cn(
                        "h-8 w-8 rounded-full border border-dashed border-muted-foreground flex items-center justify-center text-xs text-muted-foreground hover:bg-muted",
                        !selectedColor && "ring-2 ring-primary"
                    )}
                    onClick={() => onSelect('')}
                >
                    {t('addGear.visualTagOff')}
                </button>
            </div>
            <p className="text-xs text-muted-foreground">
                {t('addGear.visualTagDesc')}
            </p>
        </div>
    );
}
