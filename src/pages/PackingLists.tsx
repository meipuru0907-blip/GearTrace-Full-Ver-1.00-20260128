import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ProFeature } from "@/components/common/ProFeature";
import { Plus, ListChecks } from "lucide-react";
import { useState } from "react";
import { db } from "@/db";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";

export default function PackingLists() {
    // In MVP, we just show the gating. Real data fetching would be here.
    const packingLists = useLiveQuery(() => db.packingLists.toArray());

    const handleCreateList = () => {
        // This function would only be reachable if unlocked (Pro)
        // For MVP, we can just show a toast or implement actual creation logic later
        console.log("Create list clicked");
    };

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">持ち出しリスト</h1>
                    <ProFeature>
                        <Button onClick={handleCreateList}>
                            <Plus className="mr-2 h-4 w-4" /> 新規リスト作成
                        </Button>
                    </ProFeature>
                </div>

                {packingLists && packingLists.length > 0 ? (
                    <div className="grid gap-4">
                        {packingLists.map(list => (
                            <div key={list.id} className="p-4 border rounded-lg bg-card">
                                <h3 className="font-semibold">{list.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {format(list.createdAt, 'yyyy/MM/dd')}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed rounded-lg bg-muted/10">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <ListChecks className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">リストがありません</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            機材を選んで持ち出しリストを作成しましょう。
                            現場ごとの機材管理に役立ちます。
                        </p>
                        <ProFeature>
                            <Button onClick={handleCreateList} variant="outline">
                                <Plus className="mr-2 h-4 w-4" /> 最初のリストを作成
                            </Button>
                        </ProFeature>
                    </div>
                )}
            </div>
        </Layout>
    );
}
