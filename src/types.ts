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
    colorTag?: 'red' | 'blue' | 'green' | 'yellow' | 'pink' | 'orange' | 'purple';
    status: 'Available' | 'InUse' | 'Maintenance' | 'Broken' | 'Sold' | 'Repair' | 'Missing'; // Required
    purchaseDate: string; // ISO Date
    purchasePrice: number;
    currentValue?: number; // Estimated used price
    lifespan: number; // Depreciation years (default 5)
    productEra?: string; // e.g. "Released 2015", "1980s Vintage"
    notes?: string; // Additional notes
    createdAt: number; // Timestamp
    updatedAt: number; // Timestamp
    documents?: {
        id: string;
        name: string;
        data: string; // Base64
        uploadDate: number;
    }[];
    logs?: Log[]; // Associated logs (for joins, not stored directly)
}

export interface PackingList {
    id: number; // Auto-increment ID in Dexie
    name: string;
    date: string;
    gearIds: string[]; // List of gear IDs included
    createdAt: number;
    updatedAt: number;
}

export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionCategory = 'Software' | 'Plugin' | 'Cloud Storage' | 'Streaming' | 'Other';

export interface Subscription {
    id: string; // UUID
    name: string; // Service name (e.g., "Smaart v9", "Adobe CC")
    category: SubscriptionCategory;
    price: number; // Cost amount
    billingCycle: BillingCycle;
    startDate: string; // ISO Date - when subscription started
    nextPaymentDate: string; // ISO Date
    autoRenew: boolean; // Whether it auto-renews
    notes?: string;
    createdAt: number; // Timestamp
    updatedAt: number; // Timestamp
}


export interface Log {
    id: string;
    gearId: string; // Foreign Key
    date: string; // ISO Date
    type: 'Trouble' | 'Repair' | 'Maintenance' | 'Lending';
    description: string;
    cost?: number; // Optional repair/maintenance cost
}
