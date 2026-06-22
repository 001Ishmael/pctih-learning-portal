import { useEffect, useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Enrollment } from '../../lib/types';
import { Spinner, EmptyState } from '../../components/ui/States';
import { formatDate } from '../../lib/format';

export default function MySchedule() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('enrollments')
      .select('*, courses(*), workshops(*)')
      .eq('student_id', profile.id)
      .in('status', ['active', 'completed'])
      .then(({ data }) => {
        setItems((data as Enrollment[]) ?? []);
        setLoading(false);
      });
  }, [profile]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">My Schedule</h1>
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="Nothing scheduled yet" />
      ) : (
        <div className="space-y-3">
          {items.map((e) => {
            const item = e.courses ?? e.workshops;
            const isWorkshop = !!e.workshops;
            return (
              <div key={e.id} className="card p-4">
                <p className="font-medium text-navy">{item?.title}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {isWorkshop ? formatDate(e.workshops?.date) : e.courses?.schedule ?? 'Flexible'}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {item && 'venue' in item ? item.venue : '—'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
