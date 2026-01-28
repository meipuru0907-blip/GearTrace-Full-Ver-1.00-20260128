import { db } from "@/db";
import type { Gear } from "@/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { GearForm, type GearFormValues } from "@/components/features/gear-form/GearForm";

interface EditGearModalProps {
    gear: Gear;
    onClose: () => void;
    onUpdate: () => void;
}

export function EditGearModal({ gear, onClose, onUpdate }: EditGearModalProps) {
    const handleFormSubmit = async (values: GearFormValues) => {
        try {
            await db.gear.update(gear.id, {
                ...values,
                colorTag: values.colorTag as Gear['colorTag'],
                updatedAt: Date.now(),
            });

            toast.success("機材情報を更新しました");
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("更新に失敗しました");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
                    <h2 className="text-xl font-bold">機材情報を編集</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <GearForm
                        defaultValues={gear}
                        onSubmit={handleFormSubmit}
                        onCancel={onClose}
                        submitLabel="更新"
                    />
                </div>
            </div>
        </div>
    );
}
