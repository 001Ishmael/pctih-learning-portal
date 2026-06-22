import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export default function DashboardLayout({ navItems, roleLabel }: { navItems: NavItem[]; roleLabel: string }) {
  const [open, setOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-navy text-white transform transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-sm">PC</div>
            People&apos;s Choice
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="px-4 pt-4 text-xs uppercase tracking-wide text-gray-400">{roleLabel}</p>
        <nav className="px-2 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-brand-600 text-white' : 'text-gray-300 hover:bg-white/10'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <p className="text-sm font-medium truncate">{profile?.full_name}</p>
          <p className="text-xs text-gray-400 truncate mb-3">{profile?.email}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div />
          <Link to={navItems[0]?.to.replace(/\/[^/]+$/, '/notifications')} className="relative">
            <Bell className="h-5 w-5 text-gray-500" />
          </Link>
        </header>
        <main className="p-4 sm:p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
