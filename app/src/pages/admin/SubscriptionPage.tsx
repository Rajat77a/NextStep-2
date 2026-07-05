import TransitionLink from '@/components/shared/TransitionLink';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
export default function SubscriptionPage() {

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <TransitionLink to="/admin" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Dashboard
        </TransitionLink>
        <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-6">Subscription</h2>
      </motion.div>

      {/* Current Plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-card p-8 mb-6 border-t-[3px] border-coral">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-coral" />
          <span className="label-text text-coral">CURRENT PLAN</span>
        </div>
        <h3 className="font-display text-2xl text-charcoal mb-1">School Premium</h3>
        <p className="font-display text-4xl text-coral mb-6">₹4,999<span className="font-body text-base text-medium-gray">/month</span></p>
        <ul className="space-y-3 mb-6">
          {[
            'Up to 250 students',
            'Unlimited report cards',
            'All AI features (Clarity Check, Conversation Guide, 30-Day Plan)',
            'Class-wide pattern analysis',
            'Bulk upload tools',
            'Priority support',
            'Data export',
          ].map(f => (
            <li key={f} className="flex items-center gap-3">
              <Check size={16} className="text-sage flex-shrink-0" />
              <span className="font-body text-sm text-charcoal/80">{f}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-[10px] border border-charcoal text-charcoal font-body font-semibold text-sm hover:bg-charcoal hover:text-cream transition-all">Manage Billing</button>
          <button className="px-6 py-3 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all">Upgrade Plan</button>
        </div>
      </motion.div>

      {/* Usage */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-display text-lg text-charcoal mb-4">Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-body text-charcoal">Students</span>
              <span className="font-body text-medium-gray">45 of 250 seats</span>
            </div>
            <div className="h-3 bg-light-gray rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '18%' }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-coral rounded-full" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-body text-charcoal">Report Cards This Term</span>
              <span className="font-body text-medium-gray">90 uploaded</span>
            </div>
            <div className="h-3 bg-light-gray rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-sage rounded-full" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
