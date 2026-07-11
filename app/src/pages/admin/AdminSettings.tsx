import TransitionLink from '@/components/shared/TransitionLink';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ParentSettings from '@/pages/parent/ParentSettings';

export default function AdminSettings() {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-5 md:px-12 py-6">
        <TransitionLink to="/admin" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Dashboard
        </TransitionLink>
        <h2 className="font-display text-3xl text-charcoal mb-1">Admin Settings</h2>
        <p className="font-body text-medium-gray text-sm mb-4">Manage your account and school preferences.</p>
      </motion.div>
      <ParentSettings />
    </div>
  );
}
