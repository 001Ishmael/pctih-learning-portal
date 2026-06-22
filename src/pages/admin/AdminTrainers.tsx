import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, GraduationCap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Trainer } from '../../lib/types';
import { Spinner, EmptyState } from '../../components/ui/States';

const empty: Partial<Trainer> = { display_name: '', bio: '', specialty: '', photo_url: '' };

export default function AdminTrainers() {
  const [items, setItems] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Trainer> | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('trainers').select('*').order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!editing?.display_name) {
      toast.error('Name is required.');
      return;
    }
    setSaving(true);
    const { error } = editing.id
      ? await supabase.from('trainers').update(editing).eq('id', editing.id)
      : await supabase.from('trainers').insert(editing);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Trainer saved.');
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this trainer?')) return;
    await supabase.from('trainers').delete().eq('id', id);
    toast.success('Trainer removed.');
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Trainers</h1>
        <button onClick={() => setEditing(empty)} className="btn-primary"><Plus className="h-4 w-4" /> Add Trainer</button>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No trainers yet" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-navy">{t.display_name}</p>
                  <p className="text-xs text-gray-400">{t.specialty}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{t.bio}</p>
              <button onClick={() => handleDelete(t.id)} className="btn-ghost text-red-600 text-sm"><Trash2 className="h-4 w-4" /> Remove</button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy">Add Trainer</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={editing.display_name ?? ''} onChange={(e) => setEditing({ ...editing, display_name: e.target.value })} />
              </div>
              <div>
                <label className="label">Specialty</label>
                <input className="input" value={editing.specialty ?? ''} onChange={(e) => setEditing({ ...editing, specialty: e.target.value })} />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea className="input" rows={3} value={editing.bio ?? ''} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
              </div>
              <div>
                <label className="label">Photo URL</label>
                <input className="input" value={editing.photo_url ?? ''} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Trainer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
