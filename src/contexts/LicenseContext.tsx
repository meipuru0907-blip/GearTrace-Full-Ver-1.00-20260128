import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type LicenseContextType = {
    isPro: boolean;
    activateLicense: (key: string) => boolean;
};

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

const LICENSE_STORAGE_KEY = "gear_trace_license_key";
const VALID_LICENSE_KEY = "GEAR-PRO-2026";

export function LicenseProvider({ children }: { children: React.ReactNode }) {
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        // Check for existing license on mount
        const savedKey = localStorage.getItem(LICENSE_STORAGE_KEY);
        if (savedKey === VALID_LICENSE_KEY) {
            setIsPro(true);
        }
    }, []);

    const activateLicense = (key: string): boolean => {
        const trimmedKey = key.trim();
        if (trimmedKey === VALID_LICENSE_KEY) {
            localStorage.setItem(LICENSE_STORAGE_KEY, trimmedKey);
            setIsPro(true);
            toast.success("Pro版が有効化されました！全機能が利用可能です。");
            return true;
        } else {
            toast.error("無効なライセンスキーです。");
            return false;
        }
    };

    return (
        <LicenseContext.Provider value={{ isPro, activateLicense }}>
            {children}
        </LicenseContext.Provider>
    );
}

export function useLicense() {
    const context = useContext(LicenseContext);
    if (context === undefined) {
        throw new Error("useLicense must be used within a LicenseProvider");
    }
    return context;
}
