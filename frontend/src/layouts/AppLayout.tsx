import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Target, Wallet, Newspaper, Menu, LogOut, ChevronDown, Bell, LineChart, Settings, HelpCircle, Award, PieChart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Statements', icon: FileText, path: '/statements' },
  { label: 'Budgets', icon: PieChart, path: '/budgets' },
  { label: 'Goals', icon: Target, path: '/goals' },
  { label: 'Portfolio', icon: Wallet, path: '/portfolio' },
  { label: 'Markets', icon: LineChart, path: '/markets' },
  { label: 'Research', icon: Newspaper, path: '/research' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-outline-variant/30
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-outline-variant/30">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-semibold text-on-surface text-lg">Nexus</span>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors relative
                    ${active
                      ? 'text-[#10b981]'
                      : 'text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {active && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#10b981] rounded-l-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 px-6 mb-4">
            <Link
              to="/upgrade-to-pro"
              onClick={() => setSidebarOpen(false)}
              className="w-full bg-[#10b981] hover:opacity-90 text-white flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-all shadow-sm"
            >
              <Award className="w-5 h-5" />
              Upgrade to Pro
            </Link>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="p-6 flex flex-col gap-2 bg-white border-t border-outline-variant/30">
          <Link
            to="/help"
            className="flex items-center gap-3 px-1 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            Help
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-1 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-surface-container" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm text-on-surface-variant hidden sm:block">
              {NAV_ITEMS.find(i => location.pathname.startsWith(i.path))?.label || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-surface-container">
              <Bell className="w-5 h-5 text-on-surface-variant" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-container transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary-container/10 flex items-center justify-center text-xs font-medium text-primary-container">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium hidden sm:block">{user?.full_name?.split(' ')[0] || 'User'}</span>
                <ChevronDown className="w-4 h-4 text-on-surface-variant" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container-lowest rounded-lg border border-outline-variant/30 shadow-modal z-20 py-1">
                    <Link to="/settings" onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-surface-container">Profile Settings</Link>
                    <hr className="border-outline-variant/30 my-1" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/5">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
