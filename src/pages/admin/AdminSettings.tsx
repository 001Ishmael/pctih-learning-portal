import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../../components/ui/States';

const KEYS = ['org_name', 'org_address', 'org_email', 'org_phone', 'orange_money_number'] as const;
type SettingsForm = Record<(typeof KEYS)[number], string>;

const labels: Record<(typeof KEYS)[number], string> = {
  org_name: 'Organization Name',
  org_address: 'Address',
  org_email: 'Contact Email',
  org_phone: 'Contact Phone',
  orange_money_number: 'Orange Money Payment Number',
};

export default function AdminSettings() {
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('settings')
      .select('*')
      .in('key', KEYS)
      .then(({ data }) => {
        const values: Partial<SettingsForm> = {};
        (data ?? []).forEach((row) => {
          values[row.key as keyof SettingsForm] = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
        });
        const defaults: SettingsForm = {
          org_name: "People's Choice Technology & Innovation Hub",
          org_address: '4 Andrew Street, Off Krootown Road, Freetown, Sierra Leone',
          org_email: 'peopleschoicet@gmail.com',
          org_phone: '+232 79 468 780',
          orange_money_number: '+232 79 468 780',
        };
        setForm({ ...defaults, ...values });
      });
  }, []);

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    const rows = KEYS.map((key) => ({ key, value: form[key], updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Settings saved.');
  }

  if (!form) return <Spinner />;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-navy mb-2">Settings</h1>
      <p className="text-gray-500 mb-6">Update organization details shown across the platform.</p>
      <div className="card p-6 space-y-4">
        {KEYS.map((key) => (
          <div key={key}>
            <label className="label">{labels[key]}</label>
            <input
              className="input"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Note: the public site currently reads the Orange Money number from the <code>VITE_ORANGE_MONEY_NUMBER</code> env
        variable at build time. Update it here for record-keeping and future dynamic use, and keep the env variable in
        sync for the live payment instructions shown to students.
      </p>
    </div>
  );
}
