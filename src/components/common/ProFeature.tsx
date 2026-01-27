import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useLicense } from "@/contexts/LicenseContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProFeatureProps {
    children: ReactNode;
    fallback?: ReactNode;
    className?: string; // To allow external styling
}

export function ProFeature({ children, fallback, className }: ProFeatureProps) {
    const { isPro } = useLicense();
    const navigate = useNavigate();

    const handleLockedClick = (e: React.MouseEvent) => {
        // Prevent default action
        e.preventDefault();
        e.stopPropagation();

        // Show toast and option to navigate
        toast("この機能はPro版限定です", {
            action: {
                label: "設定へ",
                onClick: () => navigate("/settings"),
            },
        });
    };

    if (isPro) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div
            className={cn("relative group cursor-not-allowed", className)}
            onClick={handleLockedClick}
            title="Pro版限定機能"
        >
            {/* Content wrapper with reduced opacity and no pointer events */}
            <div className="opacity-50 pointer-events-none select-none grayscale-[0.5]">
                {children}
            </div>

            {/* Overlay Badge */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-background/90 border border-primary/20 shadow-lg backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 transform transition-transform group-hover:scale-105">
                    <Lock className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">Pro Feature</span>
                </div>
            </div>
        </div>
    );
}
