import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GearHeader } from "@/components/features/gear-detail/GearHeader";
import { GearPhotoSection } from "@/components/features/gear-detail/GearPhotoSection";
import { GearOverview } from "@/components/features/gear-detail/GearOverview";
import { GearInventory } from "@/components/features/gear-detail/GearInventory";
import { GearHistory } from "@/components/features/gear-detail/GearHistory";
import { GearDocuments } from "@/components/features/gear-detail/GearDocuments";
import { LabelPrintModal } from "@/components/gear/LabelPrintModal";
import { EditGearModal } from "@/components/gear/EditGearModal";

export default function GearDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialView = searchParams.get('view') || 'overview';
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLabelOpen, setIsLabelOpen] = useState(false);

    // Main Gear Data
    const gear = useLiveQuery(() => {
        return id ? db.gear.get(id) : undefined;
    }, [id]);

    // Related Data Queries
    const logs = useLiveQuery(() => {
        return id ? db.logs.where('gearId').equals(id).reverse().sortBy('date') : [];
    }, [id]);

    const contents = useLiveQuery(() => {
        return id ? db.gear.where('containerId').equals(id).toArray() : [];
    }, [id]);

    const parentContainer = useLiveQuery(async () => {
        if (!gear?.containerId) return null;
        return db.gear.get(gear.containerId);
    }, [gear?.containerId]);

    const handleDelete = async () => {
        if (!id || !confirm("本当にこの機材を削除しますか？")) return;

        try {
            await db.gear.delete(id);
            await db.logs.where('gearId').equals(id).delete();
            toast.success("機材を削除しました。");
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error("削除に失敗しました。");
        }
    };

    if (!gear) {
        return <Layout><div className="flex items-center justify-center h-96">Loading...</div></Layout>;
    }

    return (
        <Layout>
            <GearHeader
                gear={gear}
                parentContainer={parentContainer || undefined}
                onEdit={() => setIsEditOpen(true)}
                onLabel={() => setIsLabelOpen(true)}
                onDelete={handleDelete}
            />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6">

                    {/* Left Column: Photos */}
                    <GearPhotoSection gear={gear} />

                    {/* Right Column: Data Tabs */}
                    <div>
                        <Tabs defaultValue={initialView} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">概要</TabsTrigger>
                                <TabsTrigger value="contents" disabled={!gear.isContainer}>中身</TabsTrigger>
                                <TabsTrigger value="history">履歴</TabsTrigger>
                                <TabsTrigger value="documents">書類</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <GearOverview gear={gear} />
                            </TabsContent>

                            <TabsContent value="contents">
                                <GearInventory container={gear} contents={contents} />
                            </TabsContent>

                            <TabsContent value="history">
                                <GearHistory gearId={gear.id} logs={logs} />
                            </TabsContent>

                            <TabsContent value="documents">
                                <GearDocuments gear={gear} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isEditOpen && (
                <EditGearModal
                    gear={gear}
                    onClose={() => setIsEditOpen(false)}
                    onUpdate={() => setIsEditOpen(false)}
                />
            )}
            {isLabelOpen && (
                <LabelPrintModal
                    gear={gear}
                    onClose={() => setIsLabelOpen(false)}
                />
            )}
        </Layout>
    );
}
