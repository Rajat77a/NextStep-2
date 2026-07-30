        <p className="font-body text-xs text-charcoal/70 leading-relaxed">
          This analysis is designed to guide conversations, not replace professional advice. When in doubt, always check with your child's teacher. This is not a diagnosis.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {grades.map((grade, index) => (
          <motion.div
            key={grade.id || `${grade.subjectName}-${index}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`bg-white rounded-2xl shadow-card p-5 border-l-4 ${
              grade.flag === 'green'
                ? 'border-l-sage'
                : grade.flag === 'yellow'
                  ? 'border-l-amber'
                  : 'border-l-coral'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display text-lg text-charcoal">{grade.subjectName}</h4>
              <FlagBadge flag={grade.flag} />
            </div>

            <p className="font-body text-sm text-charcoal/60 mb-3">
              Grade: <span className="font-medium text-charcoal">{grade.grade}</span>
            </p>

            <p className="font-body text-sm text-charcoal leading-relaxed mb-3">
              {grade.aiNote || 'No detailed AI note was saved for this subject.'}
            </p>

            {grade.flag !== 'green' && (
              <p className="font-body text-xs text-medium-gray italic mb-3">
                This is not a diagnosis, just something worth checking with the teacher about.
              </p>
            )}

            {grade.teacherComment && (
              <div className="bg-cream rounded-lg p-3 mb-3">
                <p className="font-body text-xs text-charcoal/60">
                  Teacher wrote: "{grade.teacherComment}"
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setExpandedSubject(expandedSubject === grade.id ? null : grade.id)}
              className="flex items-center gap-1 text-coral font-body text-xs font-semibold hover:underline"
            >
              {expandedSubject === grade.id ? (
                <>
                  <ChevronUp size={12} /> Hide details
                </>
              ) : (
                <>
                  <ChevronDown size={12} /> What this might mean
                </>
              )}
            </button>

            <AnimatePresence>
              {expandedSubject === grade.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="font-body text-xs text-charcoal/70 mt-3 leading-relaxed">
                    {grade.flag === 'green'
                      ? `The grade and teacher comments suggest your child is handling ${grade.subjectName} well at this stage. Continue supporting their current study habits.`
                      : grade.flag === 'yellow'
                        ? `This grade may indicate that your child is facing some challenges in ${grade.subjectName}. It is worth having a gentle conversation about what they find difficult, and checking in with the teacher for specific areas to focus on.`
                        : `This grade suggests your child may need additional support in ${grade.subjectName}. Consider speaking with the teacher about remedial resources or tutoring options. At home, try to create a calm, focused study environment for this subject.`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {clarityCheck && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-card p-6 mb-8"
        >
          <h3 className="font-display text-xl text-charcoal mb-3">Overall Summary</h3>
          <p className="font-body text-charcoal/70 leading-relaxed">{clarityCheck.summaryText}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-cream rounded-2xl p-8 text-center"
      >
        <h4 className="font-display text-xl text-charcoal mb-2">Ready for the next step?</h4>
        <p className="font-body text-medium-gray mb-6">We have a personalized plan ready for you.</p>

        <div className="flex flex-wrap justify-center gap-3">
          <TransitionLink to="/parent/conversation" className="btn-text px-5 py-3 rounded-[10px] bg-white text-charcoal border border-light-gray hover:border-coral hover:text-coral transition-all inline-flex items-center gap-2">
            <MessageCircle size={16} /> Conversation Guide
          </TransitionLink>

          <TransitionLink to="/parent/questions" className="btn-text px-5 py-3 rounded-[10px] bg-white text-charcoal border border-light-gray hover:border-coral hover:text-coral transition-all inline-flex items-center gap-2">
            <HelpCircle size={16} /> Teacher Questions
          </TransitionLink>

          <TransitionLink to="/parent/plan" className="btn-text px-5 py-3 rounded-[10px] bg-coral text-white hover:bg-coral-dark transition-all inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
            <Calendar size={16} /> 30-Day Plan
          </TransitionLink>
        </div>
      </motion.div>
    </div>
  );
}
