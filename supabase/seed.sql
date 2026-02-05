-- SBETUTOR Seed Data
-- Populates subjects table with initial categories and subjects

-- ============================================================
-- SUBJECTS
-- ============================================================

-- Languages
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('English', 'english', 'General English conversation, grammar, vocabulary, and fluency practice with native and certified tutors.', 'languages', 'languages', 1),
  ('Business English', 'business-english', 'Professional English for meetings, presentations, emails, and workplace communication.', 'briefcase', 'languages', 2),
  ('Spanish', 'spanish', 'Learn Spanish from beginner to advanced — Latin American and European dialects covered.', 'languages', 'languages', 3),
  ('French', 'french', 'French language lessons for travel, work, or academic goals with native-speaking tutors.', 'languages', 'languages', 4),
  ('German', 'german', 'German language tutoring for all levels, from Goethe certificates to casual conversation.', 'languages', 'languages', 5),
  ('Mandarin Chinese', 'mandarin-chinese', 'Mandarin lessons covering speaking, reading, writing, and HSK exam preparation.', 'languages', 'languages', 6),
  ('Japanese', 'japanese', 'Japanese language learning from hiragana basics to JLPT-level grammar and conversation.', 'languages', 'languages', 7),
  ('Arabic', 'arabic', 'Modern Standard Arabic and dialect-specific tutoring for all proficiency levels.', 'languages', 'languages', 8),
  ('Korean', 'korean', 'Korean language lessons covering hangul, grammar, TOPIK prep, and conversational practice.', 'languages', 'languages', 9),
  ('Portuguese', 'portuguese', 'Brazilian and European Portuguese tutoring for beginners through advanced speakers.', 'languages', 'languages', 10),
  ('Italian', 'italian', 'Italian language lessons for travel, culture, and professional development.', 'languages', 'languages', 11),
  ('Russian', 'russian', 'Russian language tutoring covering Cyrillic script, grammar, and conversation skills.', 'languages', 'languages', 12);

-- Academics
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('Mathematics', 'mathematics', 'Algebra, calculus, geometry, statistics, and discrete math for school and university students.', 'calculator', 'academics', 20),
  ('Physics', 'physics', 'Classical mechanics, electromagnetism, thermodynamics, and quantum physics tutoring.', 'atom', 'academics', 21),
  ('Chemistry', 'chemistry', 'Organic, inorganic, and physical chemistry with lab concept explanations.', 'flask', 'academics', 22),
  ('Biology', 'biology', 'Cell biology, genetics, ecology, anatomy, and physiology for all academic levels.', 'leaf', 'academics', 23),
  ('History', 'history', 'World history, US history, European history, and historical analysis skills.', 'book-open', 'academics', 24),
  ('Geography', 'geography', 'Physical and human geography, GIS concepts, and environmental studies.', 'globe', 'academics', 25),
  ('Economics', 'economics', 'Microeconomics, macroeconomics, and econometrics for high school and university.', 'trending-up', 'academics', 26),
  ('Psychology', 'psychology', 'Introduction to psychology, cognitive science, developmental and clinical psychology.', 'brain', 'academics', 27),
  ('Literature', 'literature', 'English literature analysis, essay writing, creative writing, and literary criticism.', 'book', 'academics', 28),
  ('Philosophy', 'philosophy', 'Ethics, logic, metaphysics, epistemology, and history of philosophy.', 'lightbulb', 'academics', 29);

-- Professional
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('Public Speaking', 'public-speaking', 'Presentation skills, speech delivery, confidence building, and audience engagement.', 'mic', 'professional', 40),
  ('Interview Preparation', 'interview-preparation', 'Behavioral and technical interview coaching for career transitions and job seekers.', 'users', 'professional', 41),
  ('Resume Writing', 'resume-writing', 'Professional resume, CV, and cover letter writing with industry-specific guidance.', 'file-text', 'professional', 42),
  ('Project Management', 'project-management', 'PMP, Agile, Scrum, and project planning fundamentals for aspiring project managers.', 'clipboard', 'professional', 43),
  ('Data Analysis', 'data-analysis', 'Excel, SQL, Tableau, and Python for data-driven decision making and analytics.', 'bar-chart', 'professional', 44),
  ('Financial Literacy', 'financial-literacy', 'Personal finance, budgeting, investing basics, and financial planning education.', 'dollar-sign', 'professional', 45);

