import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Enrollment, AttendanceStatus } from '../../lib/types';
import { Spinner, EmptyState } from '../../components/ui/States';

export default function TrainerAttendance() {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
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
      const { data } = await supabase.from('enrollments').select('*, courses(*), profiles(*)').in('course_id', courseIds).eq('status', 'active');
      setEnrollments((data as Enrollment[]) ?? []);
      setLoading(false);
    })();
  }, [profile]);

  async function submitAttendance() {
    const rows = Object.entries(marks).map(([enrollment_id, status]) => ({
      enrollment_id,
      session_date: date,
      status,
      marked_by: profile?.id,
    }));
    if (rows.length === 0) {
      toast.error('Mark at least one student.');
      return;
    }
    const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'enrollment_id,session_date' });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Attendance saved.');
  }

  function exportCSV() {
    const header = ['Student', 'Course', 'Date', 'Status'];
    const rows = enrollments.map((e) => [e.profiles?.full_name ?? '', e.courses?.title ?? '', date, marks[e.id] ?? 'unmarked']);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Attendance</h1>
        <div className="flex gap-2">
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          <button onClick={exportCSV} className="btn-outline"><Download className="h-4 w-4" /> Export</button>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState title="No active students" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium text-navy">{e.profiles?.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{e.courses?.title}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {(['present', 'absent', 'late'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setMarks({ ...marks, [e.id]: s })}
                        className={marks[e.id] === s ? 'btn-primary text-xs capitalize' : 'btn-outline text-xs capitalize'}
                      >
                        {s}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4">
            <button onClick={submitAttendance} className="btn-primary">Save Attendance</button>
          </div>
        </div>
      )}
    </div>
  );
}
