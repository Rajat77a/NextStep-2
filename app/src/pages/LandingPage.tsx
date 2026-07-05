import { useState, useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Upload, Brain, FileText, Heart,
  Users, Building, ChevronLeft, ChevronRight, ChevronUp, Menu, X, Check, Star, Calendar, MessageCircle,
} from 'lucide-react';
import TiltCard from '@/components/shared/TiltCard';

const testimonials = [
  { name: 'Meera Krishnan', role: 'Parent of Grade 5 student', text: 'The AI analysis helped me understand what my daughter\'s teacher was really trying to say. The conversation guide made our talk so much more productive.', stars: 5 },
  { name: 'Ravi Nair', role: 'Parent of Grade 7 student', text: 'I used to dread report card day. Now I feel prepared. The 30-day plan gave us small, doable steps instead of overwhelming advice.', stars: 5 },
  { name: 'Anita Desai', role: 'Parent of twins in Grade 4', text: 'Being able to compare terms and see what actually worked was eye-opening. We could see the improvement from following the plan.', stars: 4 },
  { name: 'Suresh Patel', role: 'Parent of Grade 6 student', text: 'The questions for the teacher were spot-on. Our parent-teacher meeting was the most productive one we\'ve had.', stars: 5 },
  { name: 'Lakshmi Menon', role: 'Parent of Grade 8 student', text: 'I love that it doesn\'t make predictions about my son\'s future. It just gives clear, gentle guidance on what to do next.', stars: 4 },
];

const avatarColors = ['bg-coral/20 text-coral', 'bg-sage/20 text-sage', 'bg-amber/20 text-amber', 'bg-coral/20 text-coral', 'bg-sage/20 text-sage'];

const faqs = [
  { q: 'Is my child\'s data secure?', a: 'Absolutely. All report cards and analysis are stored with encryption. Your child\'s information is never shared with third parties. Teachers and admins cannot see your Clarity Check or conversation guides — only aggregate, anonymized data.' },
  { q: 'What school boards do you support?', a: 'We support CBSE, ICSE, IGCSE, and all major State Boards. Our AI understands the grading system for each board, so a "B" in CBSE is interpreted differently than a "B" in ICSE.' },
  { q: 'Can teachers see what parents see?', a: 'No. Teachers see class-level patterns and individual student flag summaries, but they cannot access your conversation scripts, teacher questions, or 30-day home plans. Your guidance is private to you.' },
  { q: 'How accurate is the AI analysis?', a: 'Our AI is designed to be supportive and advisory, not diagnostic. It identifies patterns in grades and comments, then suggests gentle next steps. Always consult your child\'s teacher for professional educational advice.' },
  { q: 'What if my child\'s school isn\'t using NextStep.AI?', a: 'Parents can use NextStep.AI independently. Simply upload your child\'s report card and select their school board. All features work the same way.' },
];

const subjectRows = [
  { subject: 'Mathematics', status: 'On Track', color: 'bg-sage' },
  { subject: 'Science', status: 'Watch', color: 'bg-amber' },
  { subject: 'English', status: 'Address', color: 'bg-coral' },
  { subject: 'Social Studies', status: 'On Track', color: 'bg-sage' },
  { subject: 'Hindi', status: 'Watch', color: 'bg-amber' },
];

const scriptRows = [
  { label: 'Instead of:', text: 'How did you get a C in Science?' },
  { label: 'Try:', text: 'Which subject felt hardest this term, and why?' },
  { label: 'Instead of:', text: 'You need to study more.' },
  { label: 'Try:', text: 'What would make it easier to focus at home?' },
];

const planRows = [
  { week: 'Week 1', text: 'Ask your child one question about their day at dinner. 5 minutes.' },
  { week: 'Week 2', text: 'Read one page together before bed, 3x a week.' },
  { week: 'Week 3', text: 'Let your child teach you something they learned this week.' },
  { week: 'Week 4', text: 'Check in with the teacher - share one thing that improved.' },
];

const portalCards = [
  {
    id: 'community-parents',
    icon: <Heart size={32} className="text-coral" />,
    title: 'For Parents',
    desc: 'Upload report cards, get AI-powered clarity checks, conversation guides, and personalized 30-day plans.',
    link: '/signup',
    cta: 'Enter Parent Portal',
    points: ['Private child summary', 'Teacher questions ready', '30-day home plan'],
  },
  {
    id: 'teachers',
    icon: <Users size={32} className="text-coral" />,
    title: 'For Teachers',
    desc: 'See class-wide patterns, identify students who need attention, and track academic trends across terms.',
    link: '/signup',
    cta: 'Enter Teacher Portal',
    points: ['Class-wide flags', 'Students to watch', 'Context notes'],
  },
  {
    id: 'schools',
    icon: <Building size={32} className="text-coral" />,
    title: 'For Schools',
    desc: 'Manage classes, student rosters, teacher assignments, and monitor school-wide academic health.',
    link: '/signup',
    cta: 'Enter Admin Portal',
    points: ['Bulk uploads', 'School-wide dashboard', 'Parent engagement'],
  },
];

const heroImages = [
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&h=1080&fit=crop',
];

