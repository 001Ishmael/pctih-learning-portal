import { useEffect, useState } from 'react';
import { Download, Wallet, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Payment } from '../../lib/types';
import { formatDate, formatMoney } from '../../lib/format';
import { Spinner } from '../../components/ui/States';

export default function FinanceReports() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('payments')
      .select('*, enrollments(*, courses(*), workshops(*), profiles(*))')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPayments((data as Payment[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;

  const approved = payments.filter((p) => p.status === 'approved');
  const pending = payments.filter((p) => p.status === 'pending');
  const rejected = payments.filter((p) => p.status === 'rejected');
  const totalRevenue = approved.reduce((sum, p) => sum + Number(p.amount), 0);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay.getTime() - startOfDay.getDay() * 86400000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sumSince = (date: Date) => approved.filter((p) => new Date(p.created_at) >= date).reduce((s, p) => s + Number(p.amount), 0);

  const byProgram: Record<string, number> = {};
  approved.forEach((p) => {
    const name = p.enrollments?.courses?.title ?? p.enrollments?.workshops?.title ?? 'Unknown';
    byProgram[name] = (byProgram[name] ?? 0) + Number(p.amount);
  });

  function exportCSV() {
    const header = ['Student', 'Program', 'Amount', 'Transaction ID', 'Payment Date', 'Status'];
    const rows = payments.map((p) => [
      p.enrollments?.profiles?.full_name ?? '',
      p.enrollments?.courses?.title ?? p.enrollments?.workshops?.title ?? '',
      p.amount,
      p.transaction_id,
      p.payment_date,
      p.status,
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pctih-finance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Finance Overview</h1>
          <p className="text-gray-500">Revenue and payment performance.</p>
        </div>
        <button onClick={exportCSV} className="btn-outline"><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Wallet className="h-5 w-5" />} label="Total Revenue" value={formatMoney(totalRevenue)} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Payments" value={pending.length} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Approved Payments" value={approved.length} />
        <StatCard icon={<XCircle className="h-5 w-5" />} label="Rejected Payments" value={rejected.length} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Today's Revenue" value={formatMoney(sumSince(startOfDay))} />
        <StatCard label="This Week" value={formatMoney(sumSince(startOfWeek))} />
        <StatCard label="This Month" value={formatMoney(sumSince(startOfMonth))} />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-navy mb-4">Revenue by Course / Workshop</h2>
        {Object.keys(byProgram).length === 0 ? (
          <p className="text-sm text-gray-400">No approved payments yet.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(byProgram).sort((a, b) => b[1] - a[1]).map(([name, amount]) => (
              <div key={name} className="flex items-center justify-between text-sm border-b border-gray-100 py-2">
                <span className="text-gray-700">{name}</span>
                <span className="font-medium text-navy">{formatMoney(amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.slice(0, 20).map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.enrollments?.profiles?.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{p.enrollments?.courses?.title ?? p.enrollments?.workshops?.title}</td>
                <td className="px-4 py-3">{formatMoney(p.amount)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(p.payment_date)}</td>
                <td className="px-4 py-3 capitalize">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      {icon && <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">{icon}</div>}
      <div>
        <p className="text-lg font-bold text-navy">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
