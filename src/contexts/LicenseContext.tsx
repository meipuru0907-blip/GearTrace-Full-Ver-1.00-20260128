import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type LicenseContextType = {
    isPro: boolean;
    activateLicense: (key: string) => Promise<boolean>;
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

    const activateLicense = async (key: string): Promise<boolean> => {
        // 1. Normalize input (uppercase, remove hyphens)
        const normalizedKey = key.toUpperCase().replace(/-/g, "");

        // 2. Format Check (must be 16 alphanumeric characters)
        if (!/^[A-Z0-9]{16}$/.test(normalizedKey)) {
            toast.error("ライセンスキーの形式が正しくありません。");
            return false;
        }

        // 3. Signature Verification
        const payload = normalizedKey.substring(0, 12);
        const signature = normalizedKey.substring(12, 16);
        const salt = "GEAR-TRACE-SECRET-SALT-2026";

        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(payload + salt);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);

            // Convert hash to hex string
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Take first 4 chars as expected signature
            const expectedSignature = hashHex.substring(0, 4).toUpperCase();

            if (signature === expectedSignature) {
                // If storing normalized key or original key? 
                // Let's store formatted key: XXXX-XXXX-XXXX-XXXX
                const formattedKey = normalizedKey.match(/.{1,4}/g)?.join('-') || normalizedKey;

                localStorage.setItem(LICENSE_STORAGE_KEY, formattedKey);
                setIsPro(true);
                toast.success("Pro版が有効化されました！全機能が利用可能です。");
                return true;
            } else {
                toast.error("無効なライセンスキーです。");
                return false;
            }
        } catch (error) {
            console.error("License validation error:", error);
            toast.error("検証中にエラーが発生しました。");
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
