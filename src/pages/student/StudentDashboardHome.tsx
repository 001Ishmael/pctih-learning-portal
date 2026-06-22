import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CreditCard, Award, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Enrollment } from '../../lib/types';
import { StatusBadge } from '../../components/ui/Badge';
import { Spinner, EmptyState } from '../../components/ui/States';

export default function StudentDashboardHome() {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('enrollments')
      .select('*, courses(*), workshops(*)')
      .eq('student_id', profile.id)
      .order('enrolled_at', { ascending: false })
      .then(({ data }) => {
        setEnrollments((data as Enrollment[]) ?? []);
        setLoading(false);
      });
  }, [profile]);

  const active = enrollments.filter((e) => e.status === 'active').length;
  const pending = enrollments.filter((e) => e.status === 'pending_payment').length;
  const completed = enrollments.filter((e) => e.status === 'completed').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Welcome, {profile?.full_name?.split(' ')[0]}</h1>
        <p className="text-gray-500">Here's an overview of your learning journey.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Active Enrollments" value={active} />
        <StatCard icon={<CreditCard className="h-5 w-5" />} label="Pending Payments" value={pending} />
        <StatCard icon={<Award className="h-5 w-5" />} label="Completed" value={completed} />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-navy">My Enrollments</h2>
          <Link to="/courses" className="text-sm text-brand-600 font-medium">Browse more</Link>
        </div>
        {loading ? (
          <Spinner />
        ) : enrollments.length === 0 ? (
          <EmptyState title="No enrollments yet" description="Browse our courses and workshops to get started." />
        ) : (
          <div className="divide-y divide-gray-100">
            {enrollments.map((e) => (
              <div key={e.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-navy">{e.courses?.title ?? e.workshops?.title}</p>
                  <p className="text-xs text-gray-400">{e.registerable_type === 'course' ? 'Course' : 'Workshop'}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/student/notifications" className="card p-5 flex items-center gap-3 hover:shadow-md transition-shadow">
          <Bell className="h-5 w-5 text-brand-600" />
          <span className="font-medium text-navy">View Notifications</span>
        </Link>
        <Link to="/student/certificates" className="card p-5 flex items-center gap-3 hover:shadow-md transition-shadow">
          <Award className="h-5 w-5 text-brand-600" />
          <span className="font-medium text-navy">My Certificates</span>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-xl font-bold text-navy">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
