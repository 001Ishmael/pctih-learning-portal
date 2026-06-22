import {
  LayoutDashboard, BookOpen, CalendarDays, CreditCard, ClipboardList, Users, Tag, Award, GraduationCap, Gift, Settings, QrCode,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../lib/AuthContext';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const isFinance = profile?.role === 'finance_officer';

  const navItems = isFinance
    ? [
        { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: '/admin/payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
      ]
    : [
        { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: '/admin/courses', label: 'Courses', icon: <BookOpen className="h-4 w-4" /> },
        { to: '/admin/workshops', label: 'Workshops', icon: <CalendarDays className="h-4 w-4" /> },
        { to: '/admin/enrollments', label: 'Enrollments', icon: <ClipboardList className="h-4 w-4" /> },
        { to: '/admin/payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
        { to: '/admin/trainers', label: 'Trainers', icon: <GraduationCap className="h-4 w-4" /> },
        { to: '/admin/certificates', label: 'Certificates', icon: <Award className="h-4 w-4" /> },
        { to: '/admin/leads', label: 'Leads', icon: <Users className="h-4 w-4" /> },
        { to: '/admin/promo-codes', label: 'Promo Codes', icon: <Tag className="h-4 w-4" /> },
        { to: '/admin/referrals', label: 'Referrals', icon: <Gift className="h-4 w-4" /> },
        { to: '/admin/check-in', label: 'Workshop Check-In', icon: <QrCode className="h-4 w-4" /> },
        { to: '/admin/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
      ];

  return <DashboardLayout navItems={navItems} roleLabel={profile?.role.replace('_', ' ') ?? 'Admin'} />;
}
