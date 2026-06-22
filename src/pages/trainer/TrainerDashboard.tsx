import { LayoutDashboard, Users, ClipboardCheck, FileText } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const navItems = [
  { to: '/trainer', label: 'My Courses', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/trainer/students', label: 'Students', icon: <Users className="h-4 w-4" /> },
  { to: '/trainer/attendance', label: 'Attendance', icon: <ClipboardCheck className="h-4 w-4" /> },
  { to: '/trainer/materials', label: 'Materials', icon: <FileText className="h-4 w-4" /> },
];

export default function TrainerDashboard() {
  return <DashboardLayout navItems={navItems} roleLabel="Trainer" />;
}
