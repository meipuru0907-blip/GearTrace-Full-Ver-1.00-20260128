import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { PackingList, Gear } from '@/types';
import { keysToCamelCase } from '@/utils/transformers';
import { useAuth } from '@/contexts/AuthContext';

export function usePackingListDetail(id: string | undefined) {
    const [list, setList] = useState<PackingList | null>(null);
    const [allGear, setAllGear] = useState<Gear[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        if (!user || !id) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch List
                const { data: listData, error: listError } = await supabase
                    .from('packing_lists')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (listError) throw listError;
                setList(keysToCamelCase(listData) as PackingList);

                // Fetch All Gear (for selection)
                // Optimization: Maybe we don't need *all* fields if just for selection?
                // But current app uses quantity, manufacturer, etc.
                const { data: gearData, error: gearError } = await supabase
                    .from('gear')
                    .select('*')
                    .order('category');

                if (gearError) console.error(gearError);
                setAllGear(keysToCamelCase(gearData || []) as Gear[]);

            } catch (error) {
                console.error("Error fetching packing list detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user, refreshTrigger]);

    const updateList = async (gearIds: string[]) => {
        if (!id || !user) return;

        const { error } = await supabase
            .from('packing_lists')
            .update({
                gear_ids: gearIds,
                // updated_at is handled by default or we can set it
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error("Error updating list:", error);
            throw error;
        }

        refresh();
    };

    const deleteList = async () => {
        if (!id || !user) return;

        const { error } = await supabase
            .from('packing_lists')
            .delete()
            .eq('id', id);

        if (error) throw error;
    };

    return { list, allGear, loading, updateList, deleteList, refresh };
}
