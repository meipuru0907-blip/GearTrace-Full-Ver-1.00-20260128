import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Gear } from '@/types';
import { keysToCamelCase } from '@/utils/transformers';
import { useAuth } from '@/contexts/AuthContext';

export function useGear() {
    const [gears, setGears] = useState<Gear[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchGear = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('gear')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching gear:', error);
        } else {
            setGears(keysToCamelCase(data) as Gear[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!user) return;

        fetchGear();

        const channel = supabase
            .channel('gear_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'gear' }, () => {
                fetchGear();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return { gears, loading, refresh: fetchGear };
}
