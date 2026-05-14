import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user, changePassword, loading, error } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setSuccessMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-spectral font-extrabold text-3xl text-text-primary mb-8">Settings</h1>

        <div className="bg-[#141414] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8 mb-6">
          <h2 className="font-spectral font-semibold text-xl text-text-primary mb-6">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-tertiary mb-1">Username</label>
              <p className="text-text-primary">{user?.username || '—'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-tertiary mb-1">Email</label>
              <p className="text-text-primary">{user?.email || '—'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-tertiary mb-1">Role</label>
              <p className="text-text-secondary text-sm capitalize">{user?.role || 'user'}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#141414] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8">
          <h2 className="font-spectral font-semibold text-xl text-text-primary mb-6">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-text-tertiary mb-1">
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0c0c0c] text-text-primary text-sm px-3 outline-none focus:border-[rgba(220,38,38,0.5)] focus:ring-1 focus:ring-[rgba(220,38,38,0.25)] transition-all"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-text-tertiary mb-1">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0c0c0c] text-text-primary text-sm px-3 outline-none focus:border-[rgba(220,38,38,0.5)] focus:ring-1 focus:ring-[rgba(220,38,38,0.25)] transition-all"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-tertiary mb-1">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-10 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0c0c0c] text-text-primary text-sm px-3 outline-none focus:border-[rgba(220,38,38,0.5)] focus:ring-1 focus:ring-[rgba(220,38,38,0.25)] transition-all"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {successMsg && <p className="text-sm text-green-400">{successMsg}</p>}

            <Button type="submit" variant="cyber" isLoading={loading}>
              Update password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}