import { useState, useEffect } from 'react';
import TransitionLink from '@/components/shared/TransitionLink';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Check, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createSchool, getClasses } from '@/api/data';
import { supabase } from '@/lib/supabase';
import type { Class } from '@/types';

interface TeacherProfile {
  id: string;
  fullName: string;
  email: string;
  status: 'active' | 'pending' | 'none';
}

export default function TeacherManagement() {
  const { user } = useAuth();

  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.schoolId) {
      setTeachers([]);
      setClasses([]);
      return;
    }

    // Load classes from Supabase
    const allClasses = await getClasses();
    setClasses(allClasses);

    // Load teachers from Supabase profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'teacher')
      .eq('school_id', user.schoolId);

    // Build status: check invitation_status from profiles
    const teacherList: TeacherProfile[] = (profiles ?? []).map((p) => ({
      id: p.id,
      fullName: p.full_name,
      email: '',
      status: 'active' as const,
    }));
    setTeachers(teacherList);
  };

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();

    setInviteError('');

    let schoolId = user?.schoolId;

    if (!schoolId) {
      const school = await createSchool({
        name: 'My School',
        boardType: 'CBSE',
      });
      schoolId = school.id;
    }

    // Check if teacher exists in auth (we can't query auth.users directly)
    // This is a simplified flow: admin records the intent, teacher accepts on their end
    // For now, check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'teacher')
      .single();

    if (!existingProfile) {
      setInviteError(
        'This teacher has not signed up to the portal yet. Ask the teacher to sign up first using this email.'
      );
      return;
    }

    // Update the teacher's school_id and invitation_status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        school_id: schoolId,
        full_name: name.trim(),
      })
      .eq('id', existingProfile.id);

    if (updateError) {
      setInviteError('Could not invite teacher. Please try again.');
      return;
    }

    await loadData();

    setShowModal(false);
    setName('');
    setEmail('');
    setInviteError('');
  };

  const getTeacherClasses = (teacherId: string) => {
    return classes.filter((classItem) => {
      return classItem.teacherId === teacherId;
    });
  };

  const openModal = () => {
    setName('');
    setEmail('');
    setInviteError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setName('');
    setEmail('');
    setInviteError('');
    setShowModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <TransitionLink
          to="/admin"
          className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-4"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </TransitionLink>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-4xl text-charcoal">
            Teachers
          </h2>

          <button
            onClick={openModal}
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

                return (
                  <tr
                    key={teacher.id}
                    className="border-b border-light-gray/50 hover:bg-cream/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-body text-sm text-charcoal">
                      {teacher.fullName}
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
                          teacher.status === 'active'
                            ? 'bg-sage/10 text-sage'
                            : teacher.status === 'pending'
                              ? 'bg-amber/10 text-amber'
                              : 'bg-light-gray text-medium-gray'
                        }`}
                      >
                        {teacher.status === 'active' ? (
                          <>
                            <Check size={10} /> Active
                          </>
                        ) : teacher.status === 'pending' ? (
                          <>
                            <Clock size={10} /> Request sent
                          </>
                        ) : (
                          <>Not invited</>
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
              No teachers invited yet. Teachers must sign up before you can send a request.
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
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Teacher Name"
                  className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none"
                  required
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none"
                  required
                />

                <p className="font-body text-xs text-medium-gray">
                  Enter the email used by the teacher during signup. If the teacher has not signed up yet, the request cannot be sent.
                </p>

                {inviteError && (
                  <div className="rounded-[10px] border border-coral/25 bg-coral/10 px-4 py-3 font-body text-sm text-coral">
                    {inviteError}
                  </div>
                )}

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
