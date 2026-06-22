import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../lib/types';
import { formatMoney } from '../../lib/format';
import { Spinner } from '../../components/ui/States';
import { EmptyState } from '../../components/ui/States';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCourses(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = courses.filter((c) => {
    const matchesQuery = c.title.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'free' ? c.is_free : !c.is_free);
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-navy mb-2">Courses</h1>
      <p className="text-gray-500 mb-8">Browse our full catalog of courses — free and paid.</p>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search courses..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {(['all', 'free', 'paid'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn-primary capitalize' : 'btn-outline capitalize'}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="No courses found" description="Try a different search or filter." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <Link key={c.id} to={`/courses/${c.slug}`} className="card overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 bg-brand-100 flex items-center justify-center">
                {c.image_url ? <img src={c.image_url} alt={c.title} className="h-full w-full object-cover" /> : <BookOpen className="h-10 w-10 text-brand-400" />}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy mb-1">{c.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`badge ${c.is_free ? 'bg-green-100 text-green-800' : 'bg-brand-100 text-brand-800'}`}>
                    {c.is_free ? 'Free' : formatMoney(c.price)}
                  </span>
                  <span className="text-xs text-gray-400">{c.duration}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
