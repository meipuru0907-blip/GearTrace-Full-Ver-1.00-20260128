import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Boxes, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContainerContentEditor } from "@/components/gear/ContainerContentEditor";
import type { Gear } from "@/types";

interface GearInventoryProps {
    container: Gear;
    contents: Gear[] | undefined;
}

export function GearInventory({ container, contents }: GearInventoryProps) {
    const navigate = useNavigate();
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    return (
        <div className="space-y-4 mt-4">
            <Card className="border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center">
                        <Boxes className="h-5 w-5 mr-2" />
                        収納されている機材 ({contents?.length || 0})
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsEditorOpen(true)}>
                        <Settings2 className="h-4 w-4 mr-1" />
                        中身を編集
                    </Button>
                </CardHeader>
                <CardContent>
                    {contents && contents.length > 0 ? (
                        <div className="space-y-2">
                            {contents.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/gear/${item.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.photos?.hero ? (
                                            <img src={item.photos.hero} alt="" className="w-10 h-10 rounded object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium">{item.manufacturer} {item.model}</div>
                                            <div className="text-xs text-muted-foreground">{item.category}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {item.quantity > 1 && (
                                            <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                                                x{item.quantity}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Boxes className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>まだ何も収納されていません</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ContainerContentEditor
                container={container}
                open={isEditorOpen}
                onOpenChange={setIsEditorOpen}
            />
        </div>
    );
}
