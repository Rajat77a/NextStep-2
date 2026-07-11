import { useState } from 'react';
import { motion } from 'framer-motion';
import TransitionLink from '@/components/shared/TransitionLink';
import { ArrowLeft, User, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ParentSettings() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateUser({ fullName, email, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined });
      setMessage('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      setMessage(e.message || 'Update failed');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <TransitionLink to="/parent" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Dashboard
        </TransitionLink>
        <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-6">Account Settings</h2>
      </motion.div>

      {message && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mb-6 p-4 rounded-xl ${message.includes('success') ? 'bg-sage/10 text-sage' : 'bg-coral/10 text-coral'} font-body text-sm`}>
          {message}
        </motion.div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-coral" />
            <h3 className="font-display text-lg text-charcoal">Profile Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm text-charcoal focus:border-coral outline-none" />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm text-charcoal focus:border-coral outline-none" />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-coral" />
            <h3 className="font-display text-lg text-charcoal">Change Password</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Required to change password" className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm text-charcoal placeholder:text-medium-gray focus:border-coral outline-none" />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm text-charcoal placeholder:text-medium-gray focus:border-coral outline-none" />
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-display text-lg text-charcoal mb-4">Privacy</h3>
          <div className="bg-cream rounded-xl p-4">
            <p className="font-body text-sm font-medium text-charcoal mb-1">Your data is private</p>
            <p className="font-body text-xs text-medium-gray leading-relaxed">No teacher or school admin can see your Clarity Check, conversation guides, or 30-day plans. Your child's data is never shared with third parties.</p>
          </div>
        </div>

        <button type="submit" disabled={saving} disabled={saving} className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
