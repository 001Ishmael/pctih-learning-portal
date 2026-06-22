import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/workshops', label: 'Workshops & Seminars' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-navy text-lg">
            <div className="h-9 w-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">PC</div>
            <span className="hidden sm:inline">People&apos;s Choice</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? 'text-brand-600' : 'text-gray-700 hover:text-brand-600'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                to={
                  profile?.role && profile.role !== 'student' ? `/${profile.role.replace('_', '-')}` : '/student'
                }
                className="btn-primary"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-gray-200 px-4 py-3 space-y-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-700">
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              {user ? (
                <Link to="/student" className="btn-primary w-full">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-outline w-full">Login</Link>
                  <Link to="/register" className="btn-primary w-full">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-navy text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-white text-lg mb-3">
              <div className="h-9 w-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">PC</div>
              People&apos;s Choice
            </div>
            <p className="text-sm text-gray-400">People&apos;s Choice Technology & Innovation Hub (PCTIH) — building digital skills for Sierra Leone.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l.to}><Link to={l.to} className="hover:text-white">{l.label}</Link></li>
              ))}
              <li><Link to="/verify-certificate" className="hover:text-white">Verify Certificate</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /> 4 Andrew Street, Off Krootown Road, Freetown, Sierra Leone</li>
              <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0" /> +232 79 468 780</li>
              <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0" /> peopleschoicet@gmail.com</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Get Started</h4>
            <p className="text-sm mb-3">Ready to build your future? Register today.</p>
            <Link to="/register" className="btn-primary">Register Now</Link>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} People&apos;s Choice Technology & Innovation Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
