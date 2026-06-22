import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Enrollment, EnrollmentStatus } from '../../lib/types';
import { formatDate } from '../../lib/format';
import { Spinner, EmptyState } from '../../components/ui/States';
import { StatusBadge } from '../../components/ui/Badge';

export default function AdminEnrollments() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('enrollments')
      .select('*, courses(*), workshops(*), profiles(*)')
      .order('enrolled_at', { ascending: false });
    setItems((data as Enrollment[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: EnrollmentStatus) {
    await supabase.from('enrollments').update({ status }).eq('id', id);
    toast.success('Enrollment updated.');
    load();
  }

  const filtered = items.filter((e) =>
    (e.profiles?.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.courses?.title ?? e.workshops?.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Enrollments</h1>
      <input className="input max-w-sm mb-6" placeholder="Search by student or program..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="No enrollments found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium text-navy">{e.profiles?.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{e.courses?.title ?? e.workshops?.title}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(e.enrolled_at)}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3">
                    <select className="input" value={e.status} onChange={(ev) => updateStatus(e.id, ev.target.value as EnrollmentStatus)}>
                      <option value="pending_payment">Pending Payment</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
