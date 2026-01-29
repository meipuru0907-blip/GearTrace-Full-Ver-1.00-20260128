export interface Gear {
    id: string; // UUID
    name: string; // User defined or Auto-detected
    category: string; // e.g., 'Microphone'
    subCategory?: string; // e.g., 'Dynamic'
    manufacturer: string;
    model: string;
    serialNumber?: string;
    photos: {
        hero: string; // DataURL or Path (main photo)
        serial?: string;
        feature?: string; // The "scratch" or identifier
    };
    visualTagColor?: string; // '#FF0000' etc. (for backward compatibility)
    colorTag?: string; // HEX color code (e.g., '#ef4444') or empty string for "none"
    status: 'Available' | 'InUse' | 'Maintenance' | 'Broken' | 'Sold' | 'Repair' | 'Missing'; // Required
    purchaseDate: string; // ISO Date
    purchasePrice: number;
    currentValue?: number; // Estimated used price
    lifespan: number; // Depreciation years (default 5)

    // Inventory Management (Phase 44)
    quantity: number; // Default 1
    isContainer: boolean; // Is this a container for other gear?
    containerId?: string; // ID of the parent container

    productEra?: string; // e.g. "Released 2015", "1980s Vintage"
    notes?: string; // Additional notes
    createdAt: string; // ISO String from Supabase
    updatedAt: string; // ISO String from Supabase
    documents?: {
        id: string;
        name: string;
        data: string; // Base64
        uploadDate: string; // ISO String
    }[];
    logs?: Log[];
}

export interface PackingList {
    id: string; // UUID from Supabase
    name: string;
    date: string;
    gearIds: string[];
    createdAt: string;
    updatedAt: string;
}

export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionCategory = 'Software' | 'Plugin' | 'Cloud Storage' | 'Streaming' | 'Other';

export interface Subscription {
    id: string;
    name: string;
    category: SubscriptionCategory;
    price: number;
    billingCycle: BillingCycle;
    startDate: string;
    nextPaymentDate: string;
    autoRenew: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}


export interface Log {
    id: string;
    gearId: string; // Foreign Key
    date: string; // ISO Date
    type: 'Trouble' | 'Repair' | 'Maintenance' | 'Lending';
    description: string;
    cost?: number; // Optional repair/maintenance cost
}
