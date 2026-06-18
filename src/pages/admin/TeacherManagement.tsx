import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Check, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/api/storage';
import type { User, Class } from '@/types';

export default function TeacherManagement() {
  const { user } = useAuth();

  const [teachers, setTeachers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!user?.schoolId) return;

    loadTeachers();
    loadClasses();
  }, [user]);

  const loadClasses = () => {
    if (!user?.schoolId) return;

    const classList = storage.getClasses().filter((classItem) => {
      return classItem.schoolId === user.schoolId;
    });

    setClasses(classList);
  };

  const loadTeachers = () => {
    if (!user?.schoolId) return;

    const teacherList = storage.getUsers().filter((teacher) => {
      return teacher.role === 'teacher' && teacher.schoolId === user.schoolId;
    });

    setTeachers(teacherList);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.schoolId) return;

    const users = storage.getUsers();
    const { hashPassword } = await import('@/lib/crypto');

    const existingTeacherIndex = users.findIndex((existingUser) => {
      return (
        existingUser.email.toLowerCase() === email.toLowerCase() &&
        existingUser.role === 'teacher'
      );
    });

    if (existingTeacherIndex !== -1) {
      users[existingTeacherIndex] = {
        ...users[existingTeacherIndex],
        fullName: name,
        schoolId: user.schoolId,
        invitationStatus: 'pending',
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newTeacher: User = {
        id: crypto.randomUUID(),
        email,
        passwordHash: await hashPassword('welcome123'),
        fullName: name,
        role: 'teacher',
        schoolId: user.schoolId,
        invitationStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: null,
        isActive: true,
      };

      users.push(newTeacher);
    }

    storage.setUsers(users);

    loadTeachers();
    setShowModal(false);
    setName('');
    setEmail('');
  };

  const getTeacherClasses = (teacherId: string) => {
    return classes.filter((classItem) => classItem.teacherId === teacherId);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/admin"
          className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-4xl text-charcoal">
            Teachers
          </h2>

          <button
            onClick={() => setShowModal(true)}
            className="btn-text px-5 py-2.5 rounded-[10px] bg-coral text-white hover:bg-coral-dark transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} /> Invite Teacher
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-light-gray">
                <th className="text-left py-3 px-4 label-text text-charcoal/60">
                  Name
                </th>
                <th className="text-left py-3 px-4 label-text text-charcoal/60">
                  Email
                </th>
                <th className="text-left py-3 px-4 label-text text-charcoal/60">
                  Classes
                </th>
                <th className="text-left py-3 px-4 label-text text-charcoal/60">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {teachers.map((teacher) => {
                const teacherClasses = getTeacherClasses(teacher.id);
                const accepted = teacher.invitationStatus === 'accepted';

                return (
                  <tr
                    key={teacher.id}
                    className="border-b border-light-gray/50 hover:bg-cream/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-body text-sm text-charcoal">
                      {teacher.fullName}
                    </td>

                    <td className="py-3 px-4 font-body text-sm text-medium-gray">
                      {teacher.email}
                    </td>

                    <td className="py-3 px-4 font-body text-sm text-medium-gray">
                      {teacherClasses.length > 0
                        ? teacherClasses
                            .map((classItem) => `Grade ${classItem.grade}-${classItem.section}`)
                            .join(', ')
                        : 'Not assigned'}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body text-[10px] font-semibold ${
                          accepted ? 'bg-sage/10 text-sage' : 'bg-amber/10 text-amber'
                        }`}
                      >
                        {accepted ? (
                          <>
                            <Check size={10} /> Accepted
                          </>
                        ) : (
                          <>
                            <Clock size={10} /> Request sent
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {teachers.length === 0 && (
          <div className="text-center py-10">
            <p className="font-body text-medium-gray">
              No teachers yet. Invite your first teacher.
            </p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-modal p-8 w-full max-w-md"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream flex items-center justify-center hover:bg-light-gray"
              >
                <X size={14} />
              </button>

              <h3 className="font-display text-2xl text-charcoal mb-6">
                Invite Teacher
              </h3>

              <form onSubmit={handleInvite} className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Teacher Name"
                  className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none"
                  required
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none"
                  required
                />

                <p className="font-body text-xs text-medium-gray">
                  A request will appear in the teacher portal. The teacher must accept it before class assignment.
                </p>

                <button
                  type="submit"
                  className="w-full py-3 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all"
                >
                  Send Request
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
