import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserCheck, BookOpen, FileText, AlertTriangle, Plus, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getAdminDashboard, getClasses, getUserById } from '@/api/data';
import { storage } from '@/api/storage';
import type { DashboardSummary, Class } from '@/types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const s = await getAdminDashboard();
      setSummary(s);
      const c = await getClasses();
      setClasses(c);
    }
    load();
  }, [user]);

  const donutData = summary ? [
    { label: 'On Track', value: summary.flagDistribution.green, color: '#7A9B8A' },
    { label: 'Watch', value: summary.flagDistribution.yellow, color: '#D4A03A' },
    { label: 'Address', value: summary.flagDistribution.red, color: '#E85D3E' },
  ] : [];

  const total = donutData.reduce((a, d) => a + d.value, 0);
  let cumulativeAngle = 0;

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-1">School Dashboard</h2>
        <p className="font-body text-medium-gray mb-6">{user?.schoolId ? 'Greenfield Academy — CBSE' : 'No school configured'}</p>
      </motion.div>

      {/* Metrics */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { icon: <Users size={16} />, label: 'Students', value: summary?.totalStudents || 0 },
          { icon: <UserCheck size={16} />, label: 'Teachers', value: summary?.totalTeachers || 0 },
          { icon: <BookOpen size={16} />, label: 'Classes', value: summary?.totalClasses || 0 },
          { icon: <FileText size={16} />, label: 'Report Cards', value: summary?.reportCardsThisTerm || 0 },
          { icon: <AlertTriangle size={16} />, label: 'Flagged', value: summary?.flaggedStudents || 0 },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-coral">{s.icon}</span>
              <span className="label-text text-medium-gray">{s.label}</span>
            </div>
            <p className="font-display text-3xl text-charcoal">{s.value}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* Flag Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-display text-xl text-charcoal mb-4">Flag Distribution</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {total > 0 ? donutData.map((d, i) => {
                  const angle = (d.value / total) * 360;
                  const startAngle = cumulativeAngle;
                  cumulativeAngle += angle;
                  const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                  const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                  const largeArc = angle > 180 ? 1 : 0;
                  return (
                    <path
                      key={i}
                      d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={d.color}
                    />
                  );
                }) : <circle cx="50" cy="50" r="40" fill="#E8E3DE" />}
                <circle cx="50" cy="50" r="28" fill="white" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display text-xl text-charcoal">{total > 0 ? Math.round((summary!.flagDistribution.green / total) * 100) : 0}%</p>
                  <p className="font-body text-[10px] text-medium-gray">On Track</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {donutData.map(d => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="font-body text-sm text-charcoal">{d.label}</span>
                  <span className="font-body text-sm font-semibold text-charcoal ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-display text-lg text-charcoal mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/admin/students" className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream/50 transition-colors group">
                <Plus size={16} className="text-coral" />
                <span className="font-body text-sm text-charcoal group-hover:text-coral transition-colors">Add Students</span>
              </Link>
              <Link to="/admin/teachers" className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream/50 transition-colors group">
                <UserPlus size={16} className="text-coral" />
                <span className="font-body text-sm text-charcoal group-hover:text-coral transition-colors">Invite Teacher</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Classes Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-card p-6 mt-6">
        <h3 className="font-display text-xl text-charcoal mb-4">Classes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-gray">
                <th className="text-left py-3 px-4 label-text text-medium-gray">Class</th>
                <th className="text-left py-3 px-4 label-text text-medium-gray">Teacher</th>
                <th className="text-left py-3 px-4 label-text text-medium-gray">Students</th>
                <th className="text-left py-3 px-4 label-text text-medium-gray">Flags</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(cls => {
                const students = storage.getStudents().filter(s => s.classId === cls.id);
                const teacher = getUserById(cls.teacherId);
                return (
                  <tr key={cls.id} className="border-b border-light-gray/50">
                    <td className="py-3 px-4 font-body text-sm text-charcoal">Grade {cls.grade}-{cls.section}</td>
                    <td className="py-3 px-4 font-body text-sm text-medium-gray">{teacher?.fullName || 'Not assigned'}</td>
                    <td className="py-3 px-4 font-body text-sm text-charcoal">{students.length}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => {
                          const colors = ['bg-sage', 'bg-amber', 'bg-coral'];
                          return <span key={i} className={`w-2 h-2 rounded-full ${colors[i]}`} />;
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
