import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../lib/types';
import { formatMoney, slugify } from '../../lib/format';
import { Spinner, EmptyState } from '../../components/ui/States';
import { StatusBadge } from '../../components/ui/Badge';

const empty: Partial<Course> = {
  title: '', description: '', is_free: true, price: 0, duration: '', venue: '', capacity: 30, image_url: '', status: 'draft',
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Course> | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!editing?.title) {
      toast.error('Title is required.');
      return;
    }
    setSaving(true);
    const payload = { ...editing, slug: editing.slug || slugify(editing.title) };
    const { error } = editing.id
      ? await supabase.from('courses').update(payload).eq('id', editing.id)
      : await supabase.from('courses').insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Course saved.');
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this course?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
      toast.error('Could not delete course.');
      return;
    }
    toast.success('Course deleted.');
    load();
  }

  async function togglePublish(c: Course) {
    const status = c.status === 'published' ? 'unpublished' : 'published';
    await supabase.from('courses').update({ status }).eq('id', c.id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Courses</h1>
        <button onClick={() => setEditing(empty)} className="btn-primary"><Plus className="h-4 w-4" /> Add Course</button>
      </div>

      {loading ? (
        <Spinner />
      ) : courses.length === 0 ? (
        <EmptyState title="No courses yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-navy">{c.title}</td>
                  <td className="px-4 py-3">{c.is_free ? 'Free' : formatMoney(c.price)}</td>
                  <td className="px-4 py-3 text-gray-500">{c.duration}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => togglePublish(c)} className="btn-ghost text-xs">{c.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                    <button onClick={() => setEditing(c)} className="btn-ghost"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="btn-ghost text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy">{editing.id ? 'Edit Course' : 'Add Course'}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Title</label>
                <input className="input" value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Free or Paid</label>
                  <select className="input" value={editing.is_free ? 'free' : 'paid'} onChange={(e) => setEditing({ ...editing, is_free: e.target.value === 'free' })}>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="label">Price (SLE)</label>
                  <input type="number" className="input" disabled={editing.is_free} value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Duration</label>
                  <input className="input" value={editing.duration ?? ''} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} />
                </div>
                <div>
                  <label className="label">Capacity</label>
                  <input type="number" className="input" value={editing.capacity ?? 30} onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="label">Venue</label>
                <input className="input" value={editing.venue ?? ''} onChange={(e) => setEditing({ ...editing, venue: e.target.value })} />
              </div>
              <div>
                <label className="label">Schedule</label>
                <input className="input" placeholder="e.g. Mon/Wed/Fri 4-6pm" value={editing.schedule ?? ''} onChange={(e) => setEditing({ ...editing, schedule: e.target.value })} />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input className="input" placeholder="https://... (or add PCTIH logo here)" value={editing.image_url ?? ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={editing.status ?? 'draft'} onChange={(e) => setEditing({ ...editing, status: e.target.value as Course['status'] })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Course'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
