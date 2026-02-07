import { z } from "zod";

// ── AI Routes ──────────────────────────────────────────────────────
export const quizGenerateSchema = z.object({
  subjectId: z.string().uuid(),
  topics: z.array(z.string().max(200)).optional(),
  difficulty: z
    .enum(["easy", "medium", "hard", "adaptive"])
    .default("adaptive"),
});

export const quizAttemptSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.record(z.string(), z.any()).default({}),
  score: z.number().min(0).max(100),
  correctCount: z.number().int().min(0),
  totalCount: z.number().int().min(1),
});

export const studyPlanSchema = z.object({
  subjectId: z.string().uuid(),
  subjectName: z.string().min(1).max(200),
  goal: z.string().min(1).max(1000),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1).max(10000),
    }),
  ),
  subjectId: z.string().uuid().optional(),
  mode: z.enum(["chat", "explain", "quiz", "tutor"]).default("chat"),
});

// ── Payments ───────────────────────────────────────────────────────
export const checkoutSchema = z.object({
  bookingId: z.string().uuid(),
  studentEmail: z.string().email(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  paymentMethod: z.enum(["card", "safepay"]).default("card"),
});

export const bookingCreateSchema = z.object({
  tutorId: z.string().uuid(),
  subjectId: z.string().uuid(),
  scheduledAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "scheduledAt must be a valid ISO datetime string",
    }),
  price: z.number().positive(),
  currency: z.string().length(3).default("USD"),
});

// ── Classroom ──────────────────────────────────────────────────────
export const classroomEndSchema = z.object({
  sessionId: z.string().uuid(),
});

// ── Courses ────────────────────────────────────────────────────────
export const courseCreateSchema = z.object({
  title: z.string().min(1).max(200),
  subject_id: z.string().uuid().optional(),
  description: z.string().max(5000).default(""),
  price: z.number().min(0).default(0),
  is_free: z.boolean().default(false),
  level: z
    .enum(["beginner", "intermediate", "advanced", "all_levels"])
    .default("all_levels"),
});

export const courseUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).optional(),
  is_free: z.boolean().optional(),
  level: z
    .enum(["beginner", "intermediate", "advanced", "all_levels"])
    .optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const lessonCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(""),
  content: z.string().max(50000).default(""),
  video_url: z.string().url().nullable().default(null),
  sort_order: z.number().int().min(0).default(0),
  duration_minutes: z.number().int().min(0).nullable().default(null),
  is_free_preview: z.boolean().default(false),
});

// ── Rewards ────────────────────────────────────────────────────────
export const redeemRewardSchema = z.object({
  rewardId: z.string().uuid(),
});

// ── Admin ──────────────────────────────────────────────────────────
export const ingestDocumentSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(100000),
  subjectId: z.string().uuid(),
  metadata: z.record(z.string(), z.any()).optional(),
  sourceUrl: z.string().url().optional(),
});

export const adminTutorActionSchema = z.object({
  tutorId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
});

export const adminUserUpdateSchema = z.object({
  role: z.enum(["student", "tutor", "admin"]).optional(),
  full_name: z.string().min(1).max(200).optional(),
});

// ── Gamification ───────────────────────────────────────────────────
export const gamificationAwardSchema = z.object({
  event: z.string().min(1).max(100),
  referenceId: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});

// ── Referrals ──────────────────────────────────────────────────────
export const referralSchema = z.object({
  referralCode: z.string().min(1).max(50),
});

// ── Notifications ──────────────────────────────────────────────────
export const pushSubscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

// ── LiveKit ────────────────────────────────────────────────────────
export const livekitTokenSchema = z.object({
  room: z.string().min(1).max(200),
  username: z.string().min(1).max(200),
});

// ── Auth ───────────────────────────────────────────────────────────
export const welcomeEmailSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(200),
});

// ── Analytics ──────────────────────────────────────────────────────
export const vitalsSchema = z.object({
  name: z.string().min(1).max(50),
  value: z.number(),
  rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  id: z.string().optional(),
  delta: z.number().optional(),
});

// ── Contact Form ───────────────────────────────────────────────────
export const contactFormSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.string().min(1).max(300),
  message: z.string().min(10).max(5000),
});

// ── Helper ─────────────────────────────────────────────────────────
export function parseBody<T extends z.ZodType>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return { success: false, error: messages };
  }
  return { success: true, data: result.data };
}
