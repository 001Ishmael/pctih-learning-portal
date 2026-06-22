import { LayoutDashboard, BookOpen, CalendarDays, Bell, Award } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const navItems = [
  { to: '/student', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/student/enrollments', label: 'My Enrollments', icon: <BookOpen className="h-4 w-4" /> },
  { to: '/student/schedule', label: 'My Schedule', icon: <CalendarDays className="h-4 w-4" /> },
  { to: '/student/certificates', label: 'Certificates', icon: <Award className="h-4 w-4" /> },
  { to: '/student/notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
];

export default function StudentDashboard() {
  return <DashboardLayout navItems={navItems} roleLabel="Student" />;
}
