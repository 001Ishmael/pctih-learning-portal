import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(params.get('ref') ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, fullName, referralCode || undefined);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Account created! You can now log in.');
    navigate('/login');
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-navy mb-2">Create your account</h1>
      <p className="text-gray-500 mb-6">Join PCTIH and start learning today.</p>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="label">Referral Code (optional)</label>
          <input className="input" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4 text-center">
        Already have an account? <Link to="/login" className="text-brand-600 font-medium">Log in</Link>
      </p>
    </div>
  );
}
