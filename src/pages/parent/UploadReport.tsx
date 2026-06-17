import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Check, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getStudents, uploadReportCard, addSubjectGrades } from '@/api/data';
import type { Student, BoardType, SubjectGrade } from '@/types';

const boards: BoardType[] = ['CBSE', 'ICSE', 'IGCSE', 'State', 'Other'];

function generateMockGr(_studentName: string, board: string): SubjectGrade[] {
  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'];
  const gradeOpts = board === 'CBSE'
    ? [{ g: 'A1', s: 95 }, { g: 'A2', s: 85 }, { g: 'B1', s: 75 }, { g: 'B2', s: 65 }, { g: 'C1', s: 55 }, { g: 'C2', s: 45 }]
    : board === 'ICSE'
    ? [{ g: '90', s: 90 }, { g: '82', s: 82 }, { g: '75', s: 75 }, { g: '68', s: 68 }, { g: '55', s: 55 }, { g: '48', s: 48 }]
    : [{ g: 'A', s: 88 }, { g: 'B', s: 76 }, { g: 'B', s: 72 }, { g: 'C', s: 62 }, { g: 'C', s: 55 }, { g: 'D', s: 42 }];

  const comments = [
    'Good effort. Keep practicing regularly.',
    'Shows improvement. Needs more focus in class.',
    'Consistent performance. Well done!',
    'Can do better with more revision.',
    'Excellent participation in class discussions.',
    'Needs to complete homework on time.',
  ];

  return subjects.map(subject => {
    const gr = gradeOpts[Math.floor(Math.random() * gradeOpts.length)];
    const flag = gr.s >= 70 ? 'green' : gr.s >= 50 ? 'yellow' : 'red';
    const aiNote = flag === 'green'
      ? `This is a solid performance in ${subject}. The grade suggests good understanding and consistent effort.`
      : flag === 'yellow'
      ? `This grade in ${subject} suggests some areas where additional practice could help. This may indicate a need for more regular revision — worth checking with the teacher about.`
      : `This grade in ${subject} is below expectations. This may indicate a need for additional support — worth checking with the teacher about specific areas of difficulty.`;

    return {
      id: crypto.randomUUID(),
      reportCardId: '',
      subjectName: subject,
      grade: gr.g,
      normalizedScore: gr.s,
      teacherComment: comments[Math.floor(Math.random() * comments.length)],
      flag: flag as 'green' | 'yellow' | 'red',
      aiNote,
      createdAt: new Date().toISOString(),
    };
  });
}

export default function UploadReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [board, setBoard] = useState<BoardType>('CBSE');
  const [selectedChild, setSelectedChild] = useState('');
  const [children, setChildren] = useState<Student[]>([]);
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useState(() => {
    getStudents({ parentId: user?.id }).then(setChildren);
  });

  useState(() => {
    if (children.length > 0 && !selectedChild) setSelectedChild(children[0].id);
  });

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleProcess = async () => {
    if (!file || !selectedChild) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2500));
    const student = children.find(c => c.id === selectedChild);
    if (student) {
      const mockGrades = generateMockGr(student.fullName, board);
      setGrades(mockGrades);
    }
    setLoading(false);
    setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const card = await uploadReportCard({
        studentId: selectedChild,
        term: `Term ${Math.random() > 0.5 ? '1' : '2'}, 2025-26`,
        boardType: board,
      });
      await addSubjectGrades(card.id, grades);
      setStep(3);
      setTimeout(() => navigate('/parent/clarity', { state: { reportCardId: card.id } }), 1500);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/parent')} className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-6">
          <ArrowLeft size={14} /> {step === 1 ? 'Back to Dashboard' : 'Back'}
        </button>
        <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-2">
          {step === 1 ? 'Upload a Report Card' : step === 2 ? "Here's what we found" : 'Analysis Complete!'}
        </h2>
        <p className="font-body text-medium-gray mb-8">
          {step === 1 ? "We'll analyze the grades, comments, and patterns to give you clear guidance." : step === 2 ? 'Review and edit before we generate your Clarity Check.' : 'Redirecting you to your Clarity Check...'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {/* File Upload */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer mb-6 ${file ? 'border-coral bg-coral/[0.04]' : 'border-light-gray hover:border-coral bg-card-surface-alt'}`}
            >
              {file ? (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                  <Check size={32} className="mx-auto text-sage mb-3" />
                  <p className="font-body font-medium text-charcoal">{file.name}</p>
                  <button onClick={() => setFile(null)} className="font-body text-sm text-coral mt-2 hover:underline">Change file</button>
                </motion.div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-medium-gray mb-3" />
                  <p className="font-body text-charcoal mb-1">Drag & drop or click to upload</p>
                  <p className="font-body text-sm text-medium-gray">JPG, PNG, PDF (max 10MB)</p>
                </>
              )}
            </div>

            {/* Child Selector */}
            <div className="mb-4">
              <label className="block font-body text-sm font-medium text-charcoal mb-2">Which child is this for?</label>
              <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)} className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal focus:border-coral outline-none">
                {children.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>

            {/* Board Selector */}
            <div className="mb-6">
              <label className="block font-body text-sm font-medium text-charcoal mb-2">Which board is this from?</label>
              <select value={board} onChange={e => setBoard(e.target.value as BoardType)} className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal focus:border-coral outline-none">
                {boards.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {error && <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm font-body flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}

            <button onClick={handleProcess} disabled={!file || loading} className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Analyze Report Card <ArrowRight size={14} /></>}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="space-y-3 mb-6">
              {grades.map((g, i) => (
                <motion.div key={g.id || i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="bg-white rounded-xl shadow-subtle p-4">
                  <div className="flex items-center justify-between mb-2">
                    <input value={g.subjectName} onChange={e => {
                      const ng = [...grades]; ng[i] = { ...ng[i], subjectName: e.target.value }; setGrades(ng);
                    }} className="font-body font-medium text-charcoal bg-transparent outline-none" />
                    <input value={g.grade} onChange={e => {
                      const ng = [...grades]; ng[i] = { ...ng[i], grade: e.target.value }; setGrades(ng);
                    }} className="w-16 text-right font-body text-sm text-charcoal bg-cream rounded px-2 py-1 outline-none" />
                  </div>
                  <textarea value={g.teacherComment} onChange={e => {
                    const ng = [...grades]; ng[i] = { ...ng[i], teacherComment: e.target.value }; setGrades(ng);
                  }} rows={2} className="w-full font-body text-sm text-charcoal/70 bg-cream rounded-lg px-3 py-2 outline-none resize-none" />
                </motion.div>
              ))}
            </div>
            <button onClick={handleConfirm} disabled={loading} className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <>Looks Correct — Generate Clarity Check <ArrowRight size={14} /></>}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-sage" />
            </motion.div>
            <h3 className="font-display text-2xl text-charcoal mb-2">Analysis Complete!</h3>
            <p className="font-body text-medium-gray">Your Clarity Check is ready.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
