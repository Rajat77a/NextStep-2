import { storage } from './storage';
import { hashPassword, generateId } from '@/lib/crypto';
import type { User, School, Class, Student, ReportCard, SubjectGrade, ClarityCheck, PlanProgress } from '@/types';

const indianFirstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Myra', 'Aaradhya', 'Sara', 'Navya', 'Kavya', 'Priya'];
const indianLastNames = ['Sharma', 'Kumar', 'Singh', 'Patel', 'Gupta', 'Reddy', 'Nair', 'Menon', 'Iyer', 'Rao', 'Desai', 'Joshi', 'Shah', 'Mehta', 'Kapoor', 'Verma', 'Mishra', 'Agarwal', 'Banerjee', 'Choudhary'];
const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'];

function randomName(): string {
  const fn = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
  const ln = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
  return `${fn} ${ln}`;
}

function randomGrade(): { grade: string; score: number } {
  const grades = [
    { grade: 'A1', score: 95 }, { grade: 'A2', score: 85 },
    { grade: 'B1', score: 75 }, { grade: 'B2', score: 65 },
    { grade: 'C1', score: 55 }, { grade: 'C2', score: 45 },
    { grade: 'B1', score: 78 }, { grade: 'A2', score: 88 },
    { grade: 'B2', score: 62 }, { grade: 'C1', score: 52 },
  ];
  return grades[Math.floor(Math.random() * grades.length)];
}

