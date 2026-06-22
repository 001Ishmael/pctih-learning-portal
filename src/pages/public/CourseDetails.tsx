import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, MapPin, Users, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../lib/types';
import { formatMoney } from '../../lib/format';
import { Spinner, ErrorState } from '../../components/ui/States';
import { useAuth } from '../../lib/AuthContext';

export default function CourseDetails() {
  const { slug } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    supabase
      .from('courses')
      .select('*, trainers(*, profiles(*))')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        setCourse(data as Course);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <Spinner />;
  if (!course) return <ErrorState message="Course not found." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="h-56 sm:h-72 bg-brand-100 rounded-xl mb-8 flex items-center justify-center overflow-hidden">
        {course.image_url ? <img src={course.image_url} alt={course.title} className="h-full w-full object-cover" /> : <BookOpen className="h-16 w-16 text-brand-400" />}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <span className={`badge mb-3 ${course.is_free ? 'bg-green-100 text-green-800' : 'bg-brand-100 text-brand-800'}`}>
            {course.is_free ? 'Free Course' : 'Paid Course'}
          </span>
          <h1 className="text-3xl font-bold text-navy mb-4">{course.title}</h1>
          <p className="text-gray-600 leading-relaxed">{course.description}</p>
        </div>
        <div className="card p-6 self-start">
          <p className="text-2xl font-bold text-navy mb-4">{course.is_free ? 'Free' : formatMoney(course.price)}</p>
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
            <li className="flex gap-2"><Clock className="h-4 w-4 text-brand-600" /> {course.duration ?? 'Flexible'}</li>
            <li className="flex gap-2"><MapPin className="h-4 w-4 text-brand-600" /> {course.venue ?? 'PCTIH Campus'}</li>
            <li className="flex gap-2"><Users className="h-4 w-4 text-brand-600" /> {course.capacity ?? 30} seats</li>
          </ul>
          <Link
            to={user ? `/student/enroll?type=course&id=${course.id}` : '/register'}
            className="btn-primary w-full"
          >
            {course.is_free ? 'Enroll for Free' : 'Enroll Now'}
          </Link>
        </div>
      </div>
    </div>
  );
}
