import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, X, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Certificate, Enrollment } from '../../lib/types';
import { formatDate, generateCertificateId } from '../../lib/format';
import { Spinner, EmptyState } from '../../components/ui/States';
import { useAuth } from '../../lib/AuthContext';

export default function AdminCertificates() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Certificate[]>([]);
  const [completedEnrollments, setCompletedEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [form, setForm] = useState<{ enrollmentId: string; completionDate: string }>({ enrollmentId: '', completionDate: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [certsRes, enrollRes] = await Promise.all([
      supabase.from('certificates').select('*, profiles(*)').order('issued_at', { ascending: false }),
      supabase.from('enrollments').select('*, courses(*), workshops(*), profiles(*)').eq('status', 'completed'),
    ]);
    setItems((certsRes.data as Certificate[]) ?? []);
    setCompletedEnrollments((enrollRes.data as Enrollment[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function issueCertificate() {
    const enrollment = completedEnrollments.find((e) => e.id === form.enrollmentId);
    if (!enrollment) {
      toast.error('Select an enrollment.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('certificates').insert({
      certificate_id: generateCertificateId(),
      student_id: enrollment.student_id,
      enrollment_id: enrollment.id,
      title: enrollment.courses?.title ?? enrollment.workshops?.title ?? 'PCTIH Program',
      completion_date: form.completionDate,
      issued_by: profile?.id,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from('notifications').insert({
      profile_id: enrollment.student_id,
      title: 'Certificate issued',
      message: `Your certificate for "${enrollment.courses?.title ?? enrollment.workshops?.title}" has been issued.`,
      type: 'certificate_issued',
    });
    toast.success('Certificate issued.');
    setIssuing(false);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Certificates</h1>
        <button onClick={() => setIssuing(true)} className="btn-primary"><Plus className="h-4 w-4" /> Issue Certificate</button>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No certificates issued yet" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <div key={c.id} className="card p-5 flex gap-3">
              <Award className="h-6 w-6 text-brand-600 shrink-0" />
              <div>
                <p className="font-medium text-navy">{c.profiles?.full_name}</p>
                <p className="text-sm text-gray-500">{c.title}</p>
                <p className="text-xs text-gray-400 mt-1">{c.certificate_id} · {formatDate(c.completion_date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {issuing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy">Issue Certificate</h2>
              <button onClick={() => setIssuing(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Completed Enrollment</label>
                <select className="input" value={form.enrollmentId} onChange={(e) => setForm({ ...form, enrollmentId: e.target.value })}>
                  <option value="">Select student & program...</option>
                  {completedEnrollments.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.profiles?.full_name} — {e.courses?.title ?? e.workshops?.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Completion Date</label>
                <input type="date" className="input" value={form.completionDate} onChange={(e) => setForm({ ...form, completionDate: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIssuing(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={issueCertificate} disabled={saving} className="btn-primary flex-1">{saving ? 'Issuing...' : 'Issue Certificate'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
