import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Referral } from '../../lib/types';
import { Spinner, EmptyState } from '../../components/ui/States';
import { formatDate } from '../../lib/format';

interface ReferralRow extends Referral {
  referrer?: { full_name: string; email: string; referral_code: string | null };
}

export default function AdminReferrals() {
  const [items, setItems] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('referrals')
      .select('*, referrer:profiles!referrals_referrer_id_fkey(full_name, email, referral_code), referred:profiles!referrals_referred_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems((data as ReferralRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  const byReferrer: Record<string, { name: string; code: string | null; count: number }> = {};
  items.forEach((r) => {
    const key = r.referrer_id;
    if (!byReferrer[key]) byReferrer[key] = { name: r.referrer?.full_name ?? 'Unknown', code: r.referrer?.referral_code ?? null, count: 0 };
    byReferrer[key].count += 1;
  });
  const topReferrers = Object.values(byReferrer).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Referral Report</h1>
        <p className="text-gray-500">Track who's bringing students to PCTIH.</p>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-navy">Top Referrers</h2>
        </div>
        {topReferrers.length === 0 ? (
          <p className="text-sm text-gray-400">No referrals yet.</p>
        ) : (
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {topReferrers.map((r) => (
              <div key={r.name} className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-lg font-bold text-navy">{r.count}</p>
                <p className="text-xs text-gray-500">{r.name}</p>
                <p className="text-xs text-gray-400">{r.code}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState title="No referrals recorded yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Referrer</th>
                <th className="px-4 py-3">Referral Code</th>
                <th className="px-4 py-3">Referred Student</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reward Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-navy">{r.referrer?.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.referrer?.referral_code}</td>
                  <td className="px-4 py-3 text-gray-600">{r.referred?.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3 text-gray-500">{r.reward_note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
