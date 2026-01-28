import Dexie, { type Table } from 'dexie';
import type { Gear, Log, PackingList, Subscription } from '../types'; // Added Subscription type import

export class GearTraceDB extends Dexie {
    gear!: Table<Gear>;
    logs!: Table<Log>;
    packingLists!: Table<PackingList>; // Added packingLists table property
    subscriptions!: Table<Subscription>; // Subscription management table

    constructor() {
        super('GearTraceDB');

        // Version 2: Initial schema (kept for backward compatibility, though v3 upgrade handles it)
        this.version(2).stores({
            gear: 'id, category, status, manufacturer, model, purchaseDate',
            logs: 'id, gearId, date, type',
            packingLists: 'id, name, createdAt' // Added packingLists table definition
        });

        // Version 3: Add createdAt, updatedAt, ensure status is set, visualTagColor migration
        this.version(3).stores({
            gear: 'id, category, status, manufacturer, model, purchaseDate, createdAt',
            logs: 'id, gearId, date, type'
        }).upgrade(trans => {
            return trans.table('gear').toCollection().modify(gear => {
                // Add timestamps if missing
                gear.createdAt = gear.createdAt || Date.now();
                gear.updatedAt = Date.now(); // Always update updatedAt on upgrade

                // Migrate visualTagColor to colorTag
                if (gear.visualTagColor) {
                    gear.colorTag = gear.visualTagColor;
                    delete gear.visualTagColor; // Remove old property
                }

                // Ensure status is set
                if (!gear.status) {
                    gear.status = 'Available';
                }

                // Make photos.serial and photos.feature optional (existing v3 logic)
                if (gear.photos) {
                    if (!gear.photos.serial) gear.photos.serial = '';
                    if (!gear.photos.feature) gear.photos.feature = '';
                }
            });
        });

        // Version 4: Add packingLists table (restore from Phase 8)
        this.version(4).stores({
            gear: 'id, category, status, manufacturer, model, purchaseDate, createdAt',
            logs: 'id, gearId, date, type',
            packingLists: '++id, name, date, createdAt'
        });

        // Version 5: Add lifespan to gear (Phase 10)
        this.version(5).stores({
            gear: 'id, category, status, manufacturer, model, purchaseDate, createdAt',
            logs: 'id, gearId, date, type',
            packingLists: '++id, name, date, createdAt'
        }).upgrade(trans => {
            return trans.table('gear').toCollection().modify(gear => {
                if (!gear.lifespan) {
                    gear.lifespan = 5; // Default 5 years
                }
            });
        });

        // Version 6: Add productEra (Phase 11) - No migration needed for optional field
        this.version(6).stores({
            gear: 'id, category, status, manufacturer, model, purchaseDate, createdAt',
            logs: 'id, gearId, date, type',
            packingLists: '++id, name, date, createdAt'
        });

        // Version 7: Add subscriptions table (Phase 34 - Subscription Management)
        this.version(7).stores({
            gear: 'id, category, status, manufacturer, model, purchaseDate, createdAt',
            logs: 'id, gearId, date, type',
            packingLists: '++id, name, date, createdAt',
            subscriptions: 'id, category, billingCycle, nextPaymentDate, createdAt'
        });

        // Version 8: Inventory System Upgrade (Phase 44)
        this.version(8).stores({
            gear: 'id, category, status, manufacturer, model, purchaseDate, createdAt, isContainer, containerId',
            logs: 'id, gearId, date, type',
            packingLists: '++id, name, date, createdAt',
            subscriptions: 'id, category, billingCycle, nextPaymentDate, createdAt'
        }).upgrade(trans => {
            return trans.table('gear').toCollection().modify(gear => {
                if (typeof gear.quantity === 'undefined') gear.quantity = 1;
                if (typeof gear.isContainer === 'undefined') gear.isContainer = false;
            });
        });
    }
}

export const db = new GearTraceDB();
