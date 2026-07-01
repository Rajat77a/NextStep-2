import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Users, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getClasses, createClass, createSchool, getUserById } from '@/api/data';
import { storage } from '@/api/storage';
import type { Class, User } from '@/types';

export default function ClassManagement() {
  const { user } = useAuth();

  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [grade, setGrade] = useState(1);
  const [section, setSection] = useState('A');
  const [teacherId, setTeacherId] = useState('');

  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, [user]);

  const loadClasses = async () => {
    const allClasses = await getClasses();
    setClasses(allClasses);
  };

  const loadTeachers = () => {
    const users = storage.getUsers();

    const currentAdmin = users.find((storedUser) => storedUser.id === user?.id);
    const currentSchoolId = currentAdmin?.schoolId || user?.schoolId;

    const allClasses = storage.getClasses();

    const alreadyAssignedTeacherIds = new Set(
      allClasses
        .map((classItem) => classItem.teacherId)
        .filter(Boolean)
    );

    const acceptedTeachersForSchool = users.filter((teacher) => {
      return (
        teacher.role === 'teacher' &&
        teacher.invitationStatus === 'accepted' &&
        teacher.schoolId === currentSchoolId &&
        !alreadyAssignedTeacherIds.has(teacher.id)
      );
    });

    setTeachers(acceptedTeachersForSchool);
  };

  const resetForm = () => {
    setGrade(1);
    setSection('A');
    setTeacherId('');
    setError('');
    setCreating(false);
  };

  const openModal = () => {
    resetForm();
    loadTeachers();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setCreating(true);

    try {
      if (!section.trim()) {
        throw new Error('Section is required.');
      }

      if (!user?.schoolId) {
        await createSchool({
          name: 'My School',
          boardType: 'CBSE',
        });
      }

      await createClass({
        grade,
        section: section.trim().toUpperCase(),
        teacherId,
      });

      closeModal();
      await loadClasses();
      loadTeachers();
    } catch (err: any) {
      setError(err?.message || 'Unable to create class. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getClassStats = (classId: string) => {
    const students = storage.getStudents().filter((student) => student.classId === classId);
    const reports = storage.getReportCards().filter((report) => report.classId === classId);

    return {
      studentCount: students.length,
      reportCount: reports.length,
    };
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
            Classes & Sections
          </h2>

          <button
            onClick={openModal}
            className="btn-text px-5 py-2.5 rounded-[10px] bg-coral text-white hover:bg-coral-dark transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} /> Add Class
          </button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem, index) => {
          const stats = getClassStats(classItem.id);
          const teacher = getUserById(classItem.teacherId);

          return (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="bg-white rounded-2xl shadow-card p-6"
            >
              <h3 className="font-display text-xl text-charcoal mb-1">
                Grade {classItem.grade}
              </h3>

              <p className="label-text text-medium-gray mb-4">
                Section {classItem.section}
              </p>

              <p className="font-body text-sm text-medium-gray mb-4">
                Teacher: {teacher?.fullName || 'Not assigned'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cream rounded-xl p-3 text-center">
                  <Users size={14} className="mx-auto text-coral mb-1" />
                  <p className="font-display text-lg text-charcoal">
                    {stats.studentCount}
                  </p>
                  <p className="font-body text-[10px] text-medium-gray">
                    Students
                  </p>
                </div>

                <div className="bg-cream rounded-xl p-3 text-center">
                  <FileText size={14} className="mx-auto text-coral mb-1" />
                  <p className="font-display text-lg text-charcoal">
                    {stats.reportCount}
                  </p>
                  <p className="font-body text-[10px] text-medium-gray">
                    Reports
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

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
              onClick={closeModal}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-modal p-8 w-full max-w-md"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream flex items-center justify-center hover:bg-light-gray transition-colors"
              >
                <X size={14} />
              </button>

              <h3 className="font-display text-2xl text-charcoal mb-6">
                Add New Class
              </h3>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
                    Grade
                  </label>

                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none"
                  >
                    {Array.from({ length: 12 }, (_, index) => index + 1).map((gradeNumber) => (
                      <option key={gradeNumber} value={gradeNumber}>
                        Grade {gradeNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
                    Section
                  </label>

                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                    maxLength={2}
                    className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
                    Assign class teacher
                  </label>

                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none"
                  >
                    <option value="">No teacher assigned</option>

                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.fullName} - {teacher.email}
                      </option>
                    ))}
                  </select>

                  {teachers.length === 0 && (
                    <p className="font-body text-xs text-medium-gray mt-2">
                      No available accepted teachers. Invite a teacher, let them accept, or unassign a teacher from another class.
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-[10px] border border-coral/25 bg-coral/10 px-4 py-3 font-body text-sm text-coral">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {creating ? 'Creating Class...' : 'Create Class'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
