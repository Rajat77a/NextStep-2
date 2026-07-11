import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransition } from '@/contexts/PageTransitionContext';
import {
  Upload,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  uploadReportCard,
  addSubjectGrades,
  saveClarityCheck,
  createPlanProgress,
  updateReportCardAiResponse,
  getStudents,
} from '@/api/data';
import {
  analyzeReportText,
  mapAIAnalysisToSubjectGrades,
  mapAIAnalysisToClarityCheck,
} from '@/api/analysis';
import { extractReportText } from '@/lib/reportOcr';
import type {
  AIReportAnalysis,
  SubjectGrade,
  Student,
} from '@/types';

function canReadTextDirectly(file: File) {
  const name = file.name.toLowerCase();

  return (
    file.type.startsWith('text/') ||
    name.endsWith('.txt') ||
    name.endsWith('.csv')
  );
}

function buildPlanProgressItems(analysis: AIReportAnalysis) {
  return analysis.thirtyDayPlan.flatMap((week, weekIndex) => {
    if (week.actions && week.actions.length > 0) {
      return week.actions.map((action) => ({
        text: action.text,
        completed: false,
        week: week.weekNumber || week.week || weekIndex + 1,
      }));
    }

    if (week.habit) {
      return [
        {
          text: week.habit,
          completed: false,
          week: week.weekNumber || week.week || weekIndex + 1,
        },
      ];
    }

    return [];
  });
}

