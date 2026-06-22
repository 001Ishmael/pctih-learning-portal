import { useEffect, useState } from 'react';
import { Users, BookOpen, CalendarDays, Wallet, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatMoney } from '../../lib/format';
import { Spinner } from '../../components/ui/States';

interface Stats {
  students: number;
  courses: number;
  workshops: number;
  revenue: number;
  pendingPayments: number;
  leadsBySource: Record<string, number>;
}

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const [studentsRes, coursesRes, workshopsRes, paymentsRes, pendingRes, leadsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('workshops').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'approved'),
        supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('leads').select('source'),
      ]);
      const revenue = (paymentsRes.data ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
      const leadsBySource: Record<string, number> = {};
      (leadsRes.data ?? []).forEach((l) => {
        leadsBySource[l.source] = (leadsBySource[l.source] ?? 0) + 1;
      });
      setStats({
        students: studentsRes.count ?? 0,
        courses: coursesRes.count ?? 0,
        workshops: workshopsRes.count ?? 0,
        revenue,
        pendingPayments: pendingRes.count ?? 0,
        leadsBySource,
      });
    }
    load();
  }, []);

  if (!stats) return <Spinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Admin Overview</h1>
        <p className="text-gray-500">Key metrics across the platform.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Students" value={stats.students} />
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Courses" value={stats.courses} />
        <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Workshops" value={stats.workshops} />
        <StatCard icon={<Wallet className="h-5 w-5" />} label="Total Revenue" value={formatMoney(stats.revenue)} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Payments" value={stats.pendingPayments} />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-navy mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Leads by Source</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          {Object.entries(stats.leadsBySource).length === 0 ? (
            <p className="text-sm text-gray-400">No leads yet.</p>
          ) : (
            Object.entries(stats.leadsBySource).map(([source, count]) => (
              <div key={source} className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-lg font-bold text-navy">{count}</p>
                <p className="text-xs text-gray-500 capitalize">{source.replace('_', ' ')}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-lg font-bold text-navy">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
