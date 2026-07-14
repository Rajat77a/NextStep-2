import { useState, useEffect } from 'react';
import TransitionLink from '@/components/shared/TransitionLink';
import { motion } from 'framer-motion';
import { Users, UserCheck, BookOpen, FileText, AlertTriangle, Plus, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getAdminDashboard,
  getClasses,
  getStudents,
  getReportCards,
  getSubjectGrades,
  getMySchool,
  getUserById,
} from '@/api/data';
import CountUp from '@/components/shared/CountUp';
import SparkleBurst from '@/components/shared/SparkleBurst';
import type { DashboardSummary, Class, Student } from '@/types';

const springEasing = [0.22, 1, 0.36, 1] as const;

function Shimmer({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-cream rounded ${className}`}>
      <div className="absolute inset-0 shimmer" />
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [schoolName, setSchoolName] = useState('');
  const [flagMap, setFlagMap] = useState<Record<string, string>>({});

  const getStudentFlag = async (studentId: string) => {
    try {
      const cards = await getReportCards({ studentId });

      if (!cards.length) {
        return 'green' as const;
      }

      const grades = await getSubjectGrades(cards[0].id);

      if (grades.some(g => g.flag === 'red')) return 'red';
      if (grades.some(g => g.flag === 'yellow')) return 'yellow';

      return 'green';
    } catch {
      return 'green';
    }
  };

  useEffect(() => {
    async function load() {
      if (!user) return;

      const [s, c, allStudents] = await Promise.all([
        getAdminDashboard(),
        getClasses(),
        getStudents(),
      ]);

      setSummary(s);
      setClasses(c);
      setStudents(allStudents);

      if (user.schoolId) {
        const school = await getMySchool();

        if (school) {
          setSchoolName(`${school.name} - ${school.boardType}`);
        }
      } else {
        setSchoolName('');
      }

      const flagEntries = await Promise.all(
        allStudents.map(async (student) => [
          student.id,
          await getStudentFlag(student.id),
        ] as [string, string])
      );

      setFlagMap(Object.fromEntries(flagEntries));

      const teacherIds = [...new Set(c.map(cls => cls.teacherId).filter(Boolean))];
      const nameMap: Record<string, string> = {};

      await Promise.all(teacherIds.map(async (teacherId) => {
        const teacher = await getUserById(teacherId);

        if (teacher) {
          nameMap[teacherId] = teacher.fullName;
        }
      }));

      setTeacherNames(nameMap);
    }

    load();
  }, [user]);

  const donutData = summary ? [
    {
      label: 'On Track',
      value: summary.flagDistribution.green,
      color: '#7A9B8A',
    },
    {
      label: 'Watch',
      value: summary.flagDistribution.yellow,
      color: '#D4A03A',
    },
    {
      label: 'Address',
      value: summary.flagDistribution.red,
      color: '#E85D3E',
    },
  ] : [];

  const total = donutData.reduce((a, d) => a + d.value, 0);

  if (!summary) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-12 py-8">
        <div className="space-y-4">
          <Shimmer className="h-8 w-1/3" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Shimmer key={i} className="h-24 rounded-2xl" />
            ))}
          </div>

          <Shimmer className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: springEasing,
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <h2 className="font-display text-2xl md:text-4xl text-charcoal">
            School Dashboard
          </h2>

          <div className="gradient-divider flex-1" />
        </div>

        <p className="font-body text-medium-gray mb-6">
          {schoolName || 'No school configured'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: springEasing,
          delay: 0.08,
        }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
      >
        {[
          {
            icon: <Users size={16} />,
            label: 'Students',
            value: summary.totalStudents,
          },
          {
            icon: <UserCheck size={16} />,
            label: 'Teachers',
            value: summary.totalTeachers || 0,
          },
          {
            icon: <BookOpen size={16} />,
            label: 'Classes',
            value: summary.totalClasses || 0,
          },
          {
            icon: <FileText size={16} />,
            label: 'Report Cards',
            value: summary.reportCardsThisTerm || 0,
          },
          {
            icon: <AlertTriangle size={16} />,
            label: 'Flagged',
            value: summary.flaggedStudents || 0,
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: 0.12 + index * 0.04,
            }}
            whileHover={{
              y: -3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            }}
            whileTap={{ scale: 0.97 }}
            className="bg-white rounded-2xl shadow-card p-5 transition-shadow duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-coral relative">
                {metric.icon}
                {metric.value > 0 && (
                  <SparkleBurst delay={600 + index * 100} count={3} />
                )}
              </span>

              <span className="label-text text-medium-gray">
                {metric.label}
              </span>
            </div>

            <p className="font-display text-3xl text-charcoal">
              <CountUp value={metric.value} />
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: springEasing,
            delay: 0.12,
          }}
          className="bg-white rounded-2xl shadow-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-display text-xl text-charcoal">
              Flag Distribution
            </h3>

            <div className="gradient-divider flex-1" />
          </div>

          <div className="flex items-center gap-8">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <motion.g
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    ease: springEasing,
                    delay: 0.2,
                  }}
                >
                  {total > 0 ? (() => {
                    let cumulativeAngle = 0;

                    return donutData.map((item, index) => {
                      const angle = (item.value / total) * 360;
                      const startAngle = cumulativeAngle;

                      cumulativeAngle += angle;

                      const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                      const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                      const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                      const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                      const largeArc = angle > 180 ? 1 : 0;

                      return (
                        <motion.path
                          key={item.label}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ scale: 1.06 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.25 + index * 0.1,
                          }}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={item.color}
                          style={{ transformOrigin: '50px 50px' }}
                        />
                      );
                    });
                  })() : (
                    <circle cx="50" cy="50" r="40" fill="#E8E3DE" />
                  )}
                </motion.g>

                <circle cx="50" cy="50" r="28" fill="white" />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display text-xl text-charcoal">
                    {total > 0
                      ? Math.round((summary.flagDistribution.green / total) * 100)
                      : 0}%
                  </p>

                  <p className="font-body text-[10px] text-medium-gray">
                    On Track
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {donutData.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.3 + index * 0.06,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    <span className="font-body text-sm text-charcoal">
                      {item.label}
                    </span>

                    <span className="font-body text-sm font-semibold text-charcoal ml-auto">
                      {item.value}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: springEasing,
            delay: 0.16,
          }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-display text-lg text-charcoal mb-4">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <motion.div whileTap={{ scale: 0.97 }}>
                <TransitionLink
                  to="/admin/students"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream/50 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <Plus size={16} className="text-coral group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />

                  <span className="font-body text-sm text-charcoal group-hover:text-coral transition-colors">
                    Add Students
                  </span>
                </TransitionLink>
              </motion.div>

              <motion.div whileTap={{ scale: 0.97 }}>
                <TransitionLink
                  to="/admin/teachers"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream/50 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <UserPlus size={16} className="text-coral group-hover:scale-110 transition-transform duration-300" />

                  <span className="font-body text-sm text-charcoal group-hover:text-coral transition-colors">
                    Invite Teacher
                  </span>
                </TransitionLink>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: springEasing,
          delay: 0.2,
        }}
        className="bg-white rounded-2xl shadow-card p-6 mt-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-display text-xl text-charcoal">
            Classes
          </h3>

          <div className="gradient-divider flex-1" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-gray">
                <th className="text-left py-3 px-4 label-text text-medium-gray">
                  Class
                </th>

                <th className="text-left py-3 px-4 label-text text-medium-gray">
                  Teacher
                </th>

                <th className="text-left py-3 px-4 label-text text-medium-gray">
                  Students
                </th>

                <th className="text-left py-3 px-4 label-text text-medium-gray">
                  Flags
                </th>
              </tr>
            </thead>

            <tbody>
              {classes.map((cls, index) => {
                const studentRows = students.filter(student => student.classId === cls.id);
                const flags = studentRows.filter(student => (
                  flagMap[student.id] === 'red' || flagMap[student.id] === 'yellow'
                ));

                return (
                  <motion.tr
                    key={cls.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{
                      duration: 0.35,
                      ease: springEasing,
                      delay: 0.3 + index * 0.04,
                    }}
                    className="border-b border-light-gray/50 hover:bg-cream/50 hover:shadow-sm transition-all duration-200"
                  >
                    <td className="py-3 px-4 font-body text-sm text-charcoal">
                      Grade {cls.grade}-{cls.section}
                    </td>

                    <td className="py-3 px-4 font-body text-sm text-medium-gray">
                      {teacherNames[cls.teacherId] || 'Not assigned'}
                    </td>

                    <td className="py-3 px-4 font-body text-sm text-charcoal">
                      {studentRows.length}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {flags.length > 0 ? (
                          flags.slice(0, 3).map(student => (
                            <span
                              key={student.id}
                              className={`w-2 h-2 rounded-full ${
                                flagMap[student.id] === 'red' ? 'bg-coral' : 'bg-amber'
                              }`}
                            />
                          ))
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-sage" />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