export default function UploadReport() {
  const navigate = useNavigate();
  const { navigateWithTransition } = usePageTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [analysis, setAnalysis] = useState<AIReportAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ocrStatus, setOcrStatus] = useState('');

  useEffect(() => {
    if (!user?.id) return;

    getStudents({ parentId: user.id })
      .then((kids) => {
        setChildren(kids);

        if (kids.length > 0) {
          setSelectedChildId((current) => current || kids[0].id);
        }
      })
      .catch((err) => {
        setError(err?.message || 'Could not load children.');
      });
  }, [user?.id]);

  const handleFileSelect = async (selectedFile: File) => {
    const maxSize = 10 * 1024 * 1024;
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'text/plain',
    ];

    if (
      !allowed.includes(selectedFile.type) &&
      !selectedFile.name.match(/\.(jpg|jpeg|png|webp|pdf|txt|csv)$/i)
    ) {
      setError('Please upload a PDF, JPEG, PNG, WebP image, or text file.');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum size is 10 MB.');
      return;
    }

    setFile(selectedFile);
    setError('');
    setRawText('');
    setOcrStatus('');

    if (canReadTextDirectly(selectedFile)) {
      const text = await selectedFile.text();
      setRawText(text);
    } else {
      try {
        const text = await extractReportText(selectedFile, (message) => {
          setOcrStatus(message);
        });

        setRawText(text);
        setOcrStatus('');
      } catch (err: any) {
        setError(err?.message || 'Could not read the file.');
      }
    }
  };

  const handleFileDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    const selectedFile = event.dataTransfer.files[0];

    if (selectedFile) {
      await handleFileSelect(selectedFile);
    }
  };

  const handleProcess = async () => {
    const effectiveChildId = selectedChildId || children[0]?.id;

    if (!effectiveChildId) {
      setError(
        'No child is linked to this parent account. Please add a student from the school admin portal using this parent email.'
      );
      return;
    }

    setSelectedChildId(effectiveChildId);

    if (!rawText.trim() || rawText.trim().length < 20) {
      setError(
        'Please paste the report card text before analyzing. Image/PDF OCR can be added later, but the AI needs text to read right now.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const aiResult = await analyzeReportText({
        rawText,
      });

      setAnalysis(aiResult);

      const mappedGrades = mapAIAnalysisToSubjectGrades(aiResult).map((grade) => ({
        id: crypto.randomUUID(),
        reportCardId: '',
        subjectName: grade.subjectName,
        grade: grade.grade,
        normalizedScore: grade.normalizedScore,
        teacherComment: grade.teacherComment,
        flag: grade.flag,
        aiNote: grade.aiNote,
        createdAt: new Date().toISOString(),
      }));

      setGrades(mappedGrades);
      setStep(2);
    } catch (err: any) {
      setError(err?.message || 'Unable to analyze this report card.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    const effectiveChildId = selectedChildId || children[0]?.id;

    if (!effectiveChildId) {
      setError(
        'No child is linked to this parent account. Please add a student from the school admin portal using this parent email.'
      );
      return;
    }

    if (!analysis || !user) {
      setError('AI analysis is missing. Please analyze the report again.');
      return;
    }

    setSelectedChildId(effectiveChildId);
    setLoading(true);
    setError('');

    try {
      const clarityData = mapAIAnalysisToClarityCheck(analysis);

      const card = await uploadReportCard({
        studentId: effectiveChildId,
        term: analysis.term || 'Current Term',
        boardType: 'Other',
        file: file || undefined,
        uploadMethod: 'parent',
        raw_text: rawText || undefined,
      });

      await updateReportCardAiResponse(card.id, analysis);

      await addSubjectGrades(card.id, grades);

      const clarityCheck = await saveClarityCheck({
        reportCardId: card.id,
        parentId: user.id,
        overallStatus: clarityData.overallStatus,
        summaryText: clarityData.summaryText,
        conversationScript: clarityData.conversationScript,
        teacherQuestions: clarityData.teacherQuestions,
        thirtyDayPlan: clarityData.thirtyDayPlan,
        generatedAt: new Date().toISOString(),
      });

      const progressItems = buildPlanProgressItems(analysis);

      if (progressItems.length > 0) {
        await createPlanProgress(clarityCheck.id, progressItems);
      }

      setStep(3);

      setTimeout(() => {
        navigate('/parent/clarity', {
          state: { reportCardId: card.id },
        });
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Could not save the analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-12 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigateWithTransition('/parent'))}
          className="flex items-center gap-1 text-medium-gray hover:text-charcoal font-body text-sm mb-6"
        >
          <ArrowLeft size={14} />
          {step === 1 ? 'Back to Dashboard' : 'Back'}
        </button>

        <h2 className="font-display text-2xl md:text-4xl text-charcoal mb-2">
          {step === 1
            ? 'Upload a Report Card'
            : step === 2
              ? "Here's what we found"
              : 'Analysis Complete!'}
        </h2>

        <p className="font-body text-medium-gray mb-8">
          {step === 1
            ? "We'll analyze the grades, comments, and patterns to give you clear guidance."
            : step === 2
              ? 'Review and edit before we generate your Clarity Check.'
              : 'Redirecting you to your Clarity Check...'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-5">
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
                Select Child
              </label>

              <div className="relative">
                <Users
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medium-gray pointer-events-none"
                />

                <select
                  value={selectedChildId || children[0]?.id || ''}
                  onChange={(event) => setSelectedChildId(event.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal appearance-none cursor-pointer focus:border-coral focus:ring-[3px] focus:ring-coral/10 outline-none transition-all"
                >
                  {children.length === 0 && (
                    <option value="">No children added yet</option>
                  )}

                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {children.length === 0 && (
                <p className="font-body text-xs text-medium-gray mt-2">
                  Add a student from the school admin portal using this parent email.
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];
                if (selectedFile) handleFileSelect(selectedFile);
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer mb-6 ${
                file
                  ? 'border-coral bg-coral/[0.04]'
                  : 'border-light-gray hover:border-coral bg-card-surface-alt'
              }`}
            >
              {file ? (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                  <Check size={32} className="mx-auto text-sage mb-3" />
                  <p className="font-body font-medium text-charcoal">{file.name}</p>

                  {ocrStatus && (
                    <p className="font-body text-xs text-medium-gray mt-1">
                      {ocrStatus}
                    </p>
                  )}

                  {rawText && !ocrStatus && (
                    <p className="font-body text-xs text-sage mt-1">
                      Text extracted successfully
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setFile(null);
                      setRawText('');
                      setOcrStatus('');
                    }}
                    className="font-body text-sm text-coral mt-2 hover:underline"
                  >
                    Change file
                  </button>
                </motion.div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-medium-gray mb-3" />

                  <p className="font-body text-charcoal mb-1">
                    Drag & drop or click to upload
                  </p>

                  <p className="font-body text-sm text-medium-gray">
                    TXT, CSV, PDF, JPG, PNG, WebP
                  </p>
                </>
              )}
            </div>

            <div className="mb-6">
              <label className="block font-body text-sm font-medium text-charcoal mb-2">
                Report card text
              </label>

              <textarea
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                rows={8}
                placeholder="Paste the report card text here. If you uploaded a TXT or CSV file, this will fill automatically."
                className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal focus:border-coral outline-none resize-none"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm font-body flex items-center gap-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={loading || !rawText.trim() || children.length === 0}
              className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Report Card
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {analysis?.summaryText && (
              <div className="bg-white rounded-xl shadow-subtle p-4 mb-4">
                <p className="font-body text-sm text-medium-gray mb-1">AI Summary</p>
                <p className="font-body text-charcoal">{analysis.summaryText}</p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {grades.map((grade, index) => (
                <motion.div
                  key={grade.id || index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-white rounded-xl shadow-subtle p-4"
                >
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <input
                      value={grade.subjectName}
                      onChange={(event) => {
                        const nextGrades = [...grades];
                        nextGrades[index] = {
                          ...nextGrades[index],
                          subjectName: event.target.value,
                        };
                        setGrades(nextGrades);
                      }}
                      className="font-body font-medium text-charcoal bg-transparent outline-none flex-1"
                    />

                    <input
                      value={grade.grade}
                      onChange={(event) => {
                        const nextGrades = [...grades];
                        nextGrades[index] = {
                          ...nextGrades[index],
                          grade: event.target.value,
                        };
                        setGrades(nextGrades);
                      }}
                      className="w-20 text-right font-body text-sm text-charcoal bg-cream rounded px-2 py-1 outline-none"
                    />
                  </div>

                  <textarea
                    value={grade.teacherComment || ''}
                    onChange={(event) => {
                      const nextGrades = [...grades];
                      nextGrades[index] = {
                        ...nextGrades[index],
                        teacherComment: event.target.value,
                      };
                      setGrades(nextGrades);
                    }}
                    rows={2}
                    className="w-full font-body text-sm text-charcoal/70 bg-cream rounded-lg px-3 py-2 outline-none resize-none mb-2"
                  />

                  {grade.aiNote && (
                    <p className="font-body text-xs text-medium-gray">
                      {grade.aiNote}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm font-body flex items-center gap-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Looks Correct - Generate Clarity Check
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4"
            >
              <Check size={32} className="text-sage" />
            </motion.div>

            <h3 className="font-display text-2xl text-charcoal mb-2">
              Analysis Complete!
            </h3>

            <p className="font-body text-medium-gray">
              Your Clarity Check is ready.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
