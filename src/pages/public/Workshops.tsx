import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CalendarDays } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Workshop } from '../../lib/types';
import { formatDate, formatMoney } from '../../lib/format';
import { Spinner, EmptyState } from '../../components/ui/States';

export default function Workshops() {
  const [items, setItems] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    supabase
      .from('workshops')
      .select('*')
      .neq('status', 'cancelled')
      .order('date', { ascending: true })
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = items.filter((w) => w.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-navy mb-2">Workshops & Seminars</h1>
      <p className="text-gray-500 mb-8">Bootcamps, short trainings, seminars, and events at PCTIH.</p>

      <div className="relative max-w-sm mb-8">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input className="input pl-9" placeholder="Search workshops..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="No workshops found" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((w) => (
            <Link key={w.id} to={`/workshops/${w.slug}`} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="badge bg-brand-100 text-brand-800 capitalize">{w.type.replace('_', ' ')}</span>
                <span className={`badge ${w.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : w.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                  {w.status}
                </span>
              </div>
              <h3 className="font-semibold text-navy mb-1">{w.title}</h3>
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(w.date)} · {w.time}</p>
              <p className="text-sm text-gray-500 mb-3">{w.venue}</p>
              <span className={`badge ${w.is_free ? 'bg-green-100 text-green-800' : 'bg-brand-100 text-brand-800'}`}>
                {w.is_free ? 'Free' : formatMoney(w.price)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
