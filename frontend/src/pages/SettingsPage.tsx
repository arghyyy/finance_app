import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

type SettingsTab = 'profile' | 'security' | 'preferences' | 'notifications';

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'security', label: 'Security', icon: 'lock' },
  { id: 'preferences', label: 'Preferences', icon: 'tune' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications_active' },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [notifications, setNotifications] = useState({
    portfolio: true,
    market_news: true,
    goal_milestones: true,
    statement_reminders: true,
    weekly_digest: false,
  });
  const [compactMode, setCompactMode] = useState(false);
  const [showPortfolioPreview, setShowPortfolioPreview] = useState(true);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/v1/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName
        })
      });
      if (res.ok) {
        alert('Profile updated successfully!');
        window.location.reload(); // Quick way to refresh user context
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert('Failed to update profile: ' + JSON.stringify(errorData));
        if (res.status === 401) {
          logout();
        }
      }
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm("Are you absolutely sure you want to permanently delete your account and all associated data? This action cannot be undone.");
    if (!confirmed) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/v1/users/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert('Your account has been deleted.');
        logout();
      } else {
        alert('Failed to delete account');
      }
    } catch (err) {
      alert('Error deleting account');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Settings</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Manage your account preferences, security settings, and personal information.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-xl">
        {/* ── Vertical Tabs (Desktop) / Horizontal Tabs (Mobile) ── */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg whitespace-nowrap lg:whitespace-normal w-full text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-surface-container-low text-secondary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                <span className="font-label-md text-label-md">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* ── Content Area ── */}
        <div className="flex-1 space-y-lg">

          {/* ═══ PROFILE ═══ */}
          {activeTab === 'profile' && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-outline-variant pb-4">Profile Information</h3>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-surface-container-highest relative group cursor-pointer bg-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant">person</span>
                  <div className="absolute inset-0 bg-primary/50 hidden group-hover:flex items-center justify-center rounded-full transition-all">
                    <span className="material-symbols-outlined text-on-primary">photo_camera</span>
                  </div>
                </div>
                <div>
                  <button className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors mb-2">
                    Change Avatar
                  </button>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Full Name</label>
                  <input
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary font-body-md text-on-surface outline-none transition-shadow"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Email Address</label>
                  <input
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary font-body-md text-on-surface-variant outline-none transition-shadow cursor-not-allowed bg-gray-50"
                    type="email"
                    value={email}
                    disabled
                  />
                </div>
                <div className="flex justify-end pt-4 border-t border-outline-variant">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#10b981] text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ═══ SECURITY ═══ */}
          {activeTab === 'security' && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-outline-variant pb-4">Security Settings</h3>

              <div className="space-y-8">
                {/* Change Password */}
                <div>
                  <h4 className="font-body-lg text-body-lg text-on-surface font-medium mb-4">Change Password</h4>
                  <div className="space-y-4 max-w-md">
                    <input
                      className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:border-secondary font-body-md text-on-surface outline-none"
                      placeholder="Current Password"
                      type="password"
                    />
                    <input
                      className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:border-secondary font-body-md text-on-surface outline-none"
                      placeholder="New Password"
                      type="password"
                    />
                    <button className="px-6 py-3 bg-[#10b981] text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity mt-2">
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Two-Factor Auth */}
                <div className="pt-6 border-t border-outline-variant flex items-center justify-between">
                  <div>
                    <h4 className="font-body-lg text-body-lg text-on-surface font-medium">Two-Factor Authentication</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Add an extra layer of security to your account.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={twoFactorEnabled}
                      onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    />
                    <div
                      className={`w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        twoFactorEnabled
                          ? 'bg-[#10b981] peer-checked:after:translate-x-full'
                          : 'bg-surface-dim'
                      }`}
                    />
                  </label>
                </div>

                {/* Delete Account */}
                <div className="pt-6 border-t border-outline-variant">
                  <h4 className="font-body-lg text-body-lg text-red-600 font-medium mb-2">Danger Zone</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button 
                    onClick={handleDeleteProfile}
                    className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-label-md text-label-md hover:bg-red-100 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ PREFERENCES ═══ */}
          {activeTab === 'preferences' && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-outline-variant pb-4">Preferences</h3>

              <div className="space-y-6">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Default Currency</label>
                  <select className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary font-body-md text-on-surface outline-none">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>JPY (¥)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Date Format</label>
                  <select className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary font-body-md text-on-surface outline-none">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                {/* Display Options */}
                <div className="pt-4 border-t border-outline-variant">
                  <h4 className="font-body-lg text-body-lg text-on-surface font-medium mb-4">Display Options</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-body-md text-body-md text-on-surface">Compact Mode</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Reduce spacing for denser data views</p>
                      </div>
                      <input
                        type="checkbox"
                        className="rounded border-outline-variant text-secondary focus:ring-secondary"
                        checked={compactMode}
                        onChange={(e) => setCompactMode(e.target.checked)}
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-body-md text-body-md text-on-surface">Show Portfolio Preview</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Display portfolio summary on dashboard</p>
                      </div>
                      <input
                        type="checkbox"
                        className="rounded border-outline-variant text-secondary focus:ring-secondary"
                        checked={showPortfolioPreview}
                        onChange={(e) => setShowPortfolioPreview(e.target.checked)}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-outline-variant">
                  <button className="px-6 py-3 bg-[#10b981] text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity shadow-sm">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ NOTIFICATIONS ═══ */}
          {activeTab === 'notifications' && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-outline-variant pb-4">Notification Settings</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-body-lg text-body-lg text-on-surface font-medium mb-4">Push Notifications</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'portfolio' as const, label: 'Portfolio Alerts', desc: 'Get notified on significant portfolio movements' },
                      { key: 'market_news' as const, label: 'Market News', desc: 'Breaking news and market-moving events' },
                      { key: 'goal_milestones' as const, label: 'Goal Milestones', desc: 'Celebrate when you hit financial targets' },
                      { key: 'statement_reminders' as const, label: 'Statement Reminders', desc: 'Reminders to review monthly statements' },
                      { key: 'weekly_digest' as const, label: 'Weekly Digest', desc: 'Receive a weekly summary of your finances' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between cursor-pointer p-3 bg-surface rounded-lg border border-outline-variant"
                      >
                        <div>
                          <p className="font-body-md text-body-md text-on-surface">{item.label}</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          className="rounded border-outline-variant text-secondary focus:ring-secondary"
                          checked={notifications[item.key]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-outline-variant">
                  <button className="px-6 py-3 bg-[#10b981] text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity shadow-sm">
                    Save Notification Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
