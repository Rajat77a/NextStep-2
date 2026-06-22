import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Check, ArrowRight, ArrowLeft, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { addParentStudent, addSubjectGrades, createPlanProgress, getStudents, saveClarityCheck, uploadReportCard } from '@/api/data';
import { analyzeReportText } from '@/api/analysis';
import { extractReportText } from '@/lib/reportOcr';
import type { AIReportAnalysis, BoardType, FlagStatus, Student, SubjectGrade } from '@/types';

const boards: BoardType[] = ['CBSE', 'ICSE', 'IGCSE', 'State', 'Other'];

function scoreFromGrade(grade: string, flag: FlagStatus): number {
  const numeric = Number.parseFloat(grade.replace(/[^\d.]/g, ''));
  if (Number.isFinite(numeric)) return Math.max(0, Math.min(100, numeric));
  if (/a1|a\+/i.test(grade)) return 95;
  if (/a2|a/i.test(grade)) return 85;
  if (/b1|b/i.test(grade)) return 75;
  if (/b2|c/i.test(grade)) return 60;
  if (/d|e/i.test(grade)) return 45;
  return flag === 'green' ? 85 : flag === 'yellow' ? 65 : 40;
}

function getOverallStatus(subjects: AIReportAnalysis['subjects']): FlagStatus {
  if (subjects.some((subject) => subject.flag === 'red')) return 'red';
  if (subjects.some((subject) => subject.flag === 'yellow')) return 'yellow';
  return 'green';
}

function buildSummary(analysis: AIReportAnalysis): string {
  const counts = analysis.subjects.reduce(
    (acc, subject) => {
      acc[subject.flag] += 1;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 }
  );

  return `${analysis.studentName || 'This student'} has ${counts.green} green, ${counts.yellow} yellow, and ${counts.red} red subject flags for ${analysis.term || 'this term'}. Use the subject notes below as conversation guidance, not as a diagnosis or prediction.`;
}

