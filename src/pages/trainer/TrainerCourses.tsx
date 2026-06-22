import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Course } from '../../lib/types';
import { Spinner, EmptyState } from '../../components/ui/States';
import { StatusBadge } from '../../components/ui/Badge';

export default function TrainerCourses() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: trainer } = await supabase.from('trainers').select('id').eq('profile_id', profile.id).maybeSingle();
      if (!trainer) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('courses').select('*').eq('trainer_id', trainer.id);
      setCourses(data ?? []);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">My Courses</h1>
      {courses.length === 0 ? (
        <EmptyState title="No courses assigned" description="Ask an admin to assign you to a course." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c.id} className="card p-5">
              <BookOpen className="h-6 w-6 text-brand-600 mb-2" />
              <p className="font-semibold text-navy">{c.title}</p>
              <p className="text-sm text-gray-500 mb-2">{c.duration} · {c.venue}</p>
              <StatusBadge status={c.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
