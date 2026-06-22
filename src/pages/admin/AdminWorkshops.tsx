import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Workshop } from '../../lib/types';
import { formatDate, formatMoney, slugify } from '../../lib/format';
import { Spinner, EmptyState } from '../../components/ui/States';
import { StatusBadge } from '../../components/ui/Badge';

const empty: Partial<Workshop> = {
  title: '', type: 'workshop', description: '', date: new Date().toISOString().slice(0, 10), time: '', venue: '',
  is_free: true, price: 0, capacity: 50, image_url: '', status: 'upcoming',
};

export default function AdminWorkshops() {
  const [items, setItems] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Workshop> | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('workshops').select('*').order('date', { ascending: false });
    setItems(data ?? []);
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
      ? await supabase.from('workshops').update(payload).eq('id', editing.id)
      : await supabase.from('workshops').insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Workshop saved.');
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this workshop?')) return;
    await supabase.from('workshops').delete().eq('id', id);
    toast.success('Workshop deleted.');
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Workshops, Seminars & Events</h1>
        <button onClick={() => setEditing(empty)} className="btn-primary"><Plus className="h-4 w-4" /> Add Workshop</button>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No workshops yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((w) => (
                <tr key={w.id}>
                  <td className="px-4 py-3 font-medium text-navy">{w.title}</td>
                  <td className="px-4 py-3 capitalize text-gray-500">{w.type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(w.date)}</td>
                  <td className="px-4 py-3">{w.is_free ? 'Free' : formatMoney(w.price)}</td>
                  <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => setEditing(w)} className="btn-ghost"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(w.id)} className="btn-ghost text-red-600"><Trash2 className="h-4 w-4" /></button>
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
              <h2 className="font-semibold text-navy">{editing.id ? 'Edit Workshop' : 'Add Workshop'}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Title</label>
                <input className="input" value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={editing.type ?? 'workshop'} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="bootcamp">Bootcamp</option>
                  <option value="short_training">Short Training</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input" value={editing.date ?? ''} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input className="input" value={editing.time ?? ''} onChange={(e) => setEditing({ ...editing, time: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Venue</label>
                <input className="input" value={editing.venue ?? ''} onChange={(e) => setEditing({ ...editing, venue: e.target.value })} />
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
                  <label className="label">Capacity</label>
                  <input type="number" className="input" value={editing.capacity ?? 50} onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="label">Registration Deadline</label>
                  <input type="date" className="input" value={editing.registration_deadline ?? ''} onChange={(e) => setEditing({ ...editing, registration_deadline: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Image URL</label>
                <input className="input" value={editing.image_url ?? ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={editing.status ?? 'upcoming'} onChange={(e) => setEditing({ ...editing, status: e.target.value as Workshop['status'] })}>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Workshop'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
