import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Upload, Brain, FileText, Heart,
  Users, Building, ChevronLeft, ChevronRight, Menu, X, Check, Calendar
} from 'lucide-react';
import ScrollReveal from '@/components/shared/ScrollReveal';

const testimonials = [
  { name: 'Meera Krishnan', role: 'Parent of Grade 5 student', text: 'The AI analysis helped me understand what my daughter\'s teacher was really trying to say. The conversation guide made our talk so much more productive.' },
  { name: 'Ravi Nair', role: 'Parent of Grade 7 student', text: 'I used to dread report card day. Now I feel prepared. The 30-day plan gave us small, doable steps instead of overwhelming advice.' },
  { name: 'Anita Desai', role: 'Parent of twins in Grade 4', text: 'Being able to compare terms and see what actually worked was eye-opening. We could see the improvement from following the plan.' },
  { name: 'Suresh Patel', role: 'Parent of Grade 6 student', text: 'The questions for the teacher were spot-on. Our parent-teacher meeting was the most productive one we\'ve had.' },
  { name: 'Lakshmi Menon', role: 'Parent of Grade 8 student', text: 'I love that it doesn\'t make predictions about my son\'s future. It just gives clear, gentle guidance on what to do next.' },
];

const faqs = [
  { q: 'Is my child\'s data secure?', a: 'Absolutely. All report cards and analysis are stored with encryption. Your child\'s information is never shared with third parties. Teachers and admins cannot see your Clarity Check or conversation guides — only aggregate, anonymized data.' },
  { q: 'What school boards do you support?', a: 'We support CBSE, ICSE, IGCSE, and all major State Boards. Our AI understands the grading system for each board, so a "B" in CBSE is interpreted differently than a "B" in ICSE.' },
  { q: 'Can teachers see what parents see?', a: 'No. Teachers see class-level patterns and individual student flag summaries, but they cannot access your conversation scripts, teacher questions, or 30-day home plans. Your guidance is private to you.' },
  { q: 'How accurate is the AI analysis?', a: 'Our AI is designed to be supportive and advisory, not diagnostic. It identifies patterns in grades and comments, then suggests gentle next steps. Always consult your child\'s teacher for professional educational advice.' },
  { q: 'What if my child\'s school isn\'t using NextStep.AI?', a: 'Parents can use NextStep.AI independently. Simply upload your child\'s report card and select their school board. All features work the same way.' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-cream/95 backdrop-blur-md border-b border-light-gray' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-12 h-16 md:h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-0.5">
            <span className="font-display text-xl md:text-2xl font-semibold text-charcoal tracking-tight">NextStep</span>
            <span className="text-coral text-[10px] font-body font-bold">●</span>
            <span className="font-body text-[11px] font-semibold text-charcoal tracking-wider">AI</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#parents" className="nav-text text-medium-gray hover:text-charcoal transition-colors">For Parents</a>
            <a href="#teachers" className="nav-text text-medium-gray hover:text-charcoal transition-colors">For Teachers</a>
            <a href="#schools" className="nav-text text-medium-gray hover:text-charcoal transition-colors">For Schools</a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className="btn-text px-5 py-2.5 rounded-lg text-charcoal hover:bg-white/60 transition-colors">Log In</Link>
            <Link to="/signup" className="btn-text px-5 py-2.5 rounded-[10px] bg-coral text-white hover:bg-coral-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">Get Started</Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2">
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 bg-charcoal pt-20 px-6 lg:hidden">
          <div className="flex flex-col gap-4">
            <a href="#parents" onClick={() => setMobileMenu(false)} className="text-white/80 text-lg font-body">For Parents</a>
            <a href="#teachers" onClick={() => setMobileMenu(false)} className="text-white/80 text-lg font-body">For Teachers</a>
            <a href="#schools" onClick={() => setMobileMenu(false)} className="text-white/80 text-lg font-body">For Schools</a>
            <div className="border-t border-white/10 pt-4 mt-4 flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileMenu(false)} className="text-white text-lg font-body">Log In</Link>
              <Link to="/signup" onClick={() => setMobileMenu(false)} className="btn-text px-5 py-3 rounded-[10px] bg-coral text-white text-center">Get Started</Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen pt-24 md:pt-[72px] flex items-center">
        <div className="max-w-7xl mx-auto px-5 md:px-12 w-full">
          <div className="grid lg:grid-cols-[55%_45%] gap-12 lg:gap-8 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="label-text text-coral mb-4"
              >
                Report Card Clarity for Every Parent
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
                className="font-display text-[40px] md:text-[72px] font-medium text-charcoal leading-[1.0] tracking-tight mb-6"
              >
                Turn your child's report card into your{' '}
                <span className="relative inline-block">
                  next move
                  <motion.span
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
                    className="absolute bottom-1 left-0 right-0 h-[3px] bg-coral origin-left"
                  />
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}
                className="font-body text-lg md:text-xl text-charcoal/70 max-w-[480px] mb-8 leading-relaxed"
              >
                Upload a report card. Get a clear, honest breakdown of what matters — plus the exact words to use with your child and their teacher.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}
                className="flex flex-wrap gap-4 mb-8"
              >
                <Link to="/signup" className="btn-text px-7 py-3.5 rounded-[10px] bg-coral text-white hover:bg-coral-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2">
                  Upload a Report Card <ArrowRight size={16} />
                </Link>
                <a href="#how-it-works" className="btn-text px-7 py-3.5 rounded-[10px] border-[1.5px] border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-250">
                  See How It Works
                </a>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                className="flex items-center gap-3"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full bg-coral/15 border-2 border-cream flex items-center justify-center text-[9px] font-body font-bold text-coral">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="font-body text-sm text-medium-gray">Join 2,500+ parents getting clarity this term</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.4 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-card bg-gradient-to-br from-[#E8DDD0] to-[#D4C4B0] aspect-[4/3] flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-coral/15 flex items-center justify-center mx-auto mb-4">
                    <Heart size={32} className="text-coral" />
                  </div>
                  <p className="font-display text-2xl text-charcoal mb-2">Every report card tells a story</p>
                  <p className="font-body text-charcoal/60">We help you read between the grades</p>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                className="absolute -bottom-6 -left-6 md:-left-10 bg-white rounded-xl shadow-card-hover p-4 w-[200px]"
              >
                <p className="label-text text-coral mb-2">Clarity Check</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sage" /><span className="font-body text-xs text-charcoal/70">Math — On Track</span></div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber" /><span className="font-body text-xs text-charcoal/70">Science — Watch</span></div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-coral" /><span className="font-body text-xs text-charcoal/70">English — Address</span></div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <ScrollReveal>
            <h2 className="font-display text-[32px] md:text-[56px] font-medium text-charcoal text-center mb-16">Three steps to clarity</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            {[
              { num: '01', title: 'Upload', desc: "Snap or upload your child's report card. We support all major school boards and formats.", icon: <Upload size={28} className="text-coral" /> },
              { num: '02', title: 'AI Analysis', desc: 'Our system reads grades, comments, and patterns. We understand context, not just numbers.', icon: <Brain size={28} className="text-coral" /> },
              { num: '03', title: 'Your Plan', desc: 'Get personalized flags, talking points, and a 30-day plan tailored to your child.', icon: <FileText size={28} className="text-coral" /> },
            ].map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 0.15}>
                <div className="text-center md:text-left">
                  <span className="font-display text-[72px] font-normal text-coral/15 leading-none">{step.num}</span>
                  <div className="flex items-center gap-3 mt-2 mb-3">
                    {step.icon}
                    <h3 className="font-display text-2xl font-medium text-charcoal">{step.title}</h3>
                  </div>
                  <p className="font-body text-charcoal/70 leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-5 md:px-12 space-y-24 md:space-y-32">
          {[
            { label: 'CLARITY CHECK', title: "Know what's worth worrying about", desc: "Our AI flags each subject as green, yellow, or red — with gentle, advisory language. No predictions about your child's future. Just clear, actionable insights.", bullets: ['Board-specific grade interpretation', 'Soft, non-judgmental language', 'Teacher comment analysis'], bg: 'cream' },
            { label: "TONIGHT'S CONVERSATION", title: 'Talk to your child with confidence', desc: 'Get a personalized conversation script that opens dialogue instead of interrogation. Connection-focused phrasing that strengthens your relationship.', bullets: ['Age-appropriate language', 'Connection over evaluation', 'Copy-paste ready scripts'], bg: 'white' },
            { label: '30-DAY PLAN', title: 'Small habits, real progress', desc: 'A concrete, week-by-week action plan tied directly to what was flagged. Not generic advice — targeted steps that address the specific areas from the report card.', bullets: ['Daily and weekly actions', 'Progress tracking', 'Evidence-based suggestions'], bg: 'cream' },
          ].map((feature, i) => (
            <ScrollReveal key={feature.label} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${i % 2 !== 0 ? 'md:[direction:rtl]' : ''}`}>
                <div className={`${i % 2 !== 0 ? 'md:[direction:ltr]' : ''}`}>
                  <p className="label-text text-coral mb-3">{feature.label}</p>
                  <h3 className="font-display text-[28px] md:text-[42px] font-normal text-charcoal leading-tight mb-4">{feature.title}</h3>
                  <p className="font-body text-lg text-charcoal/70 leading-relaxed mb-6">{feature.desc}</p>
                  <ul className="space-y-3">
                    {feature.bullets.map(b => (
                      <li key={b} className="flex items-center gap-3">
                        <Check size={16} className="text-sage flex-shrink-0" />
                        <span className="font-body text-charcoal/80">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`rounded-2xl overflow-hidden shadow-card aspect-[16/10] flex items-center justify-center ${feature.bg === 'cream' ? 'bg-white' : 'bg-card-surface-alt'}`}>
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-3">
                      {feature.label === 'CLARITY CHECK' ? <FileText size={24} className="text-coral" /> : feature.label === "TONIGHT'S CONVERSATION" ? <Heart size={24} className="text-coral" /> : <Calendar size={24} className="text-coral" />}
                    </div>
                    <p className="font-display text-lg text-charcoal/80">{feature.title.split(' ').slice(0, 3).join(' ')}...</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Role Entry */}
      <section id="parents" className="py-20 md:py-28 bg-charcoal">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <ScrollReveal>
            <h2 className="font-display text-[32px] md:text-[56px] font-medium text-white text-center mb-4">Built for everyone in your school community</h2>
            <p className="font-body text-lg text-white/60 text-center mb-12">Choose your portal to get started</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Heart size={32} className="text-coral" />, title: 'For Parents', desc: 'Upload report cards, get AI-powered clarity checks, conversation guides, and personalized 30-day plans.', link: '/signup', cta: 'Enter Parent Portal' },
              { icon: <Users size={32} className="text-coral" />, title: 'For Teachers', desc: 'See class-wide patterns, identify students who need attention, and track academic trends across terms.', link: '/signup', cta: 'Enter Teacher Portal' },
              { icon: <Building size={32} className="text-coral" />, title: 'For Schools', desc: 'Manage classes, student rosters, teacher assignments, and monitor school-wide academic health.', link: '/signup', cta: 'Enter Admin Portal' },
            ].map((role, i) => (
              <ScrollReveal key={role.title} delay={i * 0.12}>
                <Link to={role.link} className="block bg-dark-surface border border-white/[0.08] rounded-2xl p-8 hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-300 group">
                  {role.icon}
                  <h3 className="font-display text-2xl font-medium text-white mt-4 mb-2">{role.title}</h3>
                  <p className="font-body text-white/60 mb-6 leading-relaxed">{role.desc}</p>
                  <span className="font-body text-sm font-semibold text-coral inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                    {role.cta} <ArrowRight size={14} />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <ScrollReveal>
            <h2 className="font-display text-[32px] md:text-[56px] font-medium text-charcoal text-center mb-12">What parents are saying</h2>
          </ScrollReveal>
          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-6 transition-transform duration-500"
                animate={{ x: -testimonialIdx * (100 / 3) + '%' }}
                style={{ width: `${(testimonials.length / 3) * 100}%` }}
              >
                {testimonials.map((t, i) => (
                  <div key={i} className="w-1/3 flex-shrink-0 px-2">
                    <div className="bg-white rounded-2xl shadow-card p-8 h-full">
                      <p className="font-display text-lg md:text-xl text-charcoal italic leading-relaxed mb-6">"{t.text}"</p>
                      <div>
                        <p className="font-body font-medium text-charcoal">{t.name}</p>
                        <p className="font-body text-sm text-medium-gray">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => setTestimonialIdx(Math.max(0, testimonialIdx - 1))} disabled={testimonialIdx === 0} className="w-10 h-10 rounded-full bg-white border border-light-gray flex items-center justify-center disabled:opacity-30 hover:bg-cream transition-colors">
                <ChevronLeft size={16} />
              </button>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === testimonialIdx ? 'bg-coral' : 'bg-light-gray'}`} />
              ))}
              <button onClick={() => setTestimonialIdx(Math.min(testimonials.length - 1, testimonialIdx + 1))} disabled={testimonialIdx === testimonials.length - 1} className="w-10 h-10 rounded-full bg-white border border-light-gray flex items-center justify-center disabled:opacity-30 hover:bg-cream transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-5 md:px-12">
          <ScrollReveal>
            <h2 className="font-display text-[32px] md:text-[56px] font-medium text-charcoal text-center mb-12">Common questions</h2>
          </ScrollReveal>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="border-b border-light-gray">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full py-5 flex items-center justify-between text-left">
                    <span className="font-display text-lg md:text-xl font-medium text-charcoal pr-4">{faq.q}</span>
                    <span className="text-coral text-xl flex-shrink-0">{openFaq === i ? '×' : '+'}</span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="font-body text-charcoal/70 pb-5 leading-relaxed max-w-xl">{faq.a}</p>
                  </motion.div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <div className="grid md:grid-cols-[1fr_1fr_1fr_1fr] gap-10 mb-12">
            <div className="md:col-span-1">
              <span className="font-display text-2xl font-semibold text-white tracking-tight">NextStep<span className="text-coral">.AI</span></span>
              <p className="font-body text-sm text-white/50 mt-3 leading-relaxed">Turn your child's report card into your next move.</p>
            </div>
            <div>
              <p className="label-text text-white/40 mb-4">Product</p>
              <ul className="space-y-2">
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">For Parents</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">For Teachers</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">For Schools</span></li>
              </ul>
            </div>
            <div>
              <p className="label-text text-white/40 mb-4">Company</p>
              <ul className="space-y-2">
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">About</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">Blog</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">Support</span></li>
              </ul>
            </div>
            <div>
              <p className="label-text text-white/40 mb-4">Legal</p>
              <ul className="space-y-2">
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">Privacy</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">Terms</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">Data Security</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-sm text-white/40">© 2026 NextStep.AI. All rights reserved.</p>
            <p className="font-body text-xs text-white/30">Your child's data is private and secure.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
