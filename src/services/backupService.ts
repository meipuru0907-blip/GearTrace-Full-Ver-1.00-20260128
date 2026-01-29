import { supabase } from '@/lib/supabase';
import { keysToCamelCase, keysToSnakeCase } from '@/utils/transformers';
import type { Gear, Log } from '@/types';

export const BackupService = {
    fetchAllData: async () => {
        const { data: gearData, error: gearError } = await supabase.from('gear').select('*');
        if (gearError) throw gearError;

        const { data: logData, error: logError } = await supabase.from('logs').select('*');
        if (logError) throw logError;

        return {
            gear: keysToCamelCase(gearData) as Gear[],
            logs: keysToCamelCase(logData) as Log[]
        };
    },

    restoreData: async (data: { gear: Gear[], logs: Log[] }) => {
        // Upsert Gear
        if (data.gear && data.gear.length > 0) {
            // Need to map back to snake_case for Supabase
            // Note: keysToSnakeCase is recursive, verify it handles array of objects
            const gearSnake = data.gear.map((g: any) => {
                // Manual mapping or use keysToSnakeCase if robust
                // Let's use keysToSnakeCase but ensure it handles all fields correctly
                // The issue is converting camelCase keys back to snake_case.
                // Ideally keysToSnakeCase should work.
                // However, we might want to sanitize data (e.g. remove undefined)
                return keysToSnakeCase(g);
            });

            const { error: gearError } = await supabase.from('gear').upsert(gearSnake);
            if (gearError) throw gearError;
        }

        // Upsert Logs
        if (data.logs && data.logs.length > 0) {
            const logsSnake = data.logs.map((l: any) => keysToSnakeCase(l));
            const { error: logError } = await supabase.from('logs').upsert(logsSnake);
            if (logError) throw logError;
        }
    }
};
