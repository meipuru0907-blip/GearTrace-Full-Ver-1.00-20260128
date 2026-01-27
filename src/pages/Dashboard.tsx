import { useLiveQuery } from "dexie-react-hooks";
import { useLanguage } from "@/contexts/LanguageContext";
import { db } from "@/db";
import { GearCard } from "@/components/GearCard";
import { GearListItem } from "@/components/GearListItem";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, AlignJustify, Download, Maximize2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { utils, write } from "xlsx";
import { ProFeature } from "@/components/common/ProFeature";

export default function Dashboard() {
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'large'>('grid');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const { t } = useLanguage();
    const navigate = useNavigate();

    const gears = useLiveQuery(async () => {
        let collection = db.gear.orderBy('createdAt').reverse();
        let results = await collection.toArray();

        // Apply search filter
        if (search) {
            results = results.filter(g =>
                g.model.toLowerCase().includes(search.toLowerCase()) ||
                g.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
                g.category.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'All') {
            results = results.filter(g => g.status === statusFilter);
        }

        // Apply category filter
        if (categoryFilter !== 'All') {
            results = results.filter(g => g.category === categoryFilter);
        }

        return results;
    }, [search, statusFilter, categoryFilter]);

    // Get unique categories for filter dropdown
    const categories = useLiveQuery(async () => {
        const allGears = await db.gear.toArray();
        const uniqueCategories = [...new Set(allGears.map(g => g.category))];
        return uniqueCategories.sort();
    }, []);

    const handleExportXlsx = () => {
        if (!gears || gears.length === 0) return;

        try {
            // Japanese Fixed Asset Ledger format
            const data = gears.map(g => {
                return {
                    "資産ID": g.id,
                    "メーカー": g.manufacturer,
                    "モデル名": g.model,
                    "カテゴリー": g.category,
                    "シリアル番号": g.serialNumber,
                    "ステータス": g.status,
                    "取得年月日": g.purchaseDate,
                    "取得価額": g.purchasePrice,
                    "耐用年数": g.lifespan
                };
            });

            const ws = utils.json_to_sheet(data);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Assets");

            // Generate filename with current date
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            const filename = `GearTrace_Export_${dateStr}.xlsx`;

            // Write file using Blob for consistent filename handling
            const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success(t('dashboard.syncSuccess'));
        } catch (err) {
            console.error(err);
            toast.error(t('dashboard.syncError'));
        }
    };

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.inventory')}</h1>
                    <div className="flex gap-2">
                        <ProFeature>
                            <Button variant="outline" onClick={handleExportXlsx} disabled={!gears?.length}>
                                <Download className="mr-2 h-4 w-4" /> {t('dashboard.syncToSheets')}
                            </Button>
                        </ProFeature>
                        <Link to="/add">
                            <Button>{t('dashboard.addGear')}</Button>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('dashboard.searchPlaceholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 bg-background border rounded-md text-sm"
                        >
                            <option value="All">全カテゴリー</option>
                            {categories?.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <div className="flex gap-2 items-center">
                            <Button
                                size="sm"
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                onClick={() => setViewMode('list')}
                            >
                                <AlignJustify className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant={viewMode === 'large' ? 'default' : 'outline'}
                                onClick={() => setViewMode('large')}
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Status Filter Pills */}
                    <div className="flex gap-2 flex-wrap">
                        {['All', 'Available', 'Maintenance', 'Repair', 'Broken', 'Missing'].map(status => (
                            <Button
                                key={status}
                                size="sm"
                                variant={statusFilter === status ? 'default' : 'outline'}
                                onClick={() => setStatusFilter(status)}
                                className="text-xs"
                            >
                                {status === 'All' ? '全て' : t(`status.${status}`)}
                            </Button>
                        ))}
                    </div>
                </div>

                {gears && gears.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <h3 className="text-lg font-semibold">{t('dashboard.noGearFound')}</h3>
                        <p className="mb-4">{t('dashboard.startAdding')}</p>
                        <Button asChild variant="secondary">
                            <Link to="/add">{t('dashboard.addButton')}</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        {viewMode === 'list' && (
                            <div className="flex flex-col gap-2">
                                {gears?.map((gear) => (
                                    <GearListItem key={gear.id} gear={gear} onClick={() => navigate(`/gear/${gear.id}`)} />
                                ))}
                            </div>
                        )}

                        {viewMode === 'grid' && (
                            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {gears?.map((gear) => (
                                    <GearCard key={gear.id} gear={gear} onClick={() => navigate(`/gear/${gear.id}`)} />
                                ))}
                            </div>
                        )}

                        {viewMode === 'large' && (
                            <div className="grid gap-6 md:grid-cols-2">
                                {gears?.map((gear) => (
                                    <GearCard key={gear.id} gear={gear} onClick={() => navigate(`/gear/${gear.id}`)} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}
