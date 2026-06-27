import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  uploadReportCard,
  addSubjectGrades,
  saveClarityCheck,
  createPlanProgress,
  updateReportCardAiResponse,
} from '@/api/data';
import {
  analyzeReportText,
  mapAIAnalysisToSubjectGrades,
  mapAIAnalysisToClarityCheck,
} from '@/api/analysis';
import type {
  AIReportAnalysis,
  SubjectGrade,
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [analysis, setAnalysis] = useState<AIReportAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError('');

    if (canReadTextDirectly(selectedFile)) {
      const text = await selectedFile.text();
      setRawText(text);
    }
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile) {
      await handleFileSelect(selectedFile);
    }
  };

  const handleProcess = async () => {
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
    if (!analysis || !user) {
      setError('AI analysis is missing. Please analyze the report again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const clarityData = mapAIAnalysisToClarityCheck(analysis);

      const card = await uploadReportCard({
        studentId: user.id,
        term: analysis.term || 'Current Term',
        boardType: 'Other',
        file: file || undefined,
        uploadMethod: 'parent',
        // ── Save raw OCR text to ReportCard.raw_text ──
        raw_text: rawText || undefined,
      });

      // ── Save the full structured Grok AI response to ReportCard.ai_response ──
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
          onClick={() => (step > 1 ? setStep(step - 1) : navigate('/parent'))}
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) handleFileSelect(selectedFile);
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setRawText('');
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
                    TXT, CSV, PDF, JPG, PNG
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
                onChange={(e) => setRawText(e.target.value)}
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
              disabled={loading || !rawText.trim()}
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
                      onChange={(e) => {
                        const nextGrades = [...grades];
                        nextGrades[index] = {
                          ...nextGrades[index],
                          subjectName: e.target.value,
                        };
                        setGrades(nextGrades);
                      }}
                      className="font-body font-medium text-charcoal bg-transparent outline-none flex-1"
                    />

                    <input
                      value={grade.grade}
                      onChange={(e) => {
                        const nextGrades = [...grades];
                        nextGrades[index] = {
                          ...nextGrades[index],
                          grade: e.target.value,
                        };
                        setGrades(nextGrades);
                      }}
                      className="w-20 text-right font-body text-sm text-charcoal bg-cream rounded px-2 py-1 outline-none"
                    />
                  </div>

                  <textarea
                    value={grade.teacherComment || ''}
                    onChange={(e) => {
                      const nextGrades = [...grades];
                      nextGrades[index] = {
                        ...nextGrades[index],
                        teacherComment: e.target.value,
                      };
                      setGrades(nextGrades);
                    }}
                    rows={2}
                    className="w-full font-body text-sm text-charcoal/70 bg-cream rounded-lg px-3 py-2 outline-none resize-none mb-2"
                  />

                  {grade.aiNote && (
                    <p className="font-body text-xs text-medium-gray">{grade.aiNote}</p>
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
