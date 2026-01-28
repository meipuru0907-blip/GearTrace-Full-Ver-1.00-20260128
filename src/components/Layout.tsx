import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Settings, Box, ListChecks, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer } from "./Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { ModeToggle } from "./ModeToggle";

export function Layout({ children }: { children: React.ReactNode }) {
    const { t } = useLanguage();

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-16 md:w-64 border-r bg-muted/40 hidden md:flex flex-col">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link to="/" className="flex items-center gap-2 font-semibold">
                        <Box className="h-6 w-6" />
                        <span className="">{t('app.title')}</span>
                    </Link>
                    <div className="ml-auto flex items-center gap-2">
                        <ModeToggle />
                    </div>
                </div>
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-2 mt-4">
                    <NavItem to="/" icon={LayoutDashboard} label={t('app.dashboard')} />
                    <NavItem to="/add" icon={PlusCircle} label={t('app.addGear')} />
                    <NavItem to="/packing-lists" icon={ListChecks} label={t('app.packingLists')} />
                    <NavItem to="/subscriptions" icon={CreditCard} label="サブスク" />
                    <NavItem to="/settings" icon={Settings} label={t('app.settings')} />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col">
                <div className="p-4 md:p-8 flex-1">
                    {children}
                </div>
                <Footer />
            </main>
        </div>
    );
}

function NavItem({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                isActive ? "bg-muted text-primary" : "text-muted-foreground"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
    );
}
