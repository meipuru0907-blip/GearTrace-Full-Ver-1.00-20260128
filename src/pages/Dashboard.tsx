import { useLiveQuery } from "dexie-react-hooks";
import { useLanguage } from "@/contexts/LanguageContext";
import { db } from "@/db";
import { GearCard } from "@/components/GearCard";
import { GearListItem } from "@/components/GearListItem";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { FinanceAnalysisModal } from "@/components/dashboard/FinanceAnalysisModal";
import { Search, LayoutGrid, AlignJustify, Maximize2, Plus, CreditCard, TrendingUp, CalendarDays } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStatusLabel, getAllStatuses } from "@/utils/constants";

export default function Dashboard() {
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'large'>('grid');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [financeModalOpen, setFinanceModalOpen] = useState(false);
    const [financeModalTab, setFinanceModalTab] = useState<'assets' | 'costs'>('assets');
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

    // Get subscriptions for cost summary
    const subscriptions = useLiveQuery(() => db.subscriptions.toArray());


    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.inventory')}</h1>
                    <Link to="/add">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('dashboard.addGear')}
                        </Button>
                    </Link>
                </div>

                {/* Summary Cards - Interactive */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DashboardMetricCard
                        title="総資産価値"
                        icon={<TrendingUp className="h-4 w-4" />}
                        onClick={() => {
                            setFinanceModalTab('assets');
                            setFinanceModalOpen(true);
                        }}
                        variant="primary"
                    />

                    <DashboardMetricCard
                        title="月間ランニングコスト"
                        icon={<CreditCard className="h-4 w-4" />}
                        onClick={() => {
                            setFinanceModalTab('costs');
                            setFinanceModalOpen(true);
                        }}
                    />

                    <DashboardMetricCard
                        title="年間コスト"
                        icon={<CalendarDays className="h-4 w-4" />}
                        onClick={() => {
                            setFinanceModalTab('costs');
                            setFinanceModalOpen(true);
                        }}
                    />
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
                        <Button
                            size="sm"
                            variant={statusFilter === 'All' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('All')}
                            className="text-xs"
                        >
                            全て
                        </Button>
                        {getAllStatuses().map(status => (
                            <Button
                                key={status}
                                size="sm"
                                variant={statusFilter === status ? 'default' : 'outline'}
                                onClick={() => setStatusFilter(status)}
                                className="text-xs"
                            >
                                {getStatusLabel(status)}
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

                {/* Finance Analysis Modal */}
                <FinanceAnalysisModal
                    open={financeModalOpen}
                    onOpenChange={setFinanceModalOpen}
                    defaultTab={financeModalTab}
                    gears={gears || []}
                    subscriptions={subscriptions || []}
                />
            </div>
        </Layout >
    );
}
