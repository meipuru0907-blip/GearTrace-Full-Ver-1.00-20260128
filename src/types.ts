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
    status: 'Available' | 'InUse' | 'Maintenance' | 'Broken' | 'Sold' | 'Repair' | 'Missing'; // Required
    purchaseDate: string; // ISO Date
    purchasePrice: number;
    currentValue?: number; // Estimated used price
    lifespan: number; // Depreciation years (default 5)
    notes?: string; // Additional notes
    createdAt: number; // Timestamp
    updatedAt: number; // Timestamp
    logs?: Log[]; // Associated logs (for joins, not stored directly)
}


export interface Log {
    id: string;
    gearId: string; // Foreign Key
    date: string; // ISO Date
    type: 'Trouble' | 'Repair' | 'Maintenance' | 'Lending';
    description: string;
    cost?: number; // Optional repair/maintenance cost
}
