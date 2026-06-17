import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ParentSettings from '@/pages/parent/ParentSettings';

export default function TeacherSettings() {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-5 md:px-12 py-6">
        <Link to="/teacher" className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </motion.div>
      <ParentSettings />
    </div>
  );
}