-- Test Prep
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('SAT Prep', 'sat-prep', 'Comprehensive SAT preparation covering math, reading, and writing sections with practice tests.', 'target', 'test-prep', 60),
  ('ACT Prep', 'act-prep', 'ACT test preparation with section-by-section strategies and timed practice.', 'target', 'test-prep', 61),
  ('GRE Prep', 'gre-prep', 'GRE verbal reasoning, quantitative reasoning, and analytical writing preparation.', 'award', 'test-prep', 62),
  ('GMAT Prep', 'gmat-prep', 'GMAT preparation for business school applications — quant, verbal, IR, and AWA.', 'award', 'test-prep', 63),
  ('IELTS Prep', 'ielts-prep', 'IELTS Academic and General preparation for listening, reading, writing, and speaking.', 'globe', 'test-prep', 64),
  ('TOEFL Prep', 'toefl-prep', 'TOEFL iBT preparation covering all four sections with practice tests and feedback.', 'globe', 'test-prep', 65),
  ('AP Exam Prep', 'ap-exam-prep', 'Advanced Placement exam preparation across multiple subjects and scoring strategies.', 'target', 'test-prep', 66);

-- Arts
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('Music Theory', 'music-theory', 'Fundamentals of music theory, harmony, composition, and ear training.', 'music', 'arts', 80),
  ('Piano', 'piano', 'Piano lessons for beginners through advanced — classical, jazz, and contemporary styles.', 'music', 'arts', 81),
  ('Guitar', 'guitar', 'Acoustic and electric guitar lessons covering technique, theory, and song learning.', 'music', 'arts', 82),
  ('Drawing & Illustration', 'drawing-illustration', 'Pencil, charcoal, and digital illustration techniques for all skill levels.', 'pen-tool', 'arts', 83),
  ('Photography', 'photography', 'Camera technique, composition, lighting, and photo editing fundamentals.', 'camera', 'arts', 84),
  ('Creative Writing', 'creative-writing', 'Fiction, poetry, screenwriting, and narrative craft with workshop-style feedback.', 'edit', 'arts', 85);

-- Technology
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('Web Development', 'web-development', 'HTML, CSS, JavaScript, React, Next.js, and full-stack web development tutoring.', 'code', 'technology', 100),
  ('Python Programming', 'python-programming', 'Python fundamentals, data science, automation, and web development with Django/Flask.', 'code', 'technology', 101),
  ('JavaScript', 'javascript', 'Modern JavaScript (ES6+), TypeScript, Node.js, and frontend framework tutoring.', 'code', 'technology', 102),
  ('Mobile Development', 'mobile-development', 'iOS (Swift), Android (Kotlin), and cross-platform (React Native, Flutter) app development.', 'smartphone', 'technology', 103),
  ('Data Science', 'data-science', 'Machine learning, statistics, pandas, scikit-learn, and data visualization with Python.', 'database', 'technology', 104),
  ('Cybersecurity', 'cybersecurity', 'Network security, ethical hacking, cryptography, and security best practices.', 'shield', 'technology', 105),
  ('Cloud Computing', 'cloud-computing', 'AWS, Azure, GCP fundamentals, DevOps practices, and cloud architecture.', 'cloud', 'technology', 106),
  ('UI/UX Design', 'ui-ux-design', 'User interface design, user experience research, Figma, and design systems.', 'layout', 'technology', 107);

-- ============================================================
-- SUBJECT HIERARCHY (child subjects)
-- ============================================================

-- English sub-subjects
INSERT INTO public.subjects (name, slug, description, icon, parent_id, category, sort_order)
SELECT 'IELTS English', 'ielts-english', 'Focused IELTS preparation within English tutoring.', 'globe', id, 'languages', 1
FROM public.subjects WHERE slug = 'english';

INSERT INTO public.subjects (name, slug, description, icon, parent_id, category, sort_order)
SELECT 'Conversational English', 'conversational-english', 'Casual conversation practice for daily fluency.', 'message-circle', id, 'languages', 2
FROM public.subjects WHERE slug = 'english';

-- Mathematics sub-subjects
INSERT INTO public.subjects (name, slug, description, icon, parent_id, category, sort_order)
SELECT 'Calculus', 'calculus', 'Differential and integral calculus for university students.', 'calculator', id, 'academics', 1
FROM public.subjects WHERE slug = 'mathematics';

INSERT INTO public.subjects (name, slug, description, icon, parent_id, category, sort_order)
SELECT 'Statistics', 'statistics', 'Probability, statistical inference, and data analysis methods.', 'bar-chart', id, 'academics', 2
FROM public.subjects WHERE slug = 'mathematics';

INSERT INTO public.subjects (name, slug, description, icon, parent_id, category, sort_order)
SELECT 'Linear Algebra', 'linear-algebra', 'Vectors, matrices, linear transformations, and eigenvalues.', 'calculator', id, 'academics', 3
FROM public.subjects WHERE slug = 'mathematics';
