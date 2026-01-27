import Dexie, { type Table } from 'dexie';
import type { Gear, Log, PackingList } from '../types'; // Added PackingList type import

export class GearTraceDB extends Dexie {
    gear!: Table<Gear>;
    logs!: Table<Log>;
    packingLists!: Table<PackingList>; // Added packingLists table property

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

        // Keep v2 for backward compatibility
        this.version(2).stores({
            gear: 'id, category, status, manufacturer, model, purchaseDate',
            logs: 'id, gearId, date, type'
        });
    }
}

export const db = new GearTraceDB();
