import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { PromoCode, DiscountType, DiscountScope } from '../../lib/types';
import { formatDate } from '../../lib/format';
import { Spinner, EmptyState } from '../../components/ui/States';

const empty: Partial<PromoCode> = { code: '', discount_type: 'percentage', discount_value: 10, scope: 'all', is_active: true, used_count: 0 };

export default function AdminPromoCodes() {
  const [items, setItems] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PromoCode> | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!editing?.code) {
      toast.error('Code is required.');
      return;
    }
    setSaving(true);
    const payload = { ...editing, code: editing.code.toUpperCase() };
    const { error } = editing.id
      ? await supabase.from('promo_codes').update(payload).eq('id', editing.id)
      : await supabase.from('promo_codes').insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Promo code saved.');
    setEditing(null);
    load();
  }

  async function toggleActive(p: PromoCode) {
    await supabase.from('promo_codes').update({ is_active: !p.is_active }).eq('id', p.id);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this promo code?')) return;
    await supabase.from('promo_codes').delete().eq('id', id);
    toast.success('Promo code deleted.');
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Discount & Promo Codes</h1>
        <button onClick={() => setEditing(empty)} className="btn-primary"><Plus className="h-4 w-4" /> Add Code</button>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No promo codes yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-navy">{p.code}</td>
                  <td className="px-4 py-3">{p.discount_type === 'percentage' ? `${p.discount_value}%` : `SLE ${p.discount_value}`}</td>
                  <td className="px-4 py-3 capitalize text-gray-500">{p.scope}</td>
                  <td className="px-4 py-3 text-gray-500">{p.used_count}{p.usage_limit ? `/${p.usage_limit}` : ''}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.expiry_date)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)} className={`badge ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(p.id)} className="btn-ghost text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </td>
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
              <h2 className="font-semibold text-navy">Add Promo Code</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Code</label>
                <input className="input uppercase" value={editing.code ?? ''} onChange={(e) => setEditing({ ...editing, code: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Discount Type</label>
                  <select className="input" value={editing.discount_type ?? 'percentage'} onChange={(e) => setEditing({ ...editing, discount_type: e.target.value as DiscountType })}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="label">Value</label>
                  <input type="number" className="input" value={editing.discount_value ?? 0} onChange={(e) => setEditing({ ...editing, discount_value: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="label">Applies To</label>
                <select className="input" value={editing.scope ?? 'all'} onChange={(e) => setEditing({ ...editing, scope: e.target.value as DiscountScope })}>
                  <option value="all">All</option>
                  <option value="course">Course</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Expiry Date</label>
                  <input type="date" className="input" value={editing.expiry_date ?? ''} onChange={(e) => setEditing({ ...editing, expiry_date: e.target.value })} />
                </div>
                <div>
                  <label className="label">Usage Limit</label>
                  <input type="number" className="input" value={editing.usage_limit ?? ''} onChange={(e) => setEditing({ ...editing, usage_limit: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Code'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
