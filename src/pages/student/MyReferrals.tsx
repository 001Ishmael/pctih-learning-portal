import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, Users, Gift } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Referral } from '../../lib/types';
import { Spinner, EmptyState } from '../../components/ui/States';
import { formatDate } from '../../lib/format';

export default function MyReferrals() {
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('referrals')
      .select('*, referred:profiles!referrals_referred_id_fkey(*)')
      .eq('referrer_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReferrals((data as Referral[]) ?? []);
        setLoading(false);
      });
  }, [profile]);

  const referralLink = `${window.location.origin}/register?ref=${profile?.referral_code ?? ''}`;

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  }

  function copyCode() {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    toast.success('Referral code copied!');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Referrals</h1>
        <p className="text-gray-500">Invite friends to PCTIH using your referral code.</p>
      </div>

      <div className="card p-6 bg-brand-50 border-brand-200">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="h-5 w-5 text-brand-600" />
          <p className="font-semibold text-navy">Your Referral Code</p>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <p className="text-2xl font-bold text-brand-700 tracking-wide">{profile?.referral_code ?? '—'}</p>
          <button onClick={copyCode} title="Copy code"><Copy className="h-4 w-4 text-gray-500" /></button>
        </div>
        <div className="flex gap-2">
          <input className="input bg-white" readOnly value={referralLink} />
          <button onClick={copyLink} className="btn-primary whitespace-nowrap">Copy Link</button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Share your code or link. When someone registers using it, they'll show up below.
        </p>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-brand-600" />
          <h2 className="font-semibold text-navy">Students You've Referred ({referrals.length})</h2>
        </div>
        {loading ? (
          <Spinner />
        ) : referrals.length === 0 ? (
          <EmptyState title="No referrals yet" description="Share your referral code to start inviting friends." />
        ) : (
          <div className="divide-y divide-gray-100">
            {referrals.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-navy">{r.referred?.full_name}</p>
                  <p className="text-xs text-gray-400">Joined {formatDate(r.created_at)}</p>
                </div>
                {r.reward_note && <span className="badge bg-green-100 text-green-800">{r.reward_note}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
