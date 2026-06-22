import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Enrollment } from '../../lib/types';
import { Spinner, EmptyState } from '../../components/ui/States';
import { StatusBadge } from '../../components/ui/Badge';

export default function TrainerStudents() {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!profile) return;
    setLoading(true);
    const { data: trainer } = await supabase.from('trainers').select('id').eq('profile_id', profile.id).maybeSingle();
    if (!trainer) {
      setLoading(false);
      return;
    }
    const { data: courses } = await supabase.from('courses').select('id').eq('trainer_id', trainer.id);
    const courseIds = (courses ?? []).map((c) => c.id);
    if (courseIds.length === 0) {
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('enrollments').select('*, courses(*), profiles(*)').in('course_id', courseIds);
    setEnrollments((data as Enrollment[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [profile]);

  async function markCompleted(id: string) {
    await supabase.from('enrollments').update({ status: 'completed' }).eq('id', id);
    toast.success('Student marked as completed. Recommend certificate from Admin > Certificates.');
    load();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">My Students</h1>
      {enrollments.length === 0 ? (
        <EmptyState title="No students yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium text-navy">{e.profiles?.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{e.courses?.title}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3">
                    {e.status === 'active' && (
                      <button onClick={() => markCompleted(e.id)} className="btn-outline text-xs">Mark Completed</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
