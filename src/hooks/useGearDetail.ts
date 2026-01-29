import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Gear, Log } from '@/types';
import { keysToCamelCase } from '@/utils/transformers';
import { useAuth } from '@/contexts/AuthContext';

interface UseGearDetailResult {
    gear: Gear | undefined;
    logs: Log[];
    contents: Gear[];
    parentContainer: Gear | undefined;
    loading: boolean;
    deleteGear: () => Promise<void>;
    refresh: () => void;
}

export function useGearDetail(id: string | undefined): UseGearDetailResult {
    const [gear, setGear] = useState<Gear | undefined>(undefined);
    const [logs, setLogs] = useState<Log[]>([]);
    const [contents, setContents] = useState<Gear[]>([]);
    const [parentContainer, setParentContainer] = useState<Gear | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (!user || !id) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Gear
                const { data: gearData, error: gearError } = await supabase
                    .from('gear')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (gearError) throw gearError;
                const gearCamel = keysToCamelCase(gearData) as Gear;
                setGear(gearCamel);

                // 2. Fetch Logs
                const { data: logsData, error: logsError } = await supabase
                    .from('logs')
                    .select('*')
                    .eq('gear_id', id)
                    .order('date', { ascending: false });

                if (logsError) console.error('Error fetching logs:', logsError);
                setLogs(keysToCamelCase(logsData || []) as Log[]);

                // 3. Fetch Contents (if container)
                // Always fetch contents to check if any exist, or only if isContainer is true.
                // Dexie implementation fetched it regardless or checked.
                const { data: contentsData, error: contentsError } = await supabase
                    .from('gear')
                    .select('*')
                    .eq('container_id', id);

                if (contentsError) console.error('Error fetching contents:', contentsError);
                setContents(keysToCamelCase(contentsData || []) as Gear[]);

                // 4. Fetch Parent Container (if has containerId)
                if (gearCamel.containerId) {
                    const { data: parentData, error: parentError } = await supabase
                        .from('gear')
                        .select('*')
                        .eq('id', gearCamel.containerId)
                        .single();

                    if (parentError && parentError.code !== 'PGRST116') { // Ignore not found
                        console.error('Error fetching parent:', parentError);
                    }
                    if (parentData) {
                        setParentContainer(keysToCamelCase(parentData) as Gear);
                    } else {
                        setParentContainer(undefined);
                    }
                } else {
                    setParentContainer(undefined);
                }

            } catch (err) {
                console.error('Error fetching gear details:', err);
                setGear(undefined);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Realtime subscriptions can be added here if needed

    }, [id, user, refreshTrigger]);

    const deleteGear = async () => {
        if (!id || !user) return;

        // Supabase with CASCADE in DB handles logs deletion if configured, 
        // but explicit deletion is safer if CASCADE is not set up (our schema has ON DELETE CASCADE for logs).
        // For contents (items inside), we probably want to unset their containerId usually? 
        // Or if we delete a container, do we delete items? Probably just unset.
        // But Dexie code: `db.gear.delete(id)` -> dexie doesn't cascade automatically unless configured?
        // The dexie code `await db.logs.where('gearId').equals(id).delete();` deletes logs.

        // Our SQL schema: `gear_id uuid references gear(id) on delete cascade not null` for logs.
        // So deleting gear deletes logs automatically.
        // However, for items INSIDE this gear (container_id = id), our SQL schema: `container_id uuid references gear(id)`.
        // If we delete gear, what happens to children? 
        // Default is RESTRICT (error) or SET NULL or CASCADE?
        // I checked schema.sql: `container_id uuid references gear(id)`. No on delete specified. Default is likely NO ACTION (error if children exist).
        // I should probably update children to set container_id = null before deleting.

        const { error: updateError } = await supabase
            .from('gear')
            .update({ container_id: null })
            .eq('container_id', id);

        if (updateError) {
            console.error('Error unlinking contents:', updateError);
            throw updateError;
        }

        const { error } = await supabase
            .from('gear')
            .delete()
            .eq('id', id);

        if (error) throw error;
    };

    return { gear, logs, contents, parentContainer, loading, deleteGear, refresh };
}
