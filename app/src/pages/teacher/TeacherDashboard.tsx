import { useState, useEffect } from 'react';
import TransitionLink from '@/components/shared/TransitionLink';
import { motion } from 'framer-motion';
import { Users, FileText, AlertTriangle, BarChart3, ArrowRight, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getTeacherDashboard, getStudents, getClasses, getTeacherNotes, addTeacherNote, getReportCards, getSubjectGrades } from '@/api/data';
import { supabase } from '@/lib/supabase';
import FlagBadge from '@/components/shared/FlagBadge';
import CountUp from '@/components/shared/CountUp';
import SparkleBurst from '@/components/shared/SparkleBurst';
import type { Student, SubjectGrade, TeacherNote, AIReportAnalysis } from '@/types';

const springEasing = [0.22, 1, 0.36, 1] as const;

function Shimmer({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-cream rounded ${className}`}>
      <div className="absolute inset-0 shimmer" />
    </div>
  );
}

type InviteStatus = 'none' | 'pending' | 'accepted';

export default function TeacherDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalStudents: 0,
    reportCardCount: 0,
    flaggedCount: 0,
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [classCount, setClassCount] = useState(0);
  const [flagMap, setFlagMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentGrades, setStudentGrades] = useState<SubjectGrade[]>([]);
  const [gradeTrends, setGradeTrends] = useState<Record<string, 'up' | 'down' | 'stable'>>({});
  const [studentNotes, setStudentNotes] = useState<TeacherNote[]>([]);
  const [noteText, setNoteText] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [quickNoteStudentId, setQuickNoteStudentId] = useState<string | null>(null);
  const [quickNoteText, setQuickNoteText] = useState('');

  const [inviteStatus, setInviteStatus] = useState<InviteStatus>(
    (user?.invitationStatus as InviteStatus) || 'none'
  );

  useEffect(() => {
    if (!user) return;
    setInviteStatus((user.invitationStatus as InviteStatus) || 'none');
  }, [user]);

  useEffect(() => {
    async function load() {
      if (!user || inviteStatus !== 'accepted') return;

      const [dashboardStats, allStudents, myClasses] = await Promise.all([
        getTeacherDashboard(),
        getStudents(),
        getClasses(),
      ]);
      setStats(dashboardStats);
      setClassCount(myClasses.length);
      const myClassIds = myClasses.map(c => c.id);
      const filtered = allStudents.filter(s => myClassIds.includes(s.classId));
      setStudents(filtered);

      // Batch precompute flags — one query for all students
      const flags: Record<string, string> = {};
      const studentIds = filtered.map(s => s.id);
      if (studentIds.length > 0) {
        const { data: allCards } = await supabase
          .from('report_cards')
          .select('student_id, ai_response')
          .in('student_id', studentIds)
          .order('created_at', { ascending: false });

        if (allCards) {
          const latestByStudent = new Map<string, typeof allCards[0]>();
          for (const card of allCards) {
            if (!latestByStudent.has(card.student_id)) {
              latestByStudent.set(card.student_id, card);
            }
          }
          for (const s of filtered) {
            const card = latestByStudent.get(s.id);
            if (!card?.ai_response) { flags[s.id] = 'green'; continue; }
            const analysis = card.ai_response as AIReportAnalysis;
            const subjects = analysis.subjects ?? [];
            if (subjects.some((g) => g.flag === 'red')) flags[s.id] = 'red';
            else if (subjects.some((g) => g.flag === 'yellow')) flags[s.id] = 'yellow';
            else flags[s.id] = 'green';
          }
        } else {
          filtered.forEach(s => { flags[s.id] = 'green'; });
        }
      }
      setFlagMap(flags);
    }

    load();
  }, [user, inviteStatus]);

  const acceptInvite = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ invitation_status: 'accepted' })
      .eq('id', user.id);

    if (!error) {
      setInviteStatus('accepted');
    }
  };

  const filteredStudents = students.filter((student) =>
    student.fullName.toLowerCase().includes(search.toLowerCase()) ||
    student.rollNumber.includes(search)
  );

  const openStudentPanel = async (student: Student) => {
    setSelectedStudent(student);

    const cards = await getReportCards({ studentId: student.id });
    if (cards.length > 0) {
      const grades = await getSubjectGrades(cards[0].id);
      setStudentGrades(grades);

      // Compute trends by comparing with previous report card
      if (cards.length > 1) {
        const prevGrades = await getSubjectGrades(cards[1].id);
        const trends: Record<string, 'up' | 'down' | 'stable'> = {};
        for (const g of grades) {
          const prev = prevGrades.find(p => p.subjectName === g.subjectName);
          if (!prev) { trends[g.subjectName] = 'stable'; continue; }
          const diff = g.normalizedScore - prev.normalizedScore;
          trends[g.subjectName] = diff > 5 ? 'up' : diff < -5 ? 'down' : 'stable';
        }
        setGradeTrends(trends);
      } else {
        setGradeTrends({});
      }
    }

    const notes = await getTeacherNotes(student.id);
    setStudentNotes(notes);
    setShowPanel(true);
  };

  const handleQuickNote = async () => {
    if (!quickNoteStudentId || !quickNoteText.trim()) return;
    try {
      await addTeacherNote({ studentId: quickNoteStudentId, note: quickNoteText });
      // Refresh notes for the student if the panel is already open
      if (selectedStudent?.id === quickNoteStudentId) {
        const notes = await getTeacherNotes(quickNoteStudentId);
        setStudentNotes(notes);
      }
      setQuickNoteStudentId(null);
      setQuickNoteText('');
    } catch {
      alert('Failed to save note.');
    }
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
      const firstFlag = flagMap[a.id] || 'green';
      const secondFlag = flagMap[b.id] || 'green';
      const rank = (f: string) => f === 'red' ? 2 : f === 'yellow' ? 1 : 0;
      return rank(secondFlag) - rank(firstFlag);
    })
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-12 py-6 md:py-8">
      {inviteStatus === 'pending' && user && (
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

          <motion.button
            onClick={acceptInvite}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="btn-text px-5 py-2.5 rounded-[10px] bg-coral text-white hover:bg-coral-dark hover:shadow-lg transition-all"
          >
            Accept Request
          </motion.button>
        </motion.div>
      )}

      {inviteStatus === 'none' && (
        <div className="bg-cream border border-light-gray rounded-2xl p-6">
          <p className="font-body text-medium-gray">
            No school invitation yet. Ask your school admin to send an invitation to your signup email.
          </p>
        </div>
      )}

      {inviteStatus === 'accepted' && (
        <>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: springEasing }}>
            <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-1">
              My Classes
            </h2>
            <p className="font-body text-medium-gray mb-6">
              Overview of your students and their progress
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: springEasing, delay: 0.08 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: <Users size={18} />, label: 'Total Students', value: stats.totalStudents },
                { icon: <FileText size={18} />, label: 'Report Cards', value: stats.reportCardCount },
                { icon: <AlertTriangle size={18} />, label: 'Flagged Students', value: stats.flaggedCount },
                { icon: <BarChart3 size={18} />, label: 'Classes', value: classCount },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.12 + index * 0.04 }}
                  whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white rounded-2xl shadow-card p-5 transition-shadow duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-coral relative">
                      {stat.icon}
                      <SparkleBurst delay={500 + index * 100} count={3} />
                    </span>
                    <span className="label-text text-medium-gray">{stat.label}</span>
                  </div>
                  <p className="font-display text-3xl text-charcoal">
                    <CountUp value={stat.value} />
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Flagged students banner */}
          {stats.flaggedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="bg-amber/[0.06] border border-amber/20 rounded-2xl p-4 mb-6 flex items-center gap-3"
            >
              <AlertTriangle size={18} className="text-amber shrink-0" />
              <p className="font-body text-sm text-charcoal">
                <span className="font-semibold">{stats.flaggedCount}</span> student{stats.flaggedCount !== 1 ? 's' : ''} flagged —{' '}
                <span
                  onClick={() => {
                    const el = document.getElementById('student-table');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-coral underline cursor-pointer hover:no-underline"
                >
                  Review now
                </span>
              </p>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: springEasing, delay: 0.14 }} className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-xl text-charcoal">Students</h3>
                  <div className="gradient-divider w-12" />
                </div>
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

              <div className="overflow-x-auto" id="student-table">
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
                      const flag = flagMap[student.id] || 'green';

                      return (
                        <motion.tr
                          key={student.id}
                          onClick={() => openStudentPanel(student)}
                          whileTap={{ scale: 0.99 }}
                          className={`border-b border-light-gray/50 cursor-pointer hover:bg-cream/50 hover:shadow-sm transition-all duration-200 ${
                            flag === 'red' ? 'bg-coral/[0.02]' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setQuickNoteStudentId(student.id); setQuickNoteText(''); }}
                                className="w-6 h-6 rounded-full bg-cream hover:bg-coral/10 hover:text-coral flex items-center justify-center text-xs text-medium-gray transition-colors"
                                title="Quick note"
                              >
                                +
                              </button>
                              <span className="font-body text-sm text-charcoal">{student.fullName}</span>
                            </div>
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
                            <FlagBadge flag={flag || 'green'} size="sm" />
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: springEasing, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-display text-xl text-charcoal">
                  Students to Watch
                </h3>
                <div className="gradient-divider flex-1" />
              </div>

              <div className="space-y-3">
                {watchList.map((student) => {
                  const flag = flagMap[student.id];

                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => openStudentPanel(student)}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-cream/50 hover:shadow-sm cursor-pointer transition-all duration-200"
                    >
                      <div>
                        <p className="font-body font-medium text-sm text-charcoal">
                          {student.fullName}
                        </p>
                        <p className="font-body text-xs text-medium-gray">
                          Roll {student.rollNumber}
                        </p>
                      </div>

                      {flag === 'red' ? (
                        <motion.span
                          animate={{ opacity: [0.7, 1, 0.7], scale: [0.95, 1.05, 0.95] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ display: 'inline-block' }}
                        >
                          <FlagBadge flag={flag} size="sm" />
                        </motion.span>
                      ) : (
                        <FlagBadge flag={flag} size="sm" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <motion.div whileTap={{ scale: 0.96 }}>
                <TransitionLink
                  to="/teacher/patterns"
                  className="inline-flex items-center gap-1.5 text-coral font-body text-sm font-semibold mt-4 px-3 py-1.5 rounded-lg hover:bg-coral/10 transition-colors group"
                >
                  View class patterns <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </TransitionLink>
              </motion.div>
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

                    <motion.button
                      onClick={() => setShowPanel(false)}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-full bg-cream flex items-center justify-center hover:bg-light-gray transition-colors text-lg"
                    >
                      ×
                    </motion.button>
                  </div>

                  <div className="space-y-3 mb-6">
                    {studentGrades.map((grade) => {
                      const trend = gradeTrends[grade.subjectName];
                      return (
                        <div
                          key={grade.id}
                          className="flex items-center justify-between p-3 bg-cream rounded-xl"
                        >
                          <span className="font-body text-sm text-charcoal flex items-center gap-1.5">
                            {trend === 'up' && <span className="text-sage text-xs" title="Improved">▲</span>}
                            {trend === 'down' && <span className="text-coral text-xs" title="Declined">▼</span>}
                            {trend === 'stable' && <span className="text-medium-gray text-xs" title="Stable">●</span>}
                            {grade.subjectName}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="font-body text-sm text-medium-gray">
                              {grade.grade}
                            </span>
                            <FlagBadge flag={grade.flag} size="sm" />
                          </div>
                        </div>
                      );
                    })}
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

                      <motion.button
                        onClick={handleAddNote}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg bg-coral text-white font-body text-sm hover:bg-coral-dark transition-all"
                      >
                        Add
                      </motion.button>
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

          {/* Quick Note Dialog */}
          {quickNoteStudentId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm"
                onClick={() => setQuickNoteStudentId(null)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white rounded-2xl shadow-modal p-6 w-full max-w-sm"
              >
                <h4 className="font-display text-lg text-charcoal mb-4">
                  Quick Note
                </h4>
                <p className="font-body text-sm text-medium-gray mb-3">
                  {students.find(s => s.id === quickNoteStudentId)?.fullName}
                </p>
                <textarea
                  value={quickNoteText}
                  onChange={(e) => setQuickNoteText(e.target.value)}
                  placeholder="Type your note..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-[10px] border border-light-gray bg-cream font-body text-sm focus:border-coral outline-none resize-none mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setQuickNoteStudentId(null)}
                    className="flex-1 py-2.5 rounded-[10px] border border-light-gray font-body text-sm text-charcoal hover:bg-cream transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQuickNote}
                    disabled={!quickNoteText.trim()}
                    className="flex-1 py-2.5 rounded-[10px] bg-coral text-white font-body text-sm hover:bg-coral-dark transition-all disabled:opacity-50"
                  >
                    Save Note
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
