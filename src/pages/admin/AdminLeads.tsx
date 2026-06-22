import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Lead, LeadStatus, LeadSource } from '../../lib/types';
import { formatDate } from '../../lib/format';
import { Spinner, EmptyState } from '../../components/ui/States';

const empty: Partial<Lead> = { name: '', phone: '', email: '', interest: '', source: 'website', status: 'new', notes: '' };

export default function AdminLeads() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Lead> | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!editing?.name) {
      toast.error('Name is required.');
      return;
    }
    setSaving(true);
    const { error } = editing.id
      ? await supabase.from('leads').update(editing).eq('id', editing.id)
      : await supabase.from('leads').insert(editing);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Lead saved.');
    setEditing(null);
    load();
  }

  async function updateStatus(id: string, status: LeadStatus) {
    await supabase.from('leads').update({ status }).eq('id', id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Leads</h1>
        <button onClick={() => setEditing(empty)} className="btn-primary"><Plus className="h-4 w-4" /> Add Lead</button>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No leads yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Interest</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 font-medium text-navy">{l.name}</td>
                  <td className="px-4 py-3 text-gray-500">{l.phone}<br />{l.email}</td>
                  <td className="px-4 py-3 text-gray-500">{l.interest}</td>
                  <td className="px-4 py-3 capitalize text-gray-500">{l.source.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <select className="input" value={l.status} onChange={(e) => updateStatus(l.id, e.target.value as LeadStatus)}>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="converted">Converted</option>
                      <option value="not_interested">Not Interested</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy">Add Lead</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Name</label>
                <input className="input" value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={editing.phone ?? ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" value={editing.email ?? ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Interested Course/Workshop</label>
                <input className="input" value={editing.interest ?? ''} onChange={(e) => setEditing({ ...editing, interest: e.target.value })} />
              </div>
              <div>
                <label className="label">Source</label>
                <select className="input" value={editing.source ?? 'website'} onChange={(e) => setEditing({ ...editing, source: e.target.value as LeadSource })}>
                  <option value="facebook">Facebook</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="referral">Referral</option>
                  <option value="flyer">Flyer</option>
                  <option value="walk_in">Walk-in</option>
                  <option value="event">Event</option>
                  <option value="website">Website</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Follow-up Date</label>
                <input type="date" className="input" value={editing.follow_up_date ?? ''} onChange={(e) => setEditing({ ...editing, follow_up_date: e.target.value })} />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input" rows={3} value={editing.notes ?? ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Lead'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
