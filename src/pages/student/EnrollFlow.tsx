import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Course, Workshop, PromoCode } from '../../lib/types';
import { formatMoney } from '../../lib/format';
import { Spinner, ErrorState } from '../../components/ui/States';

const FALLBACK_ORANGE_MONEY_NUMBER = import.meta.env.VITE_ORANGE_MONEY_NUMBER ?? '+232 79 468 780';

export default function EnrollFlow() {
  const [params] = useSearchParams();
  const type = params.get('type') as 'course' | 'workshop';
  const id = params.get('id') ?? '';
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<Course | Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'confirm' | 'payment' | 'done'>('confirm');
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orangeMoneyNumber, setOrangeMoneyNumber] = useState(FALLBACK_ORANGE_MONEY_NUMBER);

  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [payerPhone, setPayerPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    if (!type || !id) return;
    const table = type === 'course' ? 'courses' : 'workshops';
    supabase.from(table).select('*').eq('id', id).single().then(({ data }) => {
      setItem(data);
      setLoading(false);
    });
    supabase.from('settings').select('value').eq('key', 'orange_money_number').maybeSingle().then(({ data }) => {
      if (data?.value) setOrangeMoneyNumber(typeof data.value === 'string' ? data.value : JSON.stringify(data.value));
    });
  }, [type, id]);

  if (loading) return <Spinner />;
  if (!item) return <ErrorState message="Item not found." />;

  const isFree = item.is_free;
  const basePrice = item.price;
  let finalPrice = basePrice;
  if (promo) {
    finalPrice = promo.discount_type === 'percentage'
      ? basePrice - (basePrice * promo.discount_value) / 100
      : Math.max(0, basePrice - promo.discount_value);
  }

  async function applyPromo() {
    if (!promoInput.trim()) return;
    const { data } = await supabase.from('promo_codes').select('*').eq('code', promoInput.trim().toUpperCase()).eq('is_active', true).maybeSingle();
    if (!data) {
      toast.error('Invalid or expired promo code.');
      return;
    }
    if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
      toast.error('Promo code has expired.');
      return;
    }
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      toast.error('Promo code usage limit reached.');
      return;
    }
    setPromo(data);
    toast.success('Promo code applied!');
  }

  async function createEnrollment() {
    if (!profile) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        student_id: profile.id,
        registerable_type: type,
        course_id: type === 'course' ? id : null,
        workshop_id: type === 'workshop' ? id : null,
        status: isFree ? 'active' : 'pending_payment',
        promo_code_id: promo?.id ?? null,
      })
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      toast.error('Could not create enrollment.');
      return;
    }
    setEnrollmentId(data.id);
    await supabase.from('notifications').insert({
      profile_id: profile.id,
      title: 'Registration received',
      message: `Your registration for "${item!.title}" has been received.`,
      type: 'registration',
    });
    if (isFree) {
      setStep('done');
      toast.success('You are enrolled!');
    } else {
      setStep('payment');
    }
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollmentId) return;
    setSubmitting(true);
    let proofUrl: string | null = null;
    if (proofFile) {
      const path = `${profile?.id}/${Date.now()}-${proofFile.name}`;
      const { data, error: uploadError } = await supabase.storage.from('payment-proofs').upload(path, proofFile);
      if (uploadError) {
        toast.error('Could not upload proof of payment.');
        setSubmitting(false);
        return;
      }
      proofUrl = data.path;
    }
    const { error } = await supabase.from('payments').insert({
      enrollment_id: enrollmentId,
      amount: finalPrice,
      payer_phone: payerPhone,
      transaction_id: transactionId,
      payment_date: paymentDate,
      proof_url: proofUrl,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      toast.error('Could not submit payment.');
      return;
    }
    if (promo) {
      await supabase.from('promo_codes').update({ used_count: promo.used_count + 1 }).eq('id', promo.id);
    }
    await supabase.from('notifications').insert({
      profile_id: profile?.id,
      title: 'Payment pending review',
      message: `Your payment of ${formatMoney(finalPrice)} is pending approval.`,
      type: 'payment_pending',
    });
    setStep('done');
    toast.success('Payment submitted for review!');
  }

  if (step === 'done') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-navy mb-3">{isFree ? "You're enrolled!" : 'Payment submitted!'}</h1>
        <p className="text-gray-500 mb-6">
          {isFree
            ? `You are now enrolled in "${item.title}".`
            : 'Your payment is pending review. You will be notified once approved.'}
        </p>
        <button onClick={() => navigate('/student/enrollments')} className="btn-primary">View My Enrollments</button>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="max-w-lg mx-auto py-12">
        <h1 className="text-2xl font-bold text-navy mb-2">Complete Payment</h1>
        <p className="text-gray-500 mb-6">Pay via Orange Money, then submit your transaction details below.</p>
        <div className="card p-5 mb-6 bg-brand-50 border-brand-200">
          <p className="text-sm text-gray-600 mb-1">Send payment to:</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-navy">{orangeMoneyNumber}</p>
            <button type="button" onClick={() => { navigator.clipboard.writeText(orangeMoneyNumber); toast.success('Copied!'); }}>
              <Copy className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">Amount to pay: <strong>{formatMoney(finalPrice)}</strong></p>
        </div>
        <form onSubmit={submitPayment} className="card p-6 space-y-4">
          <div>
            <label className="label">Payment Phone Number</label>
            <input className="input" required value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} />
          </div>
          <div>
            <label className="label">Transaction ID</label>
            <input className="input" required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount Paid</label>
              <input className="input" type="number" required value={finalPrice} readOnly />
            </div>
            <div>
              <label className="label">Date of Payment</label>
              <input type="date" className="input" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Upload Proof of Payment</label>
            <input type="file" accept="image/*,.pdf" className="input" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Submitting...' : 'Submit Payment for Review'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-bold text-navy mb-2">Confirm Registration</h1>
      <div className="card p-6 mb-6">
        <p className="font-semibold text-navy mb-1">{item.title}</p>
        <p className="text-sm text-gray-500 mb-4">{type === 'course' ? 'Course' : 'Workshop'}</p>
        {!isFree && (
          <div className="flex gap-2 mb-4">
            <input className="input" placeholder="Promo code (optional)" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
            <button type="button" onClick={applyPromo} className="btn-outline whitespace-nowrap">Apply</button>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Price</span>
          <span className={`font-bold ${promo ? 'line-through text-gray-400' : 'text-navy'}`}>{isFree ? 'Free' : formatMoney(basePrice)}</span>
        </div>
        {promo && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-500">After discount</span>
            <span className="font-bold text-brand-600">{formatMoney(finalPrice)}</span>
          </div>
        )}
      </div>
      <button onClick={createEnrollment} disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Processing...' : isFree ? 'Confirm Free Enrollment' : 'Continue to Payment'}
      </button>
    </div>
  );
}
