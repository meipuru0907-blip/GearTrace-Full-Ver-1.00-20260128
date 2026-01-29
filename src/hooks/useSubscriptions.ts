import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Subscription } from '@/types';
import { keysToCamelCase } from '@/utils/transformers';
import { useAuth } from '@/contexts/AuthContext';

export function useSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchSubscriptions = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching subscriptions:', error);
            } else {
                setSubscriptions(keysToCamelCase(data) as Subscription[]);
            }
            setLoading(false);
        };

        fetchSubscriptions();

        const channel = supabase
            .channel('subscriptions_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
                fetchSubscriptions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, refreshTrigger]);

    const addSubscription = async (sub: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!user) return;

        // Convert to snake_case for insert
        const { error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                name: sub.name,
                category: sub.category,
                price: sub.price,
                billing_cycle: sub.billingCycle,
                start_date: sub.startDate,
                next_payment_date: sub.nextPaymentDate,
                auto_renew: sub.autoRenew,
                notes: sub.notes
            });

        if (error) throw error;
        refresh();
    };

    const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
        if (!user) return;

        // Convert updates to snake_case manually or use a helper
        const updateData: any = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.category !== undefined) updateData.category = updates.category;
        if (updates.price !== undefined) updateData.price = updates.price;
        if (updates.billingCycle !== undefined) updateData.billing_cycle = updates.billingCycle;
        if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
        if (updates.nextPaymentDate !== undefined) updateData.next_payment_date = updates.nextPaymentDate;
        if (updates.autoRenew !== undefined) updateData.auto_renew = updates.autoRenew;
        if (updates.notes !== undefined) updateData.notes = updates.notes;

        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;
        refresh();
    };

    const deleteSubscription = async (id: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        refresh();
    };

    return { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription };
}
