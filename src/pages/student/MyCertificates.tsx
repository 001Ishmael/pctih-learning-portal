import { useEffect, useState } from 'react';
import { Download, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Certificate } from '../../lib/types';
import { Spinner, EmptyState } from '../../components/ui/States';
import { formatDate } from '../../lib/format';

export default function MyCertificates() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('certificates')
      .select('*')
      .eq('student_id', profile.id)
      .order('issued_at', { ascending: false })
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, [profile]);

  function downloadCertificate(cert: Certificate) {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><body style="font-family:serif;padding:60px;text-align:center;border:8px solid #0a1a3c;max-width:800px;margin:30px auto;">
      <h2 style="color:#0a1a3c;">People's Choice Technology & Innovation Hub</h2>
      <p style="text-transform:uppercase;letter-spacing:2px;color:#888;">Certificate of Completion</p>
      <h1 style="margin:30px 0;">${profile?.full_name}</h1>
      <p>has successfully completed</p>
      <h3>${cert.title}</h3>
      <p>on ${formatDate(cert.completion_date)}</p>
      <p style="margin-top:60px;font-size:12px;color:#888;">Certificate ID: ${cert.certificate_id}</p>
      <p style="font-size:12px;color:#888;">Verify at peopleschoicehub.com/verify-certificate</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">My Certificates</h1>
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No certificates yet" description="Complete a course or workshop to earn your certificate." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((c) => (
            <div key={c.id} className="card p-5 flex items-start gap-4">
              <Award className="h-8 w-8 text-brand-600 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-navy">{c.title}</p>
                <p className="text-xs text-gray-400 mb-2">Completed {formatDate(c.completion_date)} · {c.certificate_id}</p>
                <button onClick={() => downloadCertificate(c)} className="btn-outline text-sm"><Download className="h-4 w-4" /> Download</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