const HERO_VIDEOS = [
  { src: 'https://cdn.pixabay.com/video/2024/06/06/215470_large.mp4', poster: heroImages[0] },
  { src: 'https://cdn.pixabay.com/video/2024/06/06/215472_large.mp4', poster: heroImages[1] },
  { src: 'https://cdn.pixabay.com/video/2024/06/06/215471_large.mp4', poster: heroImages[2] },
];

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      if (shouldReduceMotion) setCount(value);
      return;
    }

    let frame = 0;
    const frames = 48;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / frames, 3);
      setCount(Math.round(value * progress));
      if (frame >= frames) window.clearInterval(timer);
    }, 24);

    return () => window.clearInterval(timer);
  }, [isInView, shouldReduceMotion, value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function GlowTiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setGlow({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }

  function handleLeave() {
    setIsHovered(false);
  }

  return (
    <div
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleLeave}
      className={`relative group ${className}`}
    >
      {!shouldReduceMotion && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl pointer-events-none z-10 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(232, 93, 62, 0.12), transparent 60%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

function MagneticWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
    setPos({ x, y });
  }

  function handleLeave() {
    setPos({ x: 0, y: 0 });
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={shouldReduceMotion ? {} : { x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      className={className}
      style={{ display: 'inline-flex' }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedClarityCheck() {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'start' | 'loading' | 'reveal' | 'done'>('start');
  const [revealed, setRevealed] = useState(0);
  const [paused, setPaused] = useState(false);
  const timers = useRef<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: '-80px' });
  const [clickBurst, setClickBurst] = useState(false);
  const [burstId, setBurstId] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 140, y: 160 });
  const [cursorClicking, setCursorClicking] = useState(false);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function moveCursor(x: number, y: number) {
    setCursorPos({ x, y });
  }

  function triggerClick() {
    setCursorClicking(true);
    window.setTimeout(() => setCursorClicking(false), 200);
    setBurstId(n => n + 1);
    setClickBurst(true);
    window.setTimeout(() => setClickBurst(false), 600);
  }

  useEffect(() => {
    if (!isInView) {
      clearTimers();
      setPhase('start');
      setRevealed(0);
      moveCursor(140, 160);
    }
  }, [isInView]);

  useEffect(() => {
    if (shouldReduceMotion || paused || !isInView) return;
    clearTimers();
    if (phase === 'start') {
      moveCursor(140, 140);
      timers.current.push(window.setTimeout(() => {
        triggerClick();
        setPhase('loading');
      }, 900));
    } else if (phase === 'loading') {
      moveCursor(140, 190);
      timers.current.push(window.setTimeout(() => {
        triggerClick();
        setPhase('reveal');
      }, 1600));
    } else if (phase === 'reveal' && revealed < subjectRows.length) {
      const rowCenter = 18 + revealed * 52 + 17;
      moveCursor(60, rowCenter);
      timers.current.push(window.setTimeout(() => {
        triggerClick();
        setRevealed(r => r + 1);
      }, 500));
    } else if (phase === 'reveal' && revealed >= subjectRows.length) {
      moveCursor(140, 270);
      timers.current.push(window.setTimeout(() => {
        triggerClick();
        setPhase('done');
      }, 500));
    } else if (phase === 'done') {
      moveCursor(140, 285);
      timers.current.push(window.setTimeout(() => {
        setPhase('start');
        setRevealed(0);
      }, 3000));
    }
    return clearTimers;
  }, [phase, revealed, shouldReduceMotion, paused, isInView]);

  return (
    <div ref={ref}>
    <FloatingMockCard>
      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="label-text text-coral mb-1">Clarity Check</p>
            <h4 className="font-display text-2xl font-medium text-charcoal">Term 2</h4>
          </div>
          <span className="font-body text-xs font-semibold text-charcoal/50">Grade 6</span>
        </div>

        <div className="h-[320px] overflow-hidden bg-white rounded-2xl relative">
          {!shouldReduceMotion && (
            <SimulatedCursor x={cursorPos.x} y={cursorPos.y} clicking={cursorClicking} />
          )}
          {clickBurst && <CinematicBurst x={cursorPos.x} y={cursorPos.y} id={burstId} />}
          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.06, transition: { duration: 0.15, ease: 'easeIn' } }}
                className="flex flex-col items-center justify-center gap-4 h-full relative overflow-visible"
              >
                <motion.div
                  initial={{ y: -100, opacity: 0, rotate: -6 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 130, damping: 16, delay: 0.1 }}
                  className="absolute w-36 h-14 rounded-xl bg-white border border-coral/30 shadow-lg flex items-center justify-center gap-2 z-10"
                  style={{ top: '26%' }}
                >
                  <FileText size={15} className="text-coral" />
                  <span className="font-body text-xs font-semibold text-charcoal/70">Term2_Report.pdf</span>
                </motion.div>
                <motion.div
                  initial={{ borderColor: 'rgba(232,93,62,0.3)', background: 'rgba(232,93,62,0.03)' }}
                  animate={{ borderColor: 'rgba(232,93,62,0.6)', background: 'rgba(232,93,62,0.08)' }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center"
                >
                  <Upload size={32} className="text-coral/50" />
                </motion.div>
                <div className="text-center mt-14">
                  <p className="font-body text-sm font-semibold text-charcoal/70">Report card uploaded</p>
                  <p className="font-body text-xs text-charcoal/40 mt-0.5">Analyzing performance...</p>
                </div>
              </motion.div>
            )}

            {phase === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.12 } }}
                className="flex flex-col items-center justify-center gap-3 h-full"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="w-10 h-10 rounded-xl bg-coral/8 border border-coral/15 flex items-center justify-center"
                >
                  <FileText size={18} className="text-coral/60" />
                </motion.div>
                <motion.div
                  animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 rounded-full border-2 border-coral/20 border-t-coral"
                />
                <p className="font-body text-sm text-charcoal/50">
                  Analyzing report card
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  > ...</motion.span>
                </p>
                <div className="w-36 h-1 rounded-full bg-light-gray overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-coral to-sage"
                  />
                </div>
              </motion.div>
            )}

            {(phase === 'reveal' || phase === 'done') && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.12 } }}
                className="space-y-2.5"
              >
                {subjectRows.map((row, i) => (
                  <motion.div
                    key={row.subject}
                    className="relative"
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
                    animate={revealed > i ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <motion.div
                      animate={revealed > i && revealed - 1 === i ? { scale: [1, 1.025, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center justify-between rounded-xl border border-light-gray px-4 py-3 ${revealed > i ? 'bg-card-surface-alt' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={revealed > i ? { scale: 1 } : { scale: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.15 }}
                          className={`w-2.5 h-2.5 rounded-full ${row.color}`}
                        />
                        <span className="font-body text-sm font-semibold text-charcoal">{row.subject}</span>
                      </div>
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={revealed > i ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.25, delay: 0.25 }}
                        className={`font-body text-xs font-semibold px-2 py-0.5 rounded-full ${
                          row.status === 'On Track' ? 'bg-sage/15 text-sage' :
                          row.status === 'Watch' ? 'bg-amber/15 text-amber' :
                          'bg-coral/15 text-coral'
                        }`}
                      >
                        {row.status}
                      </motion.span>
                    </motion.div>
                  </motion.div>
                ))}
                  </motion.div>
                )}
          </AnimatePresence>
        </div>
      </div>
    </FloatingMockCard>
    </div>
  );
}


function SimulatedCursor({ x, y, clicking }: { x: number; y: number; clicking: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      style={{ left: 0, top: 0 }}
      initial={false}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 220, damping: 26, mass: 0.4 }}
    >
      <motion.svg
        width="18" height="24" viewBox="0 0 18 24" fill="none"
        animate={clicking ? { scaleY: 0.7, scaleX: 0.85, y: 5 } : { scaleY: 1, scaleX: 1, y: 0 }}
        transition={{ duration: 0.1, ease: 'easeInOut' }}
        style={{
          filter: clicking
            ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.35)) drop-shadow(0 0 6px rgba(232,93,62,0.5))'
            : 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))',
        }}
      >
        <path
          d="M2 2L2 21L5.5 16L9 23L11.5 21.5L8 15L15.5 15L2 2Z"
          fill="black"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
}

function CinematicBurst({ x, y, id }: { x: number; y: number; id: number }) {
  return (
    <>
      <motion.div
        key={`sf-${id}`}
        initial={{ opacity: 0.1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="absolute inset-0 bg-white pointer-events-none z-10 rounded-2xl"
      />
      <motion.div
        key={`or-${id}`}
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 7, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-coral/25 pointer-events-none z-10"
        style={{ left: x, top: y }}
      />
      <motion.div
        key={`if-${id}`}
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 3.5, opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.02 }}
        className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 pointer-events-none z-10"
        style={{ left: x, top: y }}
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <motion.div
          key={`rs-${id}-${angle}`}
          initial={{ scaleX: 0, opacity: 0.4 }}
          animate={{ scaleX: 1.5, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: angle * 0.0003 }}
          className="absolute pointer-events-none z-10"
          style={{
            left: x,
            top: y,
            width: '2px',
            height: '28px',
            background: 'linear-gradient(to bottom, rgba(232,93,62,0.5), transparent)',
            transformOrigin: 'top center',
            rotate: `${angle}deg`,
            translate: '-50% 0',
          }}
        />
      ))}
      <motion.div
        key={`gb-${id}`}
        initial={{ scale: 0, opacity: 0.12 }}
        animate={{ scale: 5, opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-10"
        style={{
          left: x,
          top: y,
          background: 'radial-gradient(circle, rgba(232,93,62,0.3), transparent 70%)',
        }}
      />
    </>
  );
}

function FloatingMockCard({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <GlowTiltCard>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div
          dir="ltr"
          className="smooth-float rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] bg-white/95 backdrop-blur-sm border border-white/20 p-6 md:p-7 text-left"
        >
          {children}
        </div>
      </motion.div>
    </GlowTiltCard>
  );
}

