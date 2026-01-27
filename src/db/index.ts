import Dexie, { type Table } from 'dexie';
import type { Gear, Log } from '../types';

export class GearTraceDB extends Dexie {
    gear!: Table<Gear>;
    logs!: Table<Log>;

    constructor() {
        super('GearTraceDB');

        // Version 3: Add createdAt, updatedAt, ensure status is set
        this.version(3).stores({
            gear: 'id, category, status, manufacturer, model, purchaseDate, createdAt',
            logs: 'id, gearId, date, type'
        }).upgrade(trans => {
            return trans.table('gear').toCollection().modify(gear => {
                const now = Date.now();
                // Add timestamps if missing
                if (!gear.createdAt) gear.createdAt = now;
                if (!gear.updatedAt) gear.updatedAt = now;

                // Ensure status is set
                if (!gear.status) gear.status = 'Available';

                // Make photos.serial and photos.feature optional
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
