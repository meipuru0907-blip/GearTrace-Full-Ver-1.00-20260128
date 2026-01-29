import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { PackingList } from '@/types';
import { keysToCamelCase } from '@/utils/transformers';
import { useAuth } from '@/contexts/AuthContext';

export function usePackingLists() {
    const [packingLists, setPackingLists] = useState<PackingList[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchLists = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('packing_lists')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching packing lists:', error);
        } else {
            setPackingLists(keysToCamelCase(data) as PackingList[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLists();
    }, [user]);

    const createPackingList = async (name: string, date: string): Promise<string> => {
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('packing_lists')
            .insert({
                user_id: user.id,
                name,
                date,
                gear_ids: [],
                // created_at is handled by default via `now()` in schema
                // updated_at is handled by default via `now()` in schema
            })
            .select()
            .single();

        if (error) throw error;

        // Refresh local state
        await fetchLists();

        return data.id; // Return the new ID (UUID)
    };

    return { packingLists, loading, createPackingList };
}