function getFlag(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

function teacherComment(subject: string, score: number): string {
  const good = [
    `Consistent performance in ${subject}. Keep up the good work!`,
    `Shows good understanding of ${subject} concepts.`,
    `Active participation in ${subject} class.`,
    `Good progress in ${subject} this term.`,
  ];
  const mid = [
    `Needs to pay more attention in ${subject} class.`,
    `Can improve with more practice in ${subject}.`,
    `Participation in ${subject} has room for improvement.`,
    `Shows potential in ${subject} but needs consistent effort.`,
  ];
  const poor = [
    `Struggling with ${subject} concepts. Needs additional support.`,
    `Easily distracted during ${subject} lessons.`,
    `Has difficulty following ${subject} instructions.`,
    `Requires remedial attention in ${subject}.`,
  ];
  if (score >= 70) return good[Math.floor(Math.random() * good.length)];
  if (score >= 50) return mid[Math.floor(Math.random() * mid.length)];
  return poor[Math.floor(Math.random() * poor.length)];
}

function generateAINote(subject: string, score: number, prevScore: number | null): string {
  const dropped = prevScore !== null && score < prevScore;
  if (dropped) {
    return `The grade dropped from the previous term. ${subject === 'Mathematics' ? 'Math skills build on each other, so a drop here may indicate a gap in foundational understanding worth checking.' : subject === 'Science' ? 'Science requires both memorization and conceptual understanding — a drop may suggest one of these needs attention.' : `This drop in ${subject} may indicate a change in engagement or difficulty with newer topics.`}`;
  }
  if (score >= 70) return `This is a solid performance in ${subject}. The grade suggests good understanding and consistent effort.`;
  if (score >= 50) return `This grade in ${subject} is passing but suggests some areas where additional practice could help. This may indicate a need for more regular revision.`;
  return `This grade in ${subject} is below expectations. This may indicate a need for additional support — worth checking with the teacher about specific areas of difficulty.`;
}

export async function seedDatabase() {
  if (storage.getUsers().length > 0) return;

  const passwordHash = await hashPassword('demo123');

  // Create school
  const school: School = {
    id: generateId(),
    name: 'Greenfield Academy',
    boardType: 'CBSE',
    address: '42 Park Street, Bangalore, Karnataka 560001',
    adminId: '',
    subscriptionPlan: 'premium',
    studentSeatLimit: 250,
    createdAt: new Date().toISOString(),
  };

  // Create admin
  const admin: User = {
    id: generateId(),
    email: 'admin@demo.com',
    passwordHash,
    fullName: 'Priya Sharma',
    role: 'admin',
    schoolId: school.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isActive: true,
  };
  school.adminId = admin.id;

  // Create teachers
  const teachers: User[] = [
    { id: generateId(), email: 'teacher@demo.com', passwordHash, fullName: 'Ananya Iyer', role: 'teacher', schoolId: school.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastLoginAt: new Date().toISOString(), isActive: true },
    { id: generateId(), email: 'rajesh@greenfield.edu', passwordHash, fullName: 'Rajesh Menon', role: 'teacher', schoolId: school.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastLoginAt: null, isActive: true },
    { id: generateId(), email: 'kavita@greenfield.edu', passwordHash, fullName: 'Kavita Rao', role: 'teacher', schoolId: school.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastLoginAt: null, isActive: true },
  ];

  // Create parent
  const parent: User = {
    id: generateId(),
    email: 'parent@demo.com',
    passwordHash,
    fullName: 'Meera Krishnan',
    role: 'parent',
    schoolId: school.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isActive: true,
  };

  const allUsers = [admin, ...teachers, parent];
  storage.setUsers(allUsers);
  storage.setSchools([school]);

  // Create classes
  const classes: Class[] = [
    { id: generateId(), schoolId: school.id, grade: 5, section: 'A', teacherId: teachers[0].id, createdAt: new Date().toISOString() },
    { id: generateId(), schoolId: school.id, grade: 5, section: 'B', teacherId: teachers[1].id, createdAt: new Date().toISOString() },
    { id: generateId(), schoolId: school.id, grade: 6, section: 'A', teacherId: teachers[2].id, createdAt: new Date().toISOString() },
  ];
  storage.setClasses(classes);

  // Create students - 15 per class
  const allStudents: Student[] = [];
  for (const cls of classes) {
    for (let i = 1; i <= 15; i++) {
      const parentId = i <= 5 && cls.id === classes[0].id ? parent.id : generateId();
      if (i > 5 || cls.id !== classes[0].id) {
        const pUser: User = {
          id: parentId,
          email: `parent${allStudents.length + 1}@greenfield.edu`,
          passwordHash: await hashPassword('welcome123'),
          fullName: randomName() + "'s Parent",
          role: 'parent',
          schoolId: school.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: null,
          isActive: true,
        };
        allUsers.push(pUser);
      }
      allStudents.push({
        id: generateId(),
        schoolId: school.id,
        classId: cls.id,
        rollNumber: String(i).padStart(3, '0'),
        fullName: randomName(),
        parentId,
        createdAt: new Date().toISOString(),
      });
    }
  }
  storage.setUsers(allUsers);
  storage.setStudents(allStudents);

  // Create report cards and grades
  const allReportCards: ReportCard[] = [];
  const allGrades: SubjectGrade[] = [];
  const allClarityChecks: ClarityCheck[] = [];
  const allProgress: PlanProgress[] = [];

  const terms = ['Term 1, 2024-25', 'Term 2, 2024-25'];

  for (const student of allStudents) {
    const prevScores: Record<string, number> = {};
    for (const term of terms) {
      const card: ReportCard = {
        id: generateId(),
        studentId: student.id,
        classId: student.classId,
        term,
        uploadedBy: teachers[0].id,
        uploadMethod: 'manual',
        boardType: 'CBSE',
        createdAt: term === terms[0] ? '2024-10-15T10:00:00Z' : '2025-03-20T10:00:00Z',
        status: 'ready',
      };
      allReportCards.push(card);

      for (const subject of subjects) {
        const g = randomGrade();
        const prev = prevScores[subject] || null;
        const flag = getFlag(g.score);
        const comment = teacherComment(subject, g.score);
        const aiNote = generateAINote(subject, g.score, prev);

        allGrades.push({
          id: generateId(),
          reportCardId: card.id,
          subjectName: subject,
          grade: g.grade,
          normalizedScore: g.score,
          teacherComment: comment,
          flag,
          aiNote,
          createdAt: card.createdAt,
        });
        prevScores[subject] = g.score;
      }

      // Generate clarity check for latest term + demo parent's students
      if (term === terms[1] && (student.parentId === parent.id || Math.random() > 0.7)) {
        const studentGrades = allGrades.filter(g => g.reportCardId === card.id);
        const redGrades = studentGrades.filter(g => g.flag === 'red');
        const yellowGrades = studentGrades.filter(g => g.flag === 'yellow');
        const overallStatus: 'green' | 'yellow' | 'red' = redGrades.length > 0 ? 'red' : yellowGrades.length > 0 ? 'yellow' : 'green';

        const clarityCheck: ClarityCheck = {
          id: generateId(),
          reportCardId: card.id,
          parentId: student.parentId,
          overallStatus,
          summaryText: `${student.fullName.split(' ')[0]}'s report card shows ${overallStatus === 'green' ? 'consistent performance across subjects.' : overallStatus === 'yellow' ? 'some areas that would benefit from attention.' : 'grades that suggest additional support may be needed.'} The overall trend is ${redGrades.length > 0 ? 'a signal to check in with teachers.' : 'manageable with some focused effort at home.'}`,
          conversationScript: {
            opening: `Hey ${student.fullName.split(' ')[0]}, your report card came in today. Want to look at it together? I'm curious what you think about how things went this term.`,
            acknowledgeGood: studentGrades.filter(g => g.flag === 'green').map(g =>
              `I see you did well in ${g.subjectName}! That's great — your hard work there really shows.`),
            exploreChallenges: [...redGrades, ...yellowGrades].map(g =>
              `I noticed ${g.subjectName} was a bit challenging this time. What do you think made it tough? Was it the topics, or something else?`),
            closeWithSupport: `No matter what these grades say, I'm here to help. We'll figure this out together — one step at a time. Let's pick one thing to work on this week. What do you think?`,
          },
          teacherQuestions: [...redGrades, ...yellowGrades].map(g => ({
            subject: g.subjectName,
            question: `In ${g.subjectName}, does ${student.fullName.split(' ')[0]} participate actively in class discussions, or tend to stay quiet?`,
            context: `Based on the comment: "${g.teacherComment}"`,
            whyItMatters: `Understanding engagement levels can help us support ${student.fullName.split(' ')[0]} better at home with the right kind of practice.`,
          })),
          thirtyDayPlan: [
            {
              weekNumber: 1,
              weekTitle: 'Foundation',
              dateRange: 'Week 1',
              actions: [
                { text: `Set up a consistent 30-minute study time for ${redGrades[0]?.subjectName || 'core subjects'} each weekday`, timeEstimate: '~30 min/day', whyItHelps: 'Consistency builds habits more than long occasional sessions' },
                { text: `Create a simple study corner with minimal distractions`, timeEstimate: '~15 min one-time', whyItHelps: 'A dedicated space signals the brain it is time to focus' },
                { text: `Review the report card together and pick one subject to focus on`, timeEstimate: '~20 min', whyItHelps: 'Choosing together gives your child ownership of the improvement' },
              ],
            },
            {
              weekNumber: 2,
              weekTitle: 'Building Habits',
              dateRange: 'Week 2',
              actions: [
                { text: `Use the Pomodoro technique: 25 min study, 5 min break`, timeEstimate: '~30 min/day', whyItHelps: 'Short focused bursts match a child attention span better than long sessions' },
                { text: `Ask your child to teach you one thing they learned each day`, timeEstimate: '~10 min', whyItHelps: 'Teaching is one of the most effective ways to reinforce learning' },
                { text: `Check in with the teacher about specific areas to focus on`, timeEstimate: '~15 min', whyItHelps: 'Teacher insights help target your efforts precisely' },
              ],
            },
            {
              weekNumber: 3,
              weekTitle: 'Deepening Practice',
              dateRange: 'Week 3',
              actions: [
                { text: `Add practice worksheets for ${yellowGrades[0]?.subjectName || 'weak areas'} twice a week`, timeEstimate: '~20 min, 2×/week', whyItHelps: 'Targeted practice in weaker areas accelerates improvement' },
                { text: `Use real-life examples to make ${subjects[2]} more relatable`, timeEstimate: '~15 min', whyItHelps: 'Connecting lessons to daily life improves understanding and retention' },
                { text: `Celebrate small wins with specific praise`, timeEstimate: '~2 min', whyItHelps: 'Specific praise builds confidence and motivation' },
              ],
            },
            {
              weekNumber: 4,
              weekTitle: 'Review & Adjust',
              dateRange: 'Week 4',
              actions: [
                { text: `Review what worked and what did not — adjust the plan`, timeEstimate: '~20 min', whyItHelps: 'Reflection helps find the right approach for your child' },
                { text: `Schedule a follow-up with the teacher to discuss progress`, timeEstimate: '~15 min', whyItHelps: 'Teacher feedback validates home efforts and suggests next steps' },
                { text: `Set one goal for the next month based on this progress`, timeEstimate: '~10 min', whyItHelps: 'Goal-setting teaches planning and self-management' },
              ],
            },
          ],
          generatedAt: card.createdAt,
        };
        allClarityChecks.push(clarityCheck);

        // Create plan progress with some items completed
        const actionItems = clarityCheck.thirtyDayPlan.flatMap((week, index) => {
          if (week.actions) {
            return week.actions.map(a => ({ text: a.text, completed: Math.random() > 0.6, week: week.weekNumber || index + 1 }));
          }

          return [{ text: week.habit || `Week ${week.week || index + 1} habit`, completed: Math.random() > 0.6, week: week.week || index + 1 }];
        });
        const done = actionItems.filter(a => a.completed).length;
        allProgress.push({
          id: generateId(),
          clarityCheckId: clarityCheck.id,
          parentId: student.parentId,
          actionItems,
          completionRate: Math.round((done / actionItems.length) * 100),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  storage.setReportCards(allReportCards);
  storage.setSubjectGrades(allGrades);
  storage.setClarityChecks(allClarityChecks);
  storage.setPlanProgress(allProgress);

  // Add some teacher notes
  const notes = [
    { studentId: allStudents[0].id, note: 'Very attentive in class. Parents are supportive.' },
    { studentId: allStudents[1].id, note: 'Needs encouragement to participate in discussions.' },
    { studentId: allStudents[2].id, note: 'New student this term. Adjusting well.' },
    { studentId: allStudents[5].id, note: 'Shows great creativity in project work.' },
    { studentId: allStudents[8].id, note: 'Could benefit from extra reading practice at home.' },
  ];
  const teacherNotes = notes.map(n => ({
    id: generateId(),
    ...n,
    teacherId: teachers[0].id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  storage.setTeacherNotes(teacherNotes);
}
