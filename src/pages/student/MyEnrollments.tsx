import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Enrollment } from '../../lib/types';
import { StatusBadge } from '../../components/ui/Badge';
import { Spinner, EmptyState } from '../../components/ui/States';
import { formatDate, formatMoney } from '../../lib/format';

export default function MyEnrollments() {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('enrollments')
      .select('*, courses(*), workshops(*), payments(*)')
      .eq('student_id', profile.id)
      .order('enrolled_at', { ascending: false })
      .then(({ data }) => {
        setEnrollments((data as Enrollment[]) ?? []);
        setLoading(false);
      });
  }, [profile]);

  async function downloadReceipt(enrollment: Enrollment) {
    const payment = enrollment.payments?.find((p) => p.status === 'approved');
    if (!payment) return;
    const { data } = await supabase.from('receipts').select('*').eq('payment_id', payment.id).maybeSingle();
    if (!data) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><body style="font-family:sans-serif;padding:40px;max-width:600px;margin:auto;">
      <h2>People's Choice Technology & Innovation Hub</h2>
      <p>4 Andrew Street, Off Krootown Road, Freetown, Sierra Leone</p>
      <hr/>
      <h3>Payment Receipt</h3>
      <p><strong>Receipt No:</strong> ${data.receipt_number}</p>
      <p><strong>Student:</strong> ${profile?.full_name}</p>
      <p><strong>Program:</strong> ${enrollment.courses?.title ?? enrollment.workshops?.title}</p>
      <p><strong>Amount Paid:</strong> ${formatMoney(payment.amount)}</p>
      <p><strong>Transaction ID:</strong> ${payment.transaction_id}</p>
      <p><strong>Date:</strong> ${formatDate(payment.payment_date)}</p>
      <p><strong>Issued:</strong> ${formatDate(data.issued_at)}</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">My Enrollments</h1>
      {loading ? (
        <Spinner />
      ) : enrollments.length === 0 ? (
        <EmptyState title="No enrollments yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium text-navy">{e.courses?.title ?? e.workshops?.title}</td>
                  <td className="px-4 py-3 capitalize">{e.registerable_type}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(e.enrolled_at)}</td>
                  <td className="px-4 py-3">
                    {e.payments?.some((p) => p.status === 'approved') && (
                      <button onClick={() => downloadReceipt(e)} className="btn-ghost text-brand-600">
                        <Download className="h-4 w-4" /> Receipt
                      </button>
                    )}
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
