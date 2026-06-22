import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', interest: '', notes: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('leads').insert({
      name: form.name,
      phone: form.phone,
      email: form.email,
      interest: form.interest,
      notes: form.notes,
      source: 'website',
      status: 'new',
    });
    setLoading(false);
    if (error) {
      toast.error('Could not send your message. Please try again.');
      return;
    }
    toast.success('Thank you! We will get back to you soon.');
    setForm({ name: '', phone: '', email: '', interest: '', notes: '' });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-10">
      <div>
        <h1 className="text-3xl font-bold text-navy mb-4">Contact Us</h1>
        <p className="text-gray-600 mb-6">Have a question? Send us a message and our team will respond.</p>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-brand-600" /> 4 Andrew Street, Off Krootown Road, Freetown, Sierra Leone</li>
          <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-brand-600" /> +232 79 468 780</li>
          <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-brand-600" /> peopleschoicet@gmail.com</li>
        </ul>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Interested Course/Workshop</label>
          <input className="input" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