function AnimatedConversation() {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'idle' | 'typing1' | 'response1' | 'typing2' | 'response2' | 'done'>('idle');
  const [typed, setTyped] = useState('');
  const [paused, setPaused] = useState(false);
  const timers = useRef<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: '-80px' });
  const [clickBurst, setClickBurst] = useState(false);
  const [burstId, setBurstId] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 140, y: 160 });
  const [cursorClicking, setCursorClicking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const insteadText1 = 'How did you get a C in Science?';
  const tryText1 = 'Which subject felt hardest this term, and why?';
  const insteadText2 = 'You need to study more.';
  const tryText2 = 'What would make it easier to focus at home?';

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function moveCursor(x: number, y: number) {
    setCursorPos({ x, y });
  }

  function triggerClick() {
    setCursorClicking(true);
    window.setTimeout(() => setCursorClicking(false), 200);
    setBurstId(n => n + 1);
    setClickBurst(true);
    window.setTimeout(() => setClickBurst(false), 600);
  }

  useEffect(() => {
    if (!isInView) {
      clearTimers();
      setPhase('idle');
      setTyped('');
      moveCursor(140, 160);
    }
  }, [isInView]);

  useEffect(() => {
    if (shouldReduceMotion || paused || !isInView) return;
    clearTimers();
    if (phase === 'idle') {
      setTyped('');
      moveCursor(140, 140);
      timers.current.push(window.setTimeout(() => {
        triggerClick();
        setPhase('typing1');
      }, 900));
    } else if (phase === 'typing1' && typed.length < insteadText1.length) {
      moveCursor(50, 200);
      timers.current.push(window.setTimeout(() => {
        setTyped(prev => insteadText1.slice(0, prev.length + 1));
      }, 40));
    } else if (phase === 'typing1' && typed.length >= insteadText1.length) {
      moveCursor(120, 230);
      timers.current.push(window.setTimeout(() => {
        triggerClick();
        setPhase('response1');
      }, 800));
    } else if (phase === 'response1') {
      setTyped('');
      moveCursor(50, 200);
      timers.current.push(window.setTimeout(() => {
        triggerClick();
        setPhase('typing2');
      }, 1200));
    } else if (phase === 'typing2' && typed.length < insteadText2.length) {
      moveCursor(50, 200);
      timers.current.push(window.setTimeout(() => {
        setTyped(prev => insteadText2.slice(0, prev.length + 1));
      }, 40));
    } else if (phase === 'typing2' && typed.length >= insteadText2.length) {
      moveCursor(120, 230);
      timers.current.push(window.setTimeout(() => {
        triggerClick();
        setPhase('response2');
      }, 800));
    } else if (phase === 'response2') {
      moveCursor(140, 310);
      timers.current.push(window.setTimeout(() => setPhase('done'), 2500));
    } else if (phase === 'done') {
      moveCursor(140, 310);
      timers.current.push(window.setTimeout(() => {
        setPhase('idle');
        setTyped('');
      }, 3000));
    }
    return clearTimers;
  }, [phase, typed, shouldReduceMotion, paused, isInView]);

  return (
    <div ref={ref}>
    <FloatingMockCard>
      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <p className="label-text text-coral mb-1">Tonight's Script</p>
        <h4 className="font-display text-2xl font-medium text-charcoal mb-5">A calmer way in</h4>

        <div className="h-[330px] overflow-hidden bg-white rounded-2xl relative">
          {!shouldReduceMotion && (
            <SimulatedCursor x={cursorPos.x} y={cursorPos.y} clicking={cursorClicking} />
          )}
          {clickBurst && <CinematicBurst x={cursorPos.x} y={cursorPos.y} id={burstId} />}
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.08, transition: { duration: 0.1 } }}
                className="flex flex-col items-center justify-center gap-4 h-full relative overflow-visible"
              >
                <motion.div
                  initial={{ y: -100, opacity: 0, rotate: -6 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 130, damping: 16, delay: 0.1 }}
                  className="absolute w-36 h-14 rounded-xl bg-white border border-coral/30 shadow-lg flex items-center justify-center gap-2 z-10"
                  style={{ top: '26%' }}
                >
                  <FileText size={15} className="text-coral" />
                  <span className="font-body text-xs font-semibold text-charcoal/70">Report_Q2.pdf</span>
                </motion.div>
                <motion.div
                  initial={{ borderColor: 'rgba(232,93,62,0.3)', background: 'rgba(232,93,62,0.03)' }}
                  animate={{ borderColor: 'rgba(232,93,62,0.6)', background: 'rgba(232,93,62,0.08)' }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center"
                >
                  <Upload size={32} className="text-coral/50" />
                </motion.div>
                <div className="text-center mt-14">
                  <p className="font-body text-sm font-semibold text-charcoal/70">Report card uploaded</p>
                  <p className="font-body text-xs text-charcoal/40 mt-0.5">Generating conversation guide...</p>
                </div>
              </motion.div>
            )}

            {phase !== 'idle' && (
              <motion.div
                key="conversation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.1 } }}
                className="space-y-3"
                ref={listRef}
              >
                {phase === 'typing1' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="rounded-2xl bg-card-surface-alt px-4 py-4"
                  >
                    <span className="font-body text-xs font-semibold text-coral">Instead of:</span>
                    <p className="font-body text-sm text-charcoal/80 mt-1 min-h-[20px]">
                      {typed}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="inline-block w-[2px] h-4 bg-coral/60 ml-0.5 align-middle"
                      />
                    </p>
                  </motion.div>
                )}

                {(phase === 'response1' || phase === 'typing2' || phase === 'response2' || phase === 'done') && (
                  <motion.div
                    initial={{ opacity: 0, x: -12, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                    className="rounded-2xl bg-card-surface-alt px-4 py-3"
                  >
                    <span className="font-body text-xs font-semibold text-coral">Instead of:</span>
                    <p className="font-body text-sm text-charcoal/80 mt-1">{insteadText1}</p>
                  </motion.div>
                )}

                {(phase === 'response1' || phase === 'typing2' || phase === 'response2' || phase === 'done') && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.2 }}
                    className="rounded-2xl bg-coral/10 ml-4 px-4 py-3 border border-coral/10"
                  >
                    <span className="font-body text-xs font-semibold text-coral">Try:</span>
                    <p className="font-body text-sm text-charcoal/80 mt-1">{tryText1}</p>
                  </motion.div>
                )}

                {phase === 'typing2' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="rounded-2xl bg-card-surface-alt px-4 py-4"
                  >
                    <span className="font-body text-xs font-semibold text-coral">Instead of:</span>
                    <p className="font-body text-sm text-charcoal/80 mt-1 min-h-[20px]">
                      {typed}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="inline-block w-[2px] h-4 bg-coral/60 ml-0.5 align-middle"
                      />
                    </p>
                  </motion.div>
                )}

                {(phase === 'response2' || phase === 'done') && (
                  <motion.div
                    initial={{ opacity: 0, x: -12, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                    className="rounded-2xl bg-card-surface-alt px-4 py-3"
                  >
                    <span className="font-body text-xs font-semibold text-coral">Instead of:</span>
                    <p className="font-body text-sm text-charcoal/80 mt-1">{insteadText2}</p>
                  </motion.div>
                )}

                {(phase === 'response2' || phase === 'done') && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.2 }}
                    className="rounded-2xl bg-coral/10 ml-4 px-4 py-3 border border-coral/10"
                  >
                    <span className="font-body text-xs font-semibold text-coral">Try:</span>
                    <p className="font-body text-sm text-charcoal/80 mt-1">{tryText2}</p>
                  </motion.div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FloatingMockCard>
    </div>
  );
}