export default function UploadReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [board, setBoard] = useState<BoardType>('CBSE');
  const [selectedChild, setSelectedChild] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [children, setChildren] = useState<Student[]>([]);
  const [analyzedStudentId, setAnalyzedStudentId] = useState('');
  const [analysis, setAnalysis] = useState<AIReportAnalysis | null>(null);
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [ocrText, setOcrText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadChildren() {
      if (!user) return;
      const loadedChildren = await getStudents({ parentId: user.id });
      setChildren(loadedChildren);
      if (loadedChildren.length > 0) setSelectedChild((current) => current || loadedChildren[0].id);
    }

    loadChildren();
  }, [user]);

  const setSelectedFile = (nextFile?: File) => {
    setError('');
    setAnalysis(null);
    setGrades([]);
    setOcrText('');
    setAnalyzedStudentId('');
    setFile(null);

    if (!nextFile) return;

    const isSupported =
      nextFile.type.startsWith('image/') ||
      nextFile.type === 'application/pdf' ||
      nextFile.name.toLowerCase().endsWith('.pdf');

    if (!isSupported) {
      setError('Please upload a JPG, PNG, or PDF report card.');
      return;
    }

    if (nextFile.size > 10 * 1024 * 1024) {
      setError('Please upload a file smaller than 10MB.');
      return;
    }

    setFile(nextFile);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleProcess = async () => {
    if (!file) return;

    let student = children.find((child) => child.id === selectedChild);
    if (!student && newChildName.trim()) {
      student = await addParentStudent(newChildName.trim());
      setChildren((current) => [...current, student!]);
      setSelectedChild(student.id);
    }

    if (!student) {
      setError('Please choose a child or enter the student name before analyzing the report card.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setLoadingMessage('Reading the report card...');
      const extractedText = await extractReportText(file, setLoadingMessage);
      setOcrText(extractedText);

      if (extractedText.trim().length < 20) {
        throw new Error('I could not read enough text from this report card. Please try a clearer image or PDF.');
      }

      setLoadingMessage('Putting together your guide...');
      const aiAnalysis = await analyzeReportText({
        rawText: extractedText,
        studentName: student.fullName,
        boardType: board,
      });

      const analyzedGrades: SubjectGrade[] = aiAnalysis.subjects.map((subject) => ({
        id: crypto.randomUUID(),
        reportCardId: '',
        subjectName: subject.subject,
        grade: subject.grade,
        normalizedScore: scoreFromGrade(subject.grade, subject.flag),
        teacherComment: subject.reasoning,
        flag: subject.flag,
        aiNote: subject.reasoning,
        createdAt: new Date().toISOString(),
      }));

      setAnalysis(aiAnalysis);
      setGrades(analyzedGrades);
      setAnalyzedStudentId(student.id);
      setStep(2);
    } catch (e: any) {
      setError(e.message || 'Could not analyze the report card.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleConfirm = async () => {
    if (!analysis || !analyzedStudentId) return;

    setLoading(true);
    setError('');

    try {
      const card = await uploadReportCard({
        studentId: analyzedStudentId,
        term: analysis.term || `Report uploaded ${new Date().toLocaleDateString()}`,
        boardType: board,
        file: file || undefined,
      });

      await addSubjectGrades(card.id, grades);

      const clarityCheck = await saveClarityCheck({
        reportCardId: card.id,
        parentId: user!.id,
        overallStatus: getOverallStatus(analysis.subjects),
        summaryText: buildSummary(analysis),
        conversationScript: analysis.conversationScript,
        teacherQuestions: analysis.teacherQuestions,
        thirtyDayPlan: analysis.thirtyDayPlan,
        generatedAt: new Date().toISOString(),
      });

      await createPlanProgress(
        clarityCheck.id,
        analysis.thirtyDayPlan.map((item, index) => ({
          text: item.habit || `Practice habit for week ${item.week ?? index + 1}`,
          completed: false,
          week: item.week ?? index + 1,
        }))
      );

      setStep(3);
      setTimeout(() => navigate('/parent/clarity', { state: { reportCardId: card.id } }), 1200);
    } catch (e: any) {
      setError(e.message || 'Could not save the analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/parent')} className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-6">
          <ArrowLeft size={14} /> {step === 1 ? 'Back to Dashboard' : 'Back'}
        </button>
        <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-2">
          {step === 1 ? 'Upload a Report Card' : step === 2 ? "Here's what Claude found" : 'Analysis Complete!'}
        </h2>
        <p className="font-body text-medium-gray mb-8">
          {step === 1 ? "Upload a JPG, PNG, or PDF. We'll read it with OCR, then generate clear guidance." : step === 2 ? 'Review the structured AI response before saving it to your portal.' : 'Redirecting you to your Clarity Check...'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="hidden"
              onChange={(event) => setSelectedFile(event.target.files?.[0])}
            />

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click();
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer mb-6 ${file ? 'border-coral bg-coral/[0.04]' : 'border-light-gray hover:border-coral bg-card-surface-alt'}`}
            >
              {file ? (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                  <Check size={32} className="mx-auto text-sage mb-3" />
                  <p className="font-body font-medium text-charcoal">{file.name}</p>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setFile(null);
                      fileInputRef.current?.click();
                    }}
                    className="font-body text-sm text-coral mt-2 hover:underline"
                  >
                    Change file
                  </button>
                </motion.div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-medium-gray mb-3" />
                  <p className="font-body text-charcoal mb-1">Drag and drop or click to upload</p>
                  <p className="font-body text-sm text-medium-gray">JPG, PNG, PDF (max 10MB)</p>
                </>
              )}
            </div>

            <div className="mb-4">
              <label className="block font-body text-sm font-medium text-charcoal mb-2">Which child is this for?</label>
              <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)} className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal focus:border-coral outline-none">
                {children.length === 0 && <option value="">Add student below</option>}
                {children.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>

            {children.length === 0 && (
              <div className="mb-4">
                <label className="block font-body text-sm font-medium text-charcoal mb-2">Student name</label>
                <input
                  value={newChildName}
                  onChange={(event) => setNewChildName(event.target.value)}
                  placeholder="Enter the student's name"
                  className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal focus:border-coral outline-none"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block font-body text-sm font-medium text-charcoal mb-2">Which board is this from?</label>
              <select value={board} onChange={e => setBoard(e.target.value as BoardType)} className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal focus:border-coral outline-none">
                {boards.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {error && <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm font-body flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}

            {loading && (
              <div className="mb-4 p-4 rounded-xl bg-white border border-light-gray flex items-center gap-3">
                <Loader2 size={18} className="animate-spin text-coral" />
                <span className="font-body text-sm text-charcoal">{loadingMessage || 'Processing report card...'}</span>
              </div>
            )}

            <button onClick={handleProcess} disabled={!file || (!selectedChild && !newChildName.trim()) || loading} className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <>Analyze Report Card <ArrowRight size={14} /></>}
            </button>
          </motion.div>
        )}

        {step === 2 && analysis && (
          <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {ocrText && (
              <div className="bg-card-surface-alt rounded-xl p-4 mb-5 border border-light-gray">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-coral" />
                  <span className="font-body text-sm font-semibold text-charcoal">OCR text extracted</span>
                </div>
                <p className="font-body text-xs text-medium-gray line-clamp-3">{ocrText}</p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {grades.map((g, i) => (
                <motion.div key={g.id || i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`bg-white rounded-xl shadow-subtle p-4 border-l-4 ${g.flag === 'green' ? 'border-l-sage' : g.flag === 'yellow' ? 'border-l-amber' : 'border-l-coral'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <input value={g.subjectName} onChange={e => {
                      const nextGrades = [...grades]; nextGrades[i] = { ...nextGrades[i], subjectName: e.target.value }; setGrades(nextGrades);
                    }} className="font-body font-medium text-charcoal bg-transparent outline-none" />
                    <span className="font-body text-xs uppercase tracking-wider text-medium-gray">{g.flag}</span>
                  </div>
                  <input value={g.grade} onChange={e => {
                    const nextGrades = [...grades]; nextGrades[i] = { ...nextGrades[i], grade: e.target.value }; setGrades(nextGrades);
                  }} className="w-full mb-2 font-body text-sm text-charcoal bg-cream rounded px-3 py-2 outline-none" />
                  <textarea value={g.aiNote} onChange={e => {
                    const nextGrades = [...grades]; nextGrades[i] = { ...nextGrades[i], aiNote: e.target.value, teacherComment: e.target.value }; setGrades(nextGrades);
                  }} rows={3} className="w-full font-body text-sm text-charcoal/70 bg-cream rounded-lg px-3 py-2 outline-none resize-none" />
                </motion.div>
              ))}
            </div>

            {error && <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm font-body flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}

            <button onClick={handleConfirm} disabled={loading} className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <>Looks Correct - Save Clarity Check <ArrowRight size={14} /></>}
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
