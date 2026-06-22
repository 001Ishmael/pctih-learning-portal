import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { NotificationRow } from '../../lib/types';
import { Spinner, EmptyState } from '../../components/ui/States';
import { formatDateTime } from '../../lib/format';

export default function MyNotifications() {
  const { profile } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
        const unreadIds = (data ?? []).filter((n) => !n.is_read).map((n) => n.id);
        if (unreadIds.length) supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
      });
  }, [profile]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Notifications</h1>
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No notifications yet" />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div key={n.id} className={`card p-4 ${!n.is_read ? 'border-brand-300 bg-brand-50' : ''}`}>
              <p className="font-medium text-navy text-sm">{n.title}</p>
              <p className="text-sm text-gray-600">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