function AnimatedDayPlan() {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<'idle' | 'building' | 'week1' | 'week2' | 'week3' | 'week4' | 'done'>('idle');
  const [paused, setPaused] = useState(false);
  const timers = useRef<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: '-80px' });
  const [clickBurst, setClickBurst] = useState(false);
  const [burstId, setBurstId] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 140, y: 175 });
  const [cursorClicking, setCursorClicking] = useState(false);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function moveCursor(x: number, y: number) {
    setCursorPos({ x, y });
  }

  function triggerClick() {
    setCursorClicking(true);
    window.setTimeout(() => setCursorClicking(false), 200);
    setBurstId(n => n + 1);
    setClickBurst(true);
    window.setTimeout(() => setClickBurst(false), 600);
  }

  useEffect(() => {
    if (!isInView) {
      clearTimers();
      setPhase('idle');
      moveCursor(140, 175);
    }
  }, [isInView]);

  useEffect(() => {
    if (shouldReduceMotion || paused || !isInView) return;
    clearTimers();
    if (phase === 'idle') {
      moveCursor(140, 140);
      timers.current.push(window.setTimeout(() => {
        triggerClick();
        setPhase('building');
      }, 900));
    } else if (phase === 'building') {
      moveCursor(140, 220);
      timers.current.push(window.setTimeout(() => {
        triggerClick();
        setPhase('week1');
      }, 1400));
    } else if (phase === 'week1') {
      timers.current.push(window.setTimeout(() => {
        setPhase('week2');
      }, 800));
    } else if (phase === 'week2') {
      timers.current.push(window.setTimeout(() => {
        setPhase('week3');
      }, 800));
    } else if (phase === 'week3') {
      timers.current.push(window.setTimeout(() => {
        setPhase('week4');
      }, 800));
    } else if (phase === 'week4') {
      timers.current.push(window.setTimeout(() => {
        setPhase('done');
      }, 800));
    } else if (phase === 'done') {
      timers.current.push(window.setTimeout(() => setPhase('idle'), 3000));
    }
    return clearTimers;
  }, [phase, shouldReduceMotion, paused, isInView]);

  const weekPhases = ['week1', 'week2', 'week3', 'week4'] as const;

  return (
    <div ref={ref}>
    <FloatingMockCard>
      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <p className="label-text text-coral mb-1">Your 30-Day Plan</p>
        <h4 className="font-display text-2xl font-medium text-charcoal mb-5">Four small weeks</h4>

        <div className="h-[350px] overflow-hidden bg-white rounded-2xl relative">
          {!shouldReduceMotion && (
            <SimulatedCursor x={cursorPos.x} y={cursorPos.y} clicking={cursorClicking} />
          )}
          {clickBurst && <CinematicBurst x={cursorPos.x} y={cursorPos.y} id={burstId} />}
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.08, transition: { duration: 0.1 } }}
                className="flex flex-col items-center justify-center gap-4 h-full relative overflow-visible"
              >
                <motion.div
                  initial={{ y: -100, opacity: 0, rotate: -6 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 130, damping: 16, delay: 0.1 }}
                  className="absolute w-36 h-14 rounded-xl bg-white border border-coral/30 shadow-lg flex items-center justify-center gap-2 z-10"
                  style={{ top: '26%' }}
                >
                  <FileText size={15} className="text-coral" />
                  <span className="font-body text-xs font-semibold text-charcoal/70">Term_2_Grade.pdf</span>
                </motion.div>
                <motion.div
                  initial={{ borderColor: 'rgba(232,93,62,0.3)', background: 'rgba(232,93,62,0.03)' }}
                  animate={{ borderColor: 'rgba(232,93,62,0.6)', background: 'rgba(232,93,62,0.08)' }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center"
                >
                  <Upload size={32} className="text-coral/50" />
                </motion.div>
                <div className="text-center mt-14">
                  <p className="font-body text-sm font-semibold text-charcoal/70">Report card uploaded</p>
                  <p className="font-body text-xs text-charcoal/40 mt-0.5">Creating 30-day improvement plan...</p>
                </div>
              </motion.div>
            )}

            {phase === 'building' && (
              <motion.div
                key="building"
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.1 } }}
                className="flex flex-col items-center justify-center gap-3 h-full"
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                      className="w-2 h-2 rounded-full bg-coral/60"
                    />
                  ))}
                </div>
                <p className="font-body text-sm text-charcoal/50">Building weekly steps...</p>
                <div className="w-36 h-1 rounded-full bg-light-gray overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-coral to-sage"
                  />
                </div>
              </motion.div>
            )}

            {(phase !== 'idle' && phase !== 'building') && (
              <motion.div
                key="weeks"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.1 } }}
                className="space-y-2.5"
              >
                {planRows.map((row, i) => {
                  const weekPhase = weekPhases[i];
                  const isVisible = weekPhases.indexOf(weekPhase as typeof weekPhases[number]) <= weekPhases.indexOf(phase as typeof weekPhases[number]) || phase === 'done';
                  return (
                    <motion.div
                      key={row.week}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <motion.div
                        animate={isVisible && weekPhases.indexOf(weekPhase) === weekPhases.indexOf(phase as typeof weekPhases[number]) ? { scale: [1, 1.025, 1] } : {}}
                        transition={{ duration: 0.3 }}
                        className="rounded-xl border border-light-gray bg-card-surface-alt px-4 py-3"
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.01, borderColor: 'rgba(232,93,62,0.2)' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-body text-xs font-bold text-coral">{row.week}</span>
                          {isVisible && phase !== 'idle' && (
                            <motion.div
                              initial={{ rotateY: 180, scale: 0 }}
                              animate={{ rotateY: 0, scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-[0_2px_8px_rgba(232,93,62,0.35)]"
                              style={{ transformStyle: 'preserve-3d', perspective: '300px' }}
                            >
                              <motion.span
                                initial={{ rotateY: 180 }}
                                animate={{ rotateY: 0 }}
                                transition={{ delay: 0.08, duration: 0.25 }}
                              >
                                <Star size={10} className="text-white" fill="white" />
                              </motion.span>
                            </motion.div>
                          )}
                        </div>
                        <p className="font-body text-sm text-charcoal/80 mt-1">{row.text}</p>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FloatingMockCard>
    </div>
  );
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('');
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [testimonialPaused, setTestimonialPaused] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [valuePropIdx, setValuePropIdx] = useState(0);
  const [heroVideoIdx, setHeroVideoIdx] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const valueProps = ['next move', 'insight', 'confidence', 'connection'];
  const testimonialResumeTimer = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const { scrollYProgress: pageProgress } = useScroll();
  const { scrollYProgress: howItWorksProgress } = useScroll({
    target: howItWorksRef,
    offset: ['start end', 'end start'],
  });
  const heroBgY = useTransform(scrollYProgress, [0, 1], ['0px', '110px']);
  const heroGlowX = useTransform(scrollYProgress, [0, 1], ['12%', '28%']);
  const heroGlowY = useTransform(scrollYProgress, [0, 1], ['18%', '38%']);
  const heroGlowBackground = useTransform(
    [heroGlowX, heroGlowY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(232, 93, 62, 0.08), transparent 36%)`
  );
  const parallaxShape1 = useTransform(scrollYProgress, [0, 1], ['0px', '-80px']);
  const parallaxShape2 = useTransform(scrollYProgress, [0, 1], ['0px', '120px']);
  const parallaxShape3 = useTransform(scrollYProgress, [0, 1], ['0px', '-40px']);
  // Scroll-linked step card transforms — continuous, not triggered
  // Mouse tracking for cursor-responsive ambient gradient
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: parallaxProgress } = useScroll({
    target: parallaxRef,
    offset: ['start end', 'end start'],
  });
  const floatOffset1 = useTransform(pageProgress, [0, 1], ['0px', '-120px']);
  const floatOffset2 = useTransform(pageProgress, [0, 1], ['0px', '80px']);
  const floatOffset3 = useTransform(pageProgress, [0, 1], ['0px', '-60px']);
  const floatOffset4 = useTransform(pageProgress, [0, 1], ['0px', '100px']);

  // Hero exit transforms
  const heroExitOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroExitBlur = useTransform(scrollYProgress, [0, 1], ['blur(0px)', 'blur(6px)']);
  const heroExitScale = useTransform(scrollYProgress, [0, 1], [1, 0.97]);

  // Section-scoped exit refs
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLElement>(null);
  const testimonialRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);

  const { scrollYProgress: featuresProgress } = useScroll({ target: featuresRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: statsProgress } = useScroll({ target: statsRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: portalProgress } = useScroll({ target: portalRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: testimonialProgress } = useScroll({ target: testimonialRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: faqProgress } = useScroll({ target: faqRef, offset: ['start end', 'end start'] });

  // Unique exit transforms per section (maps 0.7→1.0 progress to exit values)
  const featuresExitOpacity = useTransform(featuresProgress, [0.7, 1], [1, 0]);
  const featuresExitX = useTransform(featuresProgress, [0.7, 1], ['0px', '-40px']);

  const statsExitOpacity = useTransform(statsProgress, [0.7, 1], [1, 0]);
  const statsExitScale = useTransform(statsProgress, [0.7, 1], [1, 0.92]);
  const statsExitFilter = useTransform(statsProgress, [0.7, 1], ['blur(0px)', 'blur(4px)']);

  const portalExitOpacity = useTransform(portalProgress, [0.7, 1], [1, 0]);
  const portalExitRotateY = useTransform(portalProgress, [0.7, 1], [0, -8]);
  const portalExitScale = useTransform(portalProgress, [0.7, 1], [1, 0.94]);

  const testimonialExitOpacity = useTransform(testimonialProgress, [0.7, 1], [1, 0]);
  const testimonialExitScale = useTransform(testimonialProgress, [0.7, 1], [1, 0.95]);

  const howItWorksExitOpacity = useTransform(howItWorksProgress, [0.7, 1], [1, 0]);
  const howItWorksExitY = useTransform(howItWorksProgress, [0.7, 1], ['0px', '60px']);
  const howItWorksExitScale = useTransform(howItWorksProgress, [0.7, 1], [1, 0.95]);

  const faqExitOpacity = useTransform(faqProgress, [0.7, 1], [1, 0]);
  const faqExitY = useTransform(faqProgress, [0.7, 1], ['0px', '-30px']);

  const ambientGradient = useTransform(
    pageProgress,
    [0, 0.3, 0.6, 1],
    [
      'radial-gradient(800px at 20% 20%, rgba(232,93,62,0.04) 0%, transparent 70%)',
      'radial-gradient(800px at 70% 40%, rgba(167,189,165,0.04) 0%, transparent 70%)',
      'radial-gradient(800px at 40% 70%, rgba(232,93,62,0.03) 0%, transparent 70%)',
      'radial-gradient(800px at 60% 30%, rgba(167,189,165,0.03) 0%, transparent 70%)',
    ]
  );

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      setShowBackToTop(y > 600);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const testimonialIdxRef = useRef(testimonialIdx);
  testimonialIdxRef.current = testimonialIdx;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileMenu(false);
      if (e.key === 'ArrowLeft') changeTestimonial(testimonialIdxRef.current - 1);
      if (e.key === 'ArrowRight') changeTestimonial(testimonialIdxRef.current + 1);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      if (testimonialPaused) return;
      setTestimonialIdx((current) => (current + 1) % testimonials.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [testimonialPaused, shouldReduceMotion]);

  useEffect(() => {
    return () => {
      if (testimonialResumeTimer.current) window.clearTimeout(testimonialResumeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setValuePropIdx(i => (i + 1) % valueProps.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [shouldReduceMotion, valueProps.length]);

  // Auto-advance hero video every 6s with preload for seamless crossfade
  useEffect(() => {
    if (shouldReduceMotion) return;
    const nextIdx = (heroVideoIdx + 1) % HERO_VIDEOS.length;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = HERO_VIDEOS[nextIdx].src;
    document.head.appendChild(link);
    return () => { if (link.parentNode) link.parentNode.removeChild(link); };
  }, [heroVideoIdx, shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      setHeroVideoIdx(prev => (prev + 1) % HERO_VIDEOS.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [shouldReduceMotion]);

  const pauseTestimonials = () => {
    if (testimonialResumeTimer.current) window.clearTimeout(testimonialResumeTimer.current);
    setTestimonialPaused(true);
  };
  const resumeTestimonialsSoon = () => {
    if (testimonialResumeTimer.current) window.clearTimeout(testimonialResumeTimer.current);
    testimonialResumeTimer.current = window.setTimeout(() => setTestimonialPaused(false), 3000);
  };
  const changeTestimonial = (idx: number) => {
    pauseTestimonials();
    resumeTestimonialsSoon();
    setTestimonialIdx((idx + testimonials.length) % testimonials.length);
  };

  const [navTransition, setNavTransition] = useState(false);
  const navigateWithTransition = (sectionId: string) => {
    setNavTransition(true);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => setNavTransition(false), 400);
    }, 400);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Page transition overlay — fade in/out on nav click */}
      <motion.div
        className="fixed inset-0 z-[100] bg-black pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: navTransition ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'bg-[#0a0a0f]/92 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_40px_rgba(0,0,0,0.5)]' : 'bg-[#0a0a0f]/40 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-12 h-16 md:h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-1 group">
            <span className="font-display text-xl md:text-2xl font-semibold text-white tracking-tight group-hover:text-coral transition-colors duration-300">NextStep</span>
            <span className="text-coral text-[10px] font-body font-bold">●</span>
            <span className="font-body text-[11px] font-semibold text-white/60 tracking-wider">AI</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); navigateWithTransition('how-it-works'); }} className="landing-nav-link nav-text text-white/50 hover:text-white transition-colors duration-300">How It Works</a>
            <a href="#parents" onClick={(e) => { e.preventDefault(); navigateWithTransition('parents'); }} className="landing-nav-link nav-text text-white/50 hover:text-white transition-colors duration-300">Features</a>
            <a href="#stories" onClick={(e) => { e.preventDefault(); navigateWithTransition('stories'); }} className="landing-nav-link nav-text text-white/50 hover:text-white transition-colors duration-300">Testimonials</a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className="btn-text px-5 py-2.5 rounded-lg text-white/70 hover:bg-white/[0.08] hover:text-white transition-all duration-300">Log In</Link>
            <MagneticWrap>
              <Link to="/signup" className="relative btn-text px-6 py-2.5 rounded-[10px] bg-gradient-to-b from-coral to-coral-900 text-white shadow-[0_4px_20px_rgba(232,93,62,0.25)] hover:shadow-[0_6px_30px_rgba(232,93,62,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                Get Started
              </Link>
            </MagneticWrap>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 text-white/60 hover:text-white transition-colors">
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-gradient-to-r from-coral to-coral-dark origin-left"
        style={{ scaleX: pageProgress }}
      />

      {/* Scroll-linked ambient gradient — Stripe-inspired living background */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: ambientGradient }}
      />
      {/* Cursor-responsive gradient overlay — follows mouse */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(800px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(232,93,62,0.03) 0%, transparent 70%)`,
        }}
      />

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-40 bg-charcoal w-full max-w-sm pt-24 px-8 lg:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-6">
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); setMobileMenu(false); navigateWithTransition('how-it-works'); }} className="text-white/80 text-lg font-body hover:text-white transition-colors">How It Works</a>
              <a href="#parents" onClick={(e) => { e.preventDefault(); setMobileMenu(false); navigateWithTransition('parents'); }} className="text-white/80 text-lg font-body hover:text-white transition-colors">Clarity Check</a>
              <a href="#stories" onClick={(e) => { e.preventDefault(); setMobileMenu(false); navigateWithTransition('stories'); }} className="text-white/80 text-lg font-body hover:text-white transition-colors">Parent Stories</a>
              <div className="border-t border-white/10 pt-6 mt-2 flex flex-col gap-4">
                <Link to="/login" onClick={() => setMobileMenu(false)} className="text-white text-lg font-body hover:text-coral transition-colors">Log In</Link>
                <Link to="/signup" onClick={() => setMobileMenu(false)} className="btn-text px-5 py-3.5 rounded-[10px] bg-coral-900 text-white text-center hover:bg-coral transition-colors">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="min-h-screen pt-24 md:pt-[72px] flex items-center relative overflow-hidden bg-charcoal"
      >
        {/* Video background — cinematic crossfade playlist */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <AnimatePresence>
            <motion.video
              key={heroVideoIdx}
              autoPlay
              muted
              playsInline
              preload="auto"
              poster={HERO_VIDEOS[heroVideoIdx].poster}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                animation: shouldReduceMotion ? 'none' : 'hero-zoom 12s ease-in-out infinite alternate',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            >
              <source src={HERO_VIDEOS[heroVideoIdx].src} type="video/mp4" />
            </motion.video>
          </AnimatePresence>
        </div>

        {/* Cinematic gradient overlays — heavy dark falloff for premium text readability */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0a0a0f]/98 via-[#0a0a0f]/60 via-50% to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/30 via-60% to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0a0f]/30 via-transparent to-transparent pointer-events-none" />
        {/* Bottom edge fade to transition smoothly into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 z-[1] bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/80 to-transparent pointer-events-none" />

        {/* Parallax depth shapes on top of images */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              aria-hidden="true"
              className="absolute w-[340px] h-[340px] rounded-full pointer-events-none opacity-40"
              style={{
                y: parallaxShape1,
                top: '10%',
                right: '8%',
                background: 'radial-gradient(circle, rgba(167, 189, 165, 0.15), transparent 65%)',
                willChange: 'transform',
              }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute w-[200px] h-[200px] rounded-full pointer-events-none opacity-30"
              style={{
                y: parallaxShape2,
                bottom: '5%',
                left: '3%',
                background: 'radial-gradient(circle, rgba(232, 93, 62, 0.08), transparent 65%)',
                willChange: 'transform',
              }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute w-[120px] h-[120px] pointer-events-none opacity-15"
              style={{
                y: parallaxShape3,
                top: '30%',
                left: '55%',
                border: '2px solid rgba(232,93,62,0.1)',
                borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                willChange: 'transform',
              }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                y: heroBgY,
                background: 'radial-gradient(circle at 78% 24%, rgba(232, 93, 62, 0.06), transparent 34%)',
                willChange: 'transform',
              }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: heroGlowBackground,
              }}
            />
            {[
              { size: 280, top: '15%', left: '5%', delay: 0, duration: 12 },
              { size: 180, top: '60%', left: '75%', delay: 2, duration: 16 },
              { size: 220, top: '75%', left: '20%', delay: 4, duration: 14 },
            ].map((orb) => (
              <motion.div
                key={orb.delay}
                aria-hidden="true"
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: orb.size,
                  height: orb.size,
                  top: orb.top,
                  left: orb.left,
                  background: `radial-gradient(circle, rgba(232, 93, 62, 0.05), transparent 65%)`,
                }}
                animate={{
                  y: [0, -28, 8, -18, 0],
                  x: [0, 16, -12, 8, 0],
                  scale: [1, 1.06, 0.94, 1.02, 1],
                }}
                transition={{
                  duration: orb.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: orb.delay,
                }}
              />
            ))}
          </>
        )}

        {/* Exit wrapper — blur + fade + scale as user scrolls past */}
        <motion.div
          className="relative z-[3] w-full"
          style={shouldReduceMotion ? undefined : {
            opacity: heroExitOpacity,
            scale: heroExitScale,
            filter: heroExitBlur,
          }}
        >
          <div className="max-w-7xl mx-auto px-5 md:px-12 w-full">
            <div className="grid lg:grid-cols-[55%_45%] gap-12 lg:gap-8 items-center">
              <div className="md:bg-[#0a0a0f]/70 md:backdrop-blur-lg md:rounded-2xl md:p-10 md:-ml-10 md:border md:border-white/[0.08] md:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                <motion.p
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="label-text text-coral mb-4"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                >
                  Report Card Clarity for Every Parent
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
                  className="font-display text-[40px] md:text-[72px] font-medium text-white leading-[1.0] tracking-tight mb-6"
                  style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
                >
                  Turn your child's report card into your{' '}
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={valueProps[valuePropIdx]}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="value-fill-text font-bold leading-[1.3]"
                      data-text={valueProps[valuePropIdx]}
                      style={{
                        filter: 'drop-shadow(0 3px 15px rgba(0,0,0,0.5))',
                      }}
                    >
                      {valueProps[valuePropIdx]}
                    </motion.span>
                  </AnimatePresence>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}
                  className="font-body text-lg md:text-xl text-white/90 max-w-[480px] mb-8 leading-relaxed"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                >
                  Upload a report card. Get a clear, honest breakdown of what matters — plus the exact words to use with your child and their teacher.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}
                  className="flex flex-wrap gap-4 mb-8"
                >
                  <MagneticWrap>
                    <Link to="/signup" className="relative btn-text px-8 py-4 rounded-[12px] bg-gradient-to-b from-coral to-coral-900 text-white shadow-[0_4px_25px_rgba(232,93,62,0.3)] hover:shadow-[0_8px_40px_rgba(232,93,62,0.45)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2.5 overflow-hidden group">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                      Upload a Report Card <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </MagneticWrap>
                  <MagneticWrap>
                    <a href="#how-it-works" onClick={(e) => { e.preventDefault(); navigateWithTransition('how-it-works'); }} className="btn-text px-8 py-4 rounded-[12px] border-[1.5px] border-white/30 text-white/90 hover:bg-white hover:text-charcoal hover:border-white transition-all duration-300">
                      See How It Works
                    </a>
                  </MagneticWrap>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full bg-white/15 border-2 border-charcoal/40 flex items-center justify-center text-[9px] font-body font-bold text-white">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="font-body text-sm text-white/80">Join <CountUp value={2500} suffix="+" /> parents getting clarity this term</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.4 }}
                className="relative"
              >
                <GlowTiltCard>
                  <div className="rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.25)] bg-white/[0.08] backdrop-blur-xl border border-white/20 aspect-[4/3] flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-coral/[0.08] via-transparent to-sage/[0.04]" />
                    <div className="text-center p-8 relative z-[1]">
                      <motion.div
                        animate={shouldReduceMotion ? undefined : { scale: [1, 1.06, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-4"
                      >
                        <motion.span
                          animate={shouldReduceMotion ? undefined : { scale: [1, 1.1, 1] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <Heart size={32} className="text-coral" />
                        </motion.span>
                      </motion.div>
                      <p className="font-display text-2xl text-white mb-2 drop-shadow-lg">Every report card tells a story</p>
                      <p className="font-body text-white/70">We help you read between the grades</p>
                    </div>
                  </div>
                </GlowTiltCard>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                  className="absolute -bottom-6 -left-6 md:-left-10 bg-white/20 backdrop-blur-xl border border-white/15 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-4 w-[200px]"
                >
                  <p className="label-text text-coral mb-2">Clarity Check</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sage shadow-[0_0_6px_rgba(122,155,138,0.4)]" /><span className="font-body text-xs text-white/80">Math — On Track</span></div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber shadow-[0_0_6px_rgba(212,160,58,0.4)]" /><span className="font-body text-xs text-white/80">Science — Watch</span></div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-coral shadow-[0_0_6px_rgba(232,93,62,0.4)]" /><span className="font-body text-xs text-white/80">English — Address</span></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Parallax depth shapes — floating geometric orbs behind content */}
      <div ref={parallaxRef} aria-hidden="true" className="relative pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{
            y: floatOffset1,
            top: '10%',
            left: '-5%',
            background: 'radial-gradient(circle, rgba(232,93,62,0.5), transparent 70%)',
            filter: 'blur(60px)',
            willChange: 'transform',
          }}
        />
        <motion.div
          className="absolute w-[350px] h-[350px] rounded-full opacity-[0.03]"
          style={{
            y: floatOffset2,
            top: '45%',
            right: '-3%',
            background: 'radial-gradient(circle, rgba(167,189,165,0.6), transparent 70%)',
            filter: 'blur(50px)',
            willChange: 'transform',
          }}
        />
        <motion.div
          className="absolute w-[280px] h-[280px] opacity-[0.025]"
          style={{
            y: floatOffset3,
            top: '75%',
            left: '8%',
            background: 'radial-gradient(circle, rgba(232,93,62,0.4), transparent 70%)',
            filter: 'blur(45px)',
            borderRadius: '40% 60% 60% 40% / 60% 30% 70% 40%',
            willChange: 'transform',
          }}
        />
        <motion.div
          className="absolute w-[200px] h-[200px] opacity-[0.03]"
          style={{
            y: floatOffset4,
            top: '25%',
            right: '15%',
            background: 'radial-gradient(circle, rgba(167,189,165,0.5), transparent 70%)',
            filter: 'blur(40px)',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            willChange: 'transform',
          }}
        />
      </div>

      {/* How It Works */}
      <section id="how-it-works" ref={howItWorksRef} className="py-16 md:py-28 relative overflow-hidden" style={{ background: '#0e0e14' }}>
        {/* Subtle ambient glow */}
        <div aria-hidden="true" className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,93,62,0.8), transparent 70%)', filter: 'blur(80px)', transform: 'translate(-50%, -50%)' }} />
        <motion.div
          className="max-w-7xl mx-auto px-5 md:px-12 relative"
          style={shouldReduceMotion ? undefined : {
            opacity: howItWorksExitOpacity,
            y: howItWorksExitY,
            scale: howItWorksExitScale,
          }}
        >
          <motion.p
            className="label-text text-coral/70 text-center mb-3 tracking-[0.15em]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            How It Works
          </motion.p>
          <motion.h2
            className="font-display text-[32px] md:text-[56px] font-medium text-white text-center mb-3 leading-tight"
            initial={shouldReduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
            whileInView={shouldReduceMotion ? undefined : { clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            Three steps to clarity
          </motion.h2>
          <motion.p
            className="font-body text-white/50 text-center mb-12 md:mb-16 max-w-xl mx-auto"
            initial={shouldReduceMotion ? false : { y: 18 }}
            whileInView={shouldReduceMotion ? undefined : { y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            From upload to actionable plan — in minutes, not hours.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
            {[
              { num: '01', title: 'Upload', desc: "Snap or upload your child's report card. We support all major school boards and formats.", icon: <Upload size={28} /> },
              { num: '02', title: 'AI Analysis', desc: 'Our system reads grades, comments, and patterns. We understand context, not just numbers.', icon: <Brain size={28} /> },
              { num: '03', title: 'Your Plan', desc: 'Get personalized flags, talking points, and a 30-day plan tailored to your child.', icon: <FileText size={28} /> },
            ].map((step, i) => (
              <div key={step.num} className="group relative">
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 h-full hover:border-white/[0.15] transition-all duration-500">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="font-display text-[40px] md:text-[48px] font-semibold leading-none text-white/20">{step.num}</span>
                    <span className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/50">
                      {step.icon}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-medium text-white mb-3">{step.title}</h3>
                  <p className="font-body text-white/60 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Feature Highlights */}
      <section id="parents" ref={featuresRef} className="py-16 md:py-28 relative overflow-hidden" style={{ background: '#12121a' }}>
        <div aria-hidden="true" className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(167,189,165,0.6), transparent 70%)', filter: 'blur(80px)' }} />
        <motion.div
          className="max-w-7xl mx-auto px-5 md:px-12 space-y-24 md:space-y-32"
          style={shouldReduceMotion ? undefined : {
            opacity: featuresExitOpacity,
            x: featuresExitX,
          }}
        >
          <div className="text-center mb-4">
            <motion.p
              className="label-text text-sage/70 text-center mb-3 tracking-[0.15em]"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              Features
            </motion.p>
            <motion.h2
              className="font-display text-[32px] md:text-[60px] font-medium mb-3 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-sage"
              initial={shouldReduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
              whileInView={shouldReduceMotion ? undefined : { clipPath: 'inset(0 0% 0 0)' }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              Tools that make a difference
            </motion.h2>
          </div>
          {[
            { label: 'CLARITY CHECK', title: "Know what's worth worrying about", desc: "Our AI flags each subject as green, yellow, or red — with gentle, advisory language. No predictions about your child's future. Just clear, actionable insights.", bullets: ['Board-specific grade interpretation', 'Soft, non-judgmental language', 'Teacher comment analysis'] },
            { label: "TONIGHT'S CONVERSATION", title: 'Talk to your child with confidence', desc: 'Get a personalized conversation script that opens dialogue instead of interrogation. Connection-focused phrasing that strengthens your relationship.', bullets: ['Age-appropriate language', 'Connection over evaluation', 'Copy-paste ready scripts'] },
            { label: '30-DAY PLAN', title: 'Small habits, real progress', desc: 'A concrete, week-by-week action plan tied directly to what was flagged. Not generic advice — targeted steps that address the specific areas from the report card.', bullets: ['Daily and weekly actions', 'Progress tracking', 'Evidence-based suggestions'] },
          ].map((feature, i) => {
            const featureEntrance = [
              { initial: { opacity: 0, x: -50, scale: 0.94 }, whileInView: { opacity: 1, x: 0, scale: 1 } },
              { initial: { opacity: 0, scale: 0.9, rotateY: 8 }, whileInView: { opacity: 1, scale: 1, rotateY: 0 } },
              { initial: { opacity: 0, y: 50, skewX: '-3deg' }, whileInView: { opacity: 1, y: 0, skewX: '0deg' } },
            ];
            return (
            <motion.div
              key={feature.label}
              initial={shouldReduceMotion ? false : featureEntrance[i].initial}
              whileInView={shouldReduceMotion ? undefined : featureEntrance[i].whileInView}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${i % 2 !== 0 ? 'md:[direction:rtl]' : ''}`}>
                <div className={`${i % 2 !== 0 ? 'md:[direction:ltr]' : ''}`}>
                  <motion.p
                    className="label-text text-coral mb-3"
                    initial={shouldReduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
                    whileInView={shouldReduceMotion ? undefined : { clipPath: 'inset(0 0% 0 0)' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {feature.label}
                  </motion.p>
                  <motion.h3
                    className="font-display text-[28px] md:text-[42px] font-normal text-white leading-tight mb-4"
                    initial={shouldReduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
                    whileInView={shouldReduceMotion ? undefined : { clipPath: 'inset(0 0% 0 0)' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    className="font-body text-lg text-white/60 leading-relaxed mb-6"
                    initial={shouldReduceMotion ? false : { y: 15 }}
                    whileInView={shouldReduceMotion ? undefined : { y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {feature.desc}
                  </motion.p>
                  <motion.ul
                    className="space-y-3"
                    initial={shouldReduceMotion ? false : 'hidden'}
                    whileInView={shouldReduceMotion ? undefined : 'visible'}
                    viewport={{ once: true, margin: '-40px' }}
                    variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                  >
                    {feature.bullets.map(b => (
                      <motion.li
                        key={b}
                        variants={shouldReduceMotion ? undefined : { hidden: { opacity: 0, x: -15 }, visible: { opacity: 1, x: 0 } }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="flex items-center gap-3"
                      >
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber to-coral flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Star size={10} className="text-white" fill="white" />
                        </span>
                        <span className="font-body text-white/70">{b}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
                <div className="glass-card-premium overflow-hidden">
                  {feature.label === 'CLARITY CHECK' ? (
                    <AnimatedClarityCheck />
                  ) : feature.label === "TONIGHT'S CONVERSATION" ? (
                    <AnimatedConversation />
                  ) : (
                    <AnimatedDayPlan />
                  )}
                </div>
              </div>
            </motion.div>
          );
                    })}
        </motion.div>
      </section>

      {/* Stats Counter Bar — dramatic count-up strip */}
      <section ref={statsRef} className="py-16 md:py-24 relative overflow-hidden" style={{ background: '#0a0a0f' }}>
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(800px_at_50%_50%,rgba(232,93,62,0.06),transparent_70%)]" />
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.03]"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            background: 'radial-gradient(600px at 30% 40%, rgba(232,93,62,0.8), transparent 70%), radial-gradient(500px at 70% 60%, rgba(122,155,138,0.6), transparent 70%)',
            backgroundSize: '200% 200%',
          }}
        />
        <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-coral/20 to-transparent" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-coral/20 to-transparent" />
        <motion.div
          className="max-w-7xl mx-auto px-5 md:px-12 relative"
          style={shouldReduceMotion ? undefined : {
            opacity: statsExitOpacity,
            scale: statsExitScale,
            filter: statsExitFilter,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { value: 2500, suffix: '+', label: 'Reports analyzed this term' },
              { value: 95, suffix: '%', label: 'Parents find it helpful' },
              { value: 50, suffix: '+', label: 'School boards supported' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center relative"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="font-display text-[52px] md:text-[72px] font-semibold leading-none mb-3" style={{ color: '#E85D3E', textShadow: '0 0 30px rgba(232,93,62,0.3), 0 0 60px rgba(232,93,62,0.1), 0 0 100px rgba(232,93,62,0.05)' }}>
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="font-body text-sm md:text-base text-white/50 max-w-[200px] mx-auto">{stat.label}</p>
                {i < 2 && <div className="hidden md:block absolute right-[-1.5rem] top-1/2 -translate-y-1/2 w-[1px] h-12 bg-white/[0.06]" />}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Role Entry */}
      <section ref={portalRef} className="py-16 md:py-28 relative overflow-hidden" style={{ background: '#0e0e14' }}>
        <div aria-hidden="true" className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,93,62,0.6), transparent 70%)', filter: 'blur(60px)' }} />
        <motion.div
          className="max-w-7xl mx-auto px-5 md:px-12"
          style={shouldReduceMotion ? undefined : {
            opacity: portalExitOpacity,
            rotateY: portalExitRotateY,
            scale: portalExitScale,
          }}
        >
          <motion.p
            className="label-text text-coral/70 text-center mb-3 tracking-[0.15em]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Portal
          </motion.p>
          <motion.h2
            className="font-body text-[32px] md:text-[56px] font-light text-center mb-3 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-coral to-coral/50"
            initial={shouldReduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
            whileInView={shouldReduceMotion ? undefined : { clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            Built for everyone in your school community
          </motion.h2>
          <motion.p
            className="font-body text-lg text-white/60 text-center mb-12"
            initial={shouldReduceMotion ? false : { y: 12 }}
            whileInView={shouldReduceMotion ? undefined : { y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Choose your portal to get started
          </motion.p>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {portalCards.map((role, i) => (
              <motion.div
                key={role.title}
                initial={shouldReduceMotion ? false : i === 0 ? { opacity: 0, x: -80, rotate: -6, scale: 0.9 } : i === 1 ? { opacity: 0, y: 60, rotate: 3, scale: 0.88 } : { opacity: 0, x: 80, rotate: -4, scale: 0.9 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
              <TiltCard className="h-full" tiltDegree={5} liftY={-6}>
                <GlowTiltCard className="h-full">
                  <Link
                    to={role.link}
                    className="glass-card-premium flex h-full min-h-[380px] flex-col p-8 group scroll-mt-28 hover:bg-white/[0.07] transition-all duration-500"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="group-hover:scale-110 transition-transform duration-300">{role.icon}</div>
                      <span className="font-body text-xs font-semibold tracking-[0.22em] text-white/20">0{i + 1}</span>
                    </div>
                    <h3 className="font-display text-2xl font-medium text-white mb-3">{role.title}</h3>
                    <p className="font-body text-white/60 leading-relaxed min-h-[84px]">{role.desc}</p>
                    <div className="my-6 grid gap-2">
                      {role.points.map(point => (
                        <div key={point} className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 group-hover:bg-white/[0.05] transition-colors duration-300">
                          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-sage to-sage/70 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Star size={9} className="text-white" fill="white" />
                          </span>
                          <span className="font-body text-sm text-white/70">{point}</span>
                        </div>
                      ))}
                    </div>
                    <span className="mt-auto font-body text-sm font-semibold text-coral inline-flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
                      {role.cta} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </GlowTiltCard>
              </TiltCard>
            </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section id="stories" ref={testimonialRef} className="py-16 md:py-28 relative overflow-hidden" style={{ background: '#12121a' }}>
        <div aria-hidden="true" className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(167,189,165,0.5), transparent 70%)', filter: 'blur(70px)' }} />
        <motion.div
          className="max-w-7xl mx-auto px-5 md:px-12"
          style={shouldReduceMotion ? undefined : {
            opacity: testimonialExitOpacity,
            scale: testimonialExitScale,
          }}
        >
          <motion.p
            className="label-text text-sage/70 text-center mb-3 tracking-[0.15em]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Stories
          </motion.p>
          <motion.h2
            className="font-display text-[32px] md:text-[56px] font-medium text-center mb-12 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-sage to-white"
            initial={shouldReduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
            whileInView={shouldReduceMotion ? undefined : { clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            What parents are saying
          </motion.h2>
          <div className="relative" onMouseEnter={pauseTestimonials} onMouseLeave={resumeTestimonialsSoon}>
            <div className="relative min-h-[330px] md:min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIdx}
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="grid md:grid-cols-2 gap-6 absolute inset-0"
                >
                  {[0, 1].map((offset) => {
                    const t = testimonials[(testimonialIdx + offset) % testimonials.length];
                    return (
                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.92, y: 20 }}
                        whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 180, damping: 15, delay: offset * 0.1 }}
                        className="h-full"
                      >
                      <GlowTiltCard key={`${testimonialIdx}-${t.name}`} className="h-full">
                        <div className="glass-card-premium p-8 h-full flex flex-col">
                          <span aria-hidden="true" className="absolute top-4 left-6 text-6xl font-display text-coral/10 leading-none select-none">"</span>
                          <p className="font-display text-lg md:text-xl text-white/85 italic leading-relaxed mb-6 flex-1 relative z-[1]">"{t.text}"</p>
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-display font-semibold shrink-0 shadow-md ${avatarColors[testimonials.indexOf(t) % avatarColors.length]}`}>
                              {getInitials(t.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-body font-medium text-white truncate">{t.name}</p>
                              <p className="font-body text-sm text-white/50 truncate">{t.role}</p>
                            </div>
                            <div className="ml-auto flex gap-0.5 shrink-0">
                              {Array.from({ length: 5 }).map((_, si) => (
                                <motion.span
                                  key={si}
                                  initial={shouldReduceMotion ? undefined : { scale: 0, opacity: 0 }}
                                  whileInView={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: si * 0.08 + 0.1, type: 'spring', stiffness: 400, damping: 12 }}
                                  className={`text-sm ${si < t.stars ? 'text-amber drop-shadow-[0_0_4px_rgba(212,160,58,0.3)]' : 'text-white/15'}`}
                                >
                                  ★
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </GlowTiltCard>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => changeTestimonial(testimonialIdx - 1)}
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white/60 hover:bg-white/[0.1] hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {testimonials.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => changeTestimonial(i)}
                  animate={{
                    scale: i === testimonialIdx ? 1.4 : 1,
                    opacity: i === testimonialIdx ? 1 : 0.45,
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${i === testimonialIdx ? 'bg-coral shadow-[0_0_8px_rgba(232,93,62,0.4)]' : 'bg-white/20'}`}
                />
              ))}
              <button
                onClick={() => changeTestimonial(testimonialIdx + 1)}
                className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white/60 hover:bg-white/[0.1] hover:text-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" ref={faqRef} className="py-16 md:py-28 relative overflow-hidden" style={{ background: '#0e0e14' }}>
        <div aria-hidden="true" className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,93,62,0.5), transparent 70%)', filter: 'blur(60px)' }} />
        <motion.div
          className="max-w-3xl mx-auto px-5 md:px-12"
          style={shouldReduceMotion ? undefined : {
            opacity: faqExitOpacity,
            y: faqExitY,
          }}
        >
          <motion.p
            className="label-text text-coral/70 text-center mb-3 tracking-[0.15em]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            FAQ
          </motion.p>
          <motion.h2
            className="font-display text-[30px] md:text-[44px] font-semibold text-center mb-12 leading-tight text-sage"
            initial={shouldReduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
            whileInView={shouldReduceMotion ? undefined : { clipPath: 'inset(0 0% 0 0)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            Common questions
          </motion.h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const itemReveal = [
                { opacity: 0, x: -40 },
                { opacity: 0, scale: 0.95 },
                { opacity: 0, x: 40 },
                { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
                { opacity: 0, y: 25, rotate: -1 },
              ];
              return (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? false : itemReveal[i]}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, clipPath: 'inset(0 0 0% 0)' }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card-premium rounded-xl hover:bg-white/[0.06] transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group"
                >
                  <span className="font-display text-lg md:text-xl font-medium text-white pr-4 group-hover:text-coral transition-colors duration-300">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="text-coral text-xl flex-shrink-0 w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center group-hover:bg-coral/20 transition-colors duration-300"
                  >
                    +
                  </motion.span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="font-body text-white/60 px-6 pb-5 leading-relaxed max-w-xl">{faq.a}</p>
                  </motion.div>
              </motion.div>
            );
            })}
          </div>
        </motion.div>
      </section>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-gradient-to-b from-coral to-coral-900 text-white shadow-[0_4px_20px_rgba(232,93,62,0.3)] hover:shadow-[0_6px_30px_rgba(232,93,62,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
            aria-label="Back to top"
          >
            <ChevronUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-charcoal pt-16 md:pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr] gap-10 mb-14">
            <div>
              <span className="font-display text-2xl font-semibold text-white tracking-tight">NextStep<span className="text-gradient-coral">.AI</span></span>
              <p className="font-body text-sm text-white/50 mt-3 leading-relaxed max-w-[240px]">Turn your child's report card into your next move.</p>
              <div className="flex items-center gap-3 mt-6">
                <span className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:bg-coral/20 hover:text-coral hover:shadow-[0_0_20px_rgba(232,93,62,0.15)] transition-all duration-300 cursor-default" aria-label="Email">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <span className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:bg-sage/20 hover:text-sage hover:shadow-[0_0_20px_rgba(122,155,138,0.15)] transition-all duration-300 cursor-default" aria-label="Twitter">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </span>
                <span className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:bg-coral/20 hover:text-coral hover:shadow-[0_0_20px_rgba(232,93,62,0.15)] transition-all duration-300 cursor-default" aria-label="LinkedIn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </span>
              </div>
            </div>
            <div>
              <p className="label-text text-white/40 mb-4">Product</p>
              <ul className="space-y-3">
                <li><span className="font-body text-sm text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block cursor-default">For Parents</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block cursor-default">For Teachers</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block cursor-default">For Schools</span></li>
              </ul>
            </div>
            <div>
              <p className="label-text text-white/40 mb-4">Company</p>
              <ul className="space-y-3">
                <li><span className="font-body text-sm text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block cursor-default">About</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block cursor-default">Blog</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block cursor-default">Support</span></li>
              </ul>
            </div>
            <div>
              <p className="label-text text-white/40 mb-4">Legal</p>
              <ul className="space-y-3">
                <li><span className="font-body text-sm text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block cursor-default">Privacy</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block cursor-default">Terms</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block cursor-default">Data Security</span></li>
              </ul>
            </div>
            <div>
              <p className="label-text text-white/40 mb-4">Stay updated</p>
              <p className="font-body text-xs text-white/40 mb-3 leading-relaxed">Get tips and feature updates.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-3.5 py-2.5 font-body text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-coral/50 focus:bg-white/[0.08] transition-all duration-300"
                  aria-label="Email for newsletter"
                />
                <button className="shrink-0 bg-gradient-to-b from-coral to-coral-900 hover:from-coral-900 hover:to-coral-900 text-white rounded-lg px-4 py-2.5 transition-all duration-300 hover:shadow-[0_4px_15px_rgba(232,93,62,0.3)]" aria-label="Subscribe">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.08] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-sm text-white/40">© 2026 NextStep.AI. All rights reserved.</p>
            <p className="font-body text-xs text-white/30">Your child's data is private and secure.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
