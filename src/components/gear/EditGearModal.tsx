import { supabase } from "@/lib/supabase";
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
            const now = new Date().toISOString();

            if (values.statusBreakdown && Object.keys(values.statusBreakdown).length > 0) {
                // Split Logic
                const entries = Object.entries(values.statusBreakdown);
                const [firstStatus, firstQty] = entries[0];

                // 1. Update original
                const { error: updateError } = await supabase.from('gear').update({
                    name: values.name,
                    category: values.category,
                    manufacturer: values.manufacturer,
                    model: values.model,
                    serial_number: values.serialNumber,
                    color_tag: values.colorTag,
                    purchase_price: values.purchasePrice,
                    notes: values.notes,
                    lifespan: values.lifespan,
                    purchase_date: values.purchaseDate,

                    status: firstStatus,
                    quantity: firstQty,
                    updated_at: now,
                }).eq('id', gear.id);

                if (updateError) throw updateError;

                // 2. Create new records for the rest
                const remainingEntries = entries.slice(1);
                if (remainingEntries.length > 0) {
                    const newRecords = remainingEntries.map(([status, qty]) => ({
                        // Copy original properties that should persist
                        // We need to map camelCase Gear to snake_case DB columns manually or carefully
                        user_id: (gear as any).userId, // If we have it? Or just assume same user. 
                        // Actually better to not include user_id and let backend handle it? 
                        // But we need RLS. We should use `useAuth().user.id` or assume we can select `user_id` from original.
                        // Let's rely on copying relevant fields.
                        name: values.name,
                        category: values.category,
                        manufacturer: values.manufacturer,
                        model: values.model,
                        serial_number: values.serialNumber, // Typically serial might differ if splitting? But usually same batch.
                        photos: (gear as any).photos, // Need to persist photos
                        visual_tag_color: (gear as any).visualTagColor,
                        color_tag: values.colorTag,
                        purchase_price: values.purchasePrice,
                        is_container: (gear as any).isContainer,
                        // container_id: (gear as any).containerId, // Should the split items be in same container? Yes.
                        notes: values.notes,
                        lifespan: values.lifespan,
                        purchase_date: values.purchaseDate,

                        status: status,
                        quantity: qty,

                        // id is auto-generated or use crypto.randomUUID()
                        // supabase insert handles default id.
                    }));

                    // We need user_id for RLS insert.
                    // Fetch user_id from original gear or current auth user?
                    // Safe to fetch current user id via supabase.auth.getUser() if not available.
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        newRecords.forEach((r: any) => r.user_id = user.id);
                    }

                    // We also need `container_id` mapped correctly.
                    if (gear.containerId) {
                        newRecords.forEach((r: any) => r.container_id = gear.containerId);
                    }

                    const { error: insertError } = await supabase.from('gear').insert(newRecords);
                    if (insertError) throw insertError;
                }

                toast.success(`機材をステータスごとに分割・更新しました`);
            } else {
                // Normal Update
                const { error } = await supabase.from('gear').update({
                    name: values.name,
                    category: values.category,
                    manufacturer: values.manufacturer,
                    model: values.model,
                    serial_number: values.serialNumber,
                    color_tag: values.colorTag,
                    purchase_price: values.purchasePrice,
                    status: values.status,
                    is_container: values.isContainer,
                    // container_id: handled? If form allows changing container, we need it. 
                    // GearForm usually doesn't show container selector? 
                    // If not in values, we shouldn't overwrite it to null/undefined unless intended.
                    // safely omit container_id if not in values.
                    notes: values.notes,
                    quantity: values.quantity,
                    lifespan: values.lifespan,
                    purchase_date: values.purchaseDate,
                    updated_at: now,
                }).eq('id', gear.id);

                if (error) throw error;
                toast.success("機材情報を更新しました");
            }

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
