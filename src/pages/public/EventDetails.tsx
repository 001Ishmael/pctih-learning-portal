import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Workshop } from '../../lib/types';
import { formatDate, formatMoney } from '../../lib/format';
import { Spinner, ErrorState } from '../../components/ui/States';
import { useAuth } from '../../lib/AuthContext';

export default function EventDetails() {
  const { slug } = useParams();
  const [item, setItem] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    supabase
      .from('workshops')
      .select('*, trainers(*, profiles(*))')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        setItem(data as Workshop);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <Spinner />;
  if (!item) return <ErrorState message="Workshop not found." />;

  const deadlinePassed = item.registration_deadline ? new Date(item.registration_deadline) < new Date() : false;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="h-56 sm:h-72 bg-brand-100 rounded-xl mb-8 flex items-center justify-center overflow-hidden">
        {item.image_url ? <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" /> : <CalendarDays className="h-16 w-16 text-brand-400" />}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <span className="badge bg-brand-100 text-brand-800 mb-3 capitalize">{item.type.replace('_', ' ')}</span>
          <h1 className="text-3xl font-bold text-navy mb-4">{item.title}</h1>
          <p className="text-gray-600 leading-relaxed">{item.description}</p>
        </div>
        <div className="card p-6 self-start">
          <p className="text-2xl font-bold text-navy mb-4">{item.is_free ? 'Free' : formatMoney(item.price)}</p>
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
            <li className="flex gap-2"><CalendarDays className="h-4 w-4 text-brand-600" /> {formatDate(item.date)}</li>
            <li className="flex gap-2"><Clock className="h-4 w-4 text-brand-600" /> {item.time}</li>
            <li className="flex gap-2"><MapPin className="h-4 w-4 text-brand-600" /> {item.venue}</li>
            <li className="flex gap-2"><Users className="h-4 w-4 text-brand-600" /> {item.capacity} seats</li>
          </ul>
          {item.registration_deadline && (
            <p className="text-xs text-gray-500 mb-4">Registration deadline: {formatDate(item.registration_deadline)}</p>
          )}
          <Link
            to={user ? `/student/enroll?type=workshop&id=${item.id}` : '/register'}
            className={`btn-primary w-full ${deadlinePassed ? 'pointer-events-none opacity-50' : ''}`}
          >
            {deadlinePassed ? 'Registration Closed' : item.is_free ? 'Register for Free' : 'Register Now'}
          </Link>
        </div>
      </div>
    </div>
  );
}
