import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, AlertTriangle, BarChart3, ArrowRight, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTeacherDashboard, getStudents, getTeacherNotes, addTeacherNote } from '@/api/data';
import { storage } from '@/api/storage';
import FlagBadge from '@/components/shared/FlagBadge';
import type { Student, SubjectGrade, TeacherNote } from '@/types';

export default function TeacherDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalStudents: 0,
    reportCardCount: 0,
    flaggedCount: 0,
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentGrades, setStudentGrades] = useState<SubjectGrade[]>([]);
  const [studentNotes, setStudentNotes] = useState<TeacherNote[]>([]);
  const [noteText, setNoteText] = useState('');
  const [showPanel, setShowPanel] = useState(false);

  const [inviteAccepted, setInviteAccepted] = useState(
    user?.invitationStatus === 'accepted'
  );

  useEffect(() => {
    if (!user) return;
    setInviteAccepted(user.invitationStatus === 'accepted');
  }, [user]);

  useEffect(() => {
    async function load() {
      if (!user || !inviteAccepted) return;

      const dashboardStats = await getTeacherDashboard();
      setStats(dashboardStats);

      const teacherStudents = await getStudents();
      setStudents(teacherStudents);
    }

    load();
  }, [user, inviteAccepted]);

  const acceptInvite = () => {
    if (!user) return;

    const users = storage.getUsers();
    const index = users.findIndex((storedUser) => storedUser.id === user.id);

    if (index === -1) return;

    users[index] = {
      ...users[index],
      invitationStatus: 'accepted',
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    storage.setUsers(users);
    setInviteAccepted(true);
  };

  const filteredStudents = students.filter((student) =>
    student.fullName.toLowerCase().includes(search.toLowerCase()) ||
    student.rollNumber.includes(search)
  );

  const getStudentFlag = (studentId: string) => {
    const cards = storage.getReportCards().filter((report) => report.studentId === studentId);

    if (!cards.length) return 'green' as const;

    const latest = cards.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    const grades = storage.getSubjectGrades().filter(
      (grade) => grade.reportCardId === latest.id
    );

    if (grades.some((grade) => grade.flag === 'red')) return 'red';
    if (grades.some((grade) => grade.flag === 'yellow')) return 'yellow';

    return 'green';
  };

  const openStudentPanel = async (student: Student) => {
    setSelectedStudent(student);

    const cards = storage.getReportCards().filter((report) => report.studentId === student.id);

    if (cards.length > 0) {
      const latest = cards.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      setStudentGrades(
        storage.getSubjectGrades().filter((grade) => grade.reportCardId === latest.id)
      );
    }

    const notes = await getTeacherNotes(student.id);
    setStudentNotes(notes);
    setShowPanel(true);
  };

  const handleAddNote = async () => {
    if (!selectedStudent || !noteText.trim()) return;

    await addTeacherNote({
      studentId: selectedStudent.id,
      note: noteText,
    });

    const notes = await getTeacherNotes(selectedStudent.id);
    setStudentNotes(notes);
    setNoteText('');
  };

  const watchList = [...students]
    .sort((a, b) => {
      const firstFlag = getStudentFlag(a.id) === 'red' ? 2 : getStudentFlag(a.id) === 'yellow' ? 1 : 0;
      const secondFlag = getStudentFlag(b.id) === 'red' ? 2 : getStudentFlag(b.id) === 'yellow' ? 1 : 0;

      return secondFlag - firstFlag;
    })
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-12 py-6 md:py-8">
      {!inviteAccepted && user && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-6 mb-8"
        >
          <p className="label-text text-coral mb-2">School request</p>

          <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-3">
            Accept your teacher portal invite
          </h2>

          <p className="font-body text-medium-gray mb-5">
            A school admin has invited you to join their teacher portal. Accept the request to become available for class assignment.
          </p>

          <button
            onClick={acceptInvite}
            className="btn-text px-5 py-2.5 rounded-[10px] bg-coral text-white hover:bg-coral-dark transition-all"
          >
            Accept Request
          </button>
        </motion.div>
      )}

      {!inviteAccepted && (
        <div className="bg-cream border border-light-gray rounded-2xl p-6">
          <p className="font-body text-medium-gray">
            Your teacher dashboard will appear after you accept the school request.
          </p>
        </div>
      )}

      {inviteAccepted && (
        <>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-1">
              My Classes
            </h2>
            <p className="font-body text-medium-gray mb-6">
              Overview of your students and their progress
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { icon: <Users size={18} />, label: 'Total Students', value: stats.totalStudents },
              { icon: <FileText size={18} />, label: 'Report Cards', value: stats.reportCardCount },
              { icon: <AlertTriangle size={18} />, label: 'Flagged Students', value: stats.flaggedCount },
              { icon: <BarChart3 size={18} />, label: 'Classes', value: user ? 1 : 0 },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-coral">{stat.icon}</span>
                  <span className="label-text text-medium-gray">{stat.label}</span>
                </div>
                <p className="font-display text-3xl text-charcoal">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-card p-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h3 className="font-display text-xl text-charcoal">Students</h3>

                <div className="relative w-full sm:w-56">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-medium-gray" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search students..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-light-gray">
                      <th className="text-left py-3 px-4 label-text text-medium-gray">Name</th>
                      <th className="text-left py-3 px-4 label-text text-medium-gray">Roll No</th>
                      <th className="text-left py-3 px-4 label-text text-medium-gray">Status</th>
                      <th className="text-left py-3 px-4 label-text text-medium-gray">Flag</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((student) => {
                      const flag = getStudentFlag(student.id);

                      return (
                        <tr
                          key={student.id}
                          onClick={() => openStudentPanel(student)}
                          className={`border-b border-light-gray/50 cursor-pointer hover:bg-cream/50 transition-colors ${
                            flag === 'red' ? 'bg-coral/[0.02]' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-body text-sm text-charcoal">
                            {student.fullName}
                          </td>

                          <td className="py-3 px-4 font-body text-sm text-medium-gray">
                            {student.rollNumber}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`w-2 h-2 rounded-full inline-block ${
                                flag === 'red'
                                  ? 'bg-coral'
                                  : flag === 'yellow'
                                    ? 'bg-amber'
                                    : 'bg-sage'
                              }`}
                            />
                          </td>

                          <td className="py-3 px-4">
                            <FlagBadge flag={flag} size="sm" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-card p-6"
            >
              <h3 className="font-display text-xl text-charcoal mb-4">
                Students to Watch
              </h3>

              <div className="space-y-3">
                {watchList.map((student) => {
                  const flag = getStudentFlag(student.id);

                  return (
                    <div
                      key={student.id}
                      onClick={() => openStudentPanel(student)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-cream/50 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-body font-medium text-sm text-charcoal">
                          {student.fullName}
                        </p>
                        <p className="font-body text-xs text-medium-gray">
                          Roll {student.rollNumber}
                        </p>
                      </div>

                      <FlagBadge flag={flag} size="sm" />
                    </div>
                  );
                })}
              </div>

              <Link
                to="/teacher/patterns"
                className="flex items-center gap-1 text-coral font-body text-sm font-semibold mt-4 hover:underline"
              >
                View class patterns <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>

          {showPanel && selectedStudent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex justify-end"
            >
              <div
                className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm"
                onClick={() => setShowPanel(false)}
              />

              <motion.div
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-[400px] bg-white h-full overflow-y-auto shadow-modal"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display text-xl text-charcoal">
                        {selectedStudent.fullName}
                      </h3>
                      <p className="font-body text-sm text-medium-gray">
                        Roll {selectedStudent.rollNumber}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowPanel(false)}
                      className="w-8 h-8 rounded-full bg-cream flex items-center justify-center hover:bg-light-gray transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    {studentGrades.map((grade) => (
                      <div
                        key={grade.id}
                        className="flex items-center justify-between p-3 bg-cream rounded-xl"
                      >
                        <span className="font-body text-sm text-charcoal">
                          {grade.subjectName}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="font-body text-sm text-medium-gray">
                            {grade.grade}
                          </span>
                          <FlagBadge flag={grade.flag} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <h4 className="font-body font-semibold text-sm text-charcoal mb-3">
                      My Notes
                    </h4>

                    {studentNotes.map((note) => (
                      <div key={note.id} className="bg-cream rounded-lg p-3 mb-2">
                        <p className="font-body text-sm text-charcoal">
                          {note.note}
                        </p>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(event) => setNoteText(event.target.value)}
                        placeholder="Add a note..."
                        className="flex-1 px-3 py-2 rounded-lg border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none"
                        onKeyDown={(event) => event.key === 'Enter' && handleAddNote()}
                      />

                      <button
                        onClick={handleAddNote}
                        className="px-4 py-2 rounded-lg bg-coral text-white font-body text-sm hover:bg-coral-dark transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber/[0.06] rounded-lg p-3">
                    <p className="font-body text-xs text-medium-gray italic">
                      Parent insights are private. You can see class-level patterns only.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
