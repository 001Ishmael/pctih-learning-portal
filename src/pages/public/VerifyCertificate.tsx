import { useState } from 'react';
import { ShieldCheck, ShieldX, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Certificate } from '../../lib/types';
import { formatDate } from '../../lib/format';

export default function VerifyCertificate() {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState<Certificate | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data } = await supabase
      .from('certificates')
      .select('*, profiles(*)')
      .eq('certificate_id', certId.trim())
      .maybeSingle();
    setResult((data as Certificate) ?? null);
    if (data) {
      await supabase.from('certificate_verifications').insert({ certificate_id: certId.trim() });
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-navy mb-2">Verify a Certificate</h1>
      <p className="text-gray-500 mb-6">Enter a PCTIH certificate ID to confirm its authenticity.</p>
      <form onSubmit={handleVerify} className="card p-6 space-y-4">
        <div>
          <label className="label">Certificate ID</label>
          <input className="input" placeholder="PCTIH-2026-XXXXXX" required value={certId} onChange={(e) => setCertId(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <Search className="h-4 w-4" /> {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      {result !== undefined && (
        <div className="mt-6 card p-6">
          {result ? (
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="h-10 w-10 text-green-600" />
              <p className="font-semibold text-navy">Certificate Verified</p>
              <p className="text-sm text-gray-600">{result.profiles?.full_name}</p>
              <p className="text-sm text-gray-600">{result.title}</p>
              <p className="text-xs text-gray-400">Issued {formatDate(result.completion_date)}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldX className="h-10 w-10 text-red-600" />
              <p className="font-semibold text-navy">Certificate Not Found</p>
              <p className="text-sm text-gray-600">Please check the certificate ID and try again.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
