import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Payment } from '../../lib/types';
import { formatDate, formatMoney, generateReceiptNumber } from '../../lib/format';
import { Spinner, EmptyState } from '../../components/ui/States';
import { StatusBadge } from '../../components/ui/Badge';

export default function AdminPayments() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  async function load() {
    setLoading(true);
    let query = supabase
      .from('payments')
      .select('*, enrollments(*, courses(*), workshops(*), profiles(*))')
      .order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setPayments((data as Payment[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function getProofUrl(path: string) {
    const { data } = await supabase.storage.from('payment-proofs').createSignedUrl(path, 60 * 5);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  }

  async function approve(p: Payment) {
    await supabase.from('payments').update({ status: 'approved', reviewed_by: profile?.id, reviewed_at: new Date().toISOString() }).eq('id', p.id);
    await supabase.from('enrollments').update({ status: 'active' }).eq('id', p.enrollment_id);
    await supabase.from('receipts').insert({ payment_id: p.id, receipt_number: generateReceiptNumber() });
    const studentId = p.enrollments?.student_id;
    if (studentId) {
      await supabase.from('notifications').insert({
        profile_id: studentId,
        title: 'Payment approved',
        message: `Your payment of ${formatMoney(p.amount)} has been approved. Your enrollment is now active.`,
        type: 'payment_approved',
      });
    }
    toast.success('Payment approved.');
    load();
  }

  async function reject(p: Payment) {
    const reason = prompt('Reason for rejection (optional):') ?? '';
    await supabase.from('payments').update({ status: 'rejected', reviewed_by: profile?.id, reviewed_at: new Date().toISOString(), rejection_reason: reason }).eq('id', p.id);
    const studentId = p.enrollments?.student_id;
    if (studentId) {
      await supabase.from('notifications').insert({
        profile_id: studentId,
        title: 'Payment rejected',
        message: `Your payment of ${formatMoney(p.amount)} was rejected. ${reason}`,
        type: 'payment_rejected',
      });
    }
    toast.success('Payment rejected.');
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Payments</h1>
      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'btn-primary capitalize' : 'btn-outline capitalize'}>{f}</button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : payments.length === 0 ? (
        <EmptyState title="No payments found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-navy">{p.enrollments?.profiles?.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.enrollments?.courses?.title ?? p.enrollments?.workshops?.title}</td>
                  <td className="px-4 py-3">{formatMoney(p.amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.transaction_id}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.payment_date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 flex gap-2">
                    {p.proof_url && (
                      <button onClick={() => getProofUrl(p.proof_url!)} className="btn-ghost" title="View proof"><ExternalLink className="h-4 w-4" /></button>
                    )}
                    {p.status === 'pending' && (
                      <>
                        <button onClick={() => approve(p)} className="btn-ghost text-green-600"><Check className="h-4 w-4" /></button>
                        <button onClick={() => reject(p)} className="btn-ghost text-red-600"><X className="h-4 w-4" /></button>
                      </>
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
