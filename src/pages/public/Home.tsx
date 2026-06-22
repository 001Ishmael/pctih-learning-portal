import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Award, Users, Laptop, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Course, Workshop } from '../../lib/types';
import { formatDate, formatMoney } from '../../lib/format';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  useEffect(() => {
    supabase.from('courses').select('*').eq('status', 'published').limit(4).then(({ data }) => setCourses(data ?? []));
    supabase
      .from('workshops')
      .select('*')
      .in('status', ['upcoming', 'active'])
      .order('date', { ascending: true })
      .limit(3)
      .then(({ data }) => setWorkshops(data ?? []));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-navy to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="badge bg-white/10 text-white mb-4">Freetown, Sierra Leone</span>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">Build digital skills that open doors.</h1>
            <p className="text-lg text-gray-200 mb-8 max-w-lg">
              People&apos;s Choice Technology &amp; Innovation Hub (PCTIH) offers practical, affordable courses, workshops,
              and bootcamps to help you learn, grow, and get hired.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/courses" className="btn-primary">Explore Courses <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/workshops" className="btn-outline bg-white/5 border-white text-white hover:bg-white/10">View Workshops</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: BookOpen, label: 'Courses', value: '9+' },
              { icon: Users, label: 'Students Trained', value: '500+' },
              { icon: Award, label: 'Certificates Issued', value: '300+' },
              { icon: Laptop, label: 'Workshops Run', value: '20+' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-5 backdrop-blur">
                <s.icon className="h-6 w-6 mb-2 text-brand-200" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-gray-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-navy">Available Courses</h2>
            <p className="text-gray-500">Hands-on training led by experienced facilitators.</p>
          </div>
          <Link to="/courses" className="text-brand-600 font-medium hidden sm:flex items-center gap-1">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((c) => (
            <Link key={c.id} to={`/courses/${c.slug}`} className="card overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-brand-100 flex items-center justify-center">
                {c.image_url ? <img src={c.image_url} alt={c.title} className="h-full w-full object-cover" /> : <BookOpen className="h-10 w-10 text-brand-400" />}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy mb-1">{c.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{c.duration}</p>
                <span className={`badge ${c.is_free ? 'bg-green-100 text-green-800' : 'bg-brand-100 text-brand-800'}`}>
                  {c.is_free ? 'Free' : formatMoney(c.price)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-navy">Upcoming Workshops & Seminars</h2>
              <p className="text-gray-500">Short, focused sessions to sharpen specific skills.</p>
            </div>
            <Link to="/workshops" className="text-brand-600 font-medium hidden sm:flex items-center gap-1">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((w) => (
              <Link key={w.id} to={`/workshops/${w.slug}`} className="card p-5 hover:shadow-md transition-shadow">
                <span className="badge bg-brand-100 text-brand-800 mb-3 capitalize">{w.type.replace('_', ' ')}</span>
                <h3 className="font-semibold text-navy mb-1">{w.title}</h3>
                <p className="text-sm text-gray-500 mb-3">{formatDate(w.date)} · {w.venue}</p>
                <span className={`badge ${w.is_free ? 'bg-green-100 text-green-800' : 'bg-brand-100 text-brand-800'}`}>
                  {w.is_free ? 'Free' : formatMoney(w.price)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-navy mb-8 text-center">Why Choose PCTIH</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            'Affordable, practical training',
            'Experienced local facilitators',
            'Recognized certificates',
            'Flexible free & paid programs',
          ].map((t) => (
            <div key={t} className="card p-5 flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{t}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy mb-8 text-center">What Our Students Say</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: 'Aminata K.', text: 'PCTIH gave me the digital skills I needed to land my first job.' },
              { name: 'Mohamed S.', text: 'The web development course was practical and well taught.' },
              { name: 'Fatmata J.', text: 'Affordable and professional. I recommend PCTIH to everyone.' },
            ].map((t) => (
              <div key={t.name} className="card p-5">
                <p className="text-sm text-gray-700 mb-3">&ldquo;{t.text}&rdquo;</p>
                <p className="text-sm font-semibold text-navy">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to start learning?</h2>
          <p className="text-brand-100 mb-6">Join hundreds of students building their future with PCTIH.</p>
          <Link to="/register" className="btn bg-white text-brand-700 hover:bg-gray-100">Register Now</Link>
        </div>
      </section>
    </div>
  );
}
