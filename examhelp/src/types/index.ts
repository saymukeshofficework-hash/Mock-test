/**
 * Domain types for TETTESTHUB.
 *
 * These mirror the planned database entities (see prisma/schema.prisma).
 * Components only ever consume these types through src/lib/repo.ts, so the
 * static seed files in src/data can later be swapped for a real database
 * without touching UI code.
 */

export type Lang = "hi" | "en";

/** A string available in both supported languages. */
export interface Bilingual {
  hi: string;
  en: string;
}

/**
 * How trustworthy a date is. Never use CONFIRMED unless an official
 * notification / rulebook gives that exact date.
 */
export type DateStatus =
  | "CONFIRMED"
  | "TENTATIVE"
  | "EXPECTED"
  | "TBA"
  | "CANCELLED"
  | "POSTPONED"
  | "COMPLETED";

export interface ExamDate {
  /** ISO date (YYYY-MM-DD). Omit when only a month is known. */
  date?: string;
  /** Optional end date for ranges (e.g. multi-day exams). */
  endDate?: string;
  /** YYYY-MM when only the month is known (e.g. official "expected" calendars). */
  month?: string;
  status: DateStatus;
  note?: Bilingual;
}

export type Organization = "MPESB" | "MPPSC" | "MPHC" | "MP_GOVT" | "OTHER";

export type CategorySlug =
  | "mppsc"
  | "mpesb"
  | "teacher"
  | "police"
  | "revenue"
  | "health"
  | "technical"
  | "court"
  | "other";

export interface ExamCategory {
  slug: CategorySlug;
  name: Bilingual;
  description: Bilingual;
  /** lucide icon name, resolved in the CategoryIcon component */
  icon: string;
  subcategories: Bilingual[];
}

export type ExamType =
  | "RECRUITMENT"
  | "ELIGIBILITY"
  | "ENTRANCE"
  | "DEPARTMENTAL"
  | "STATE_SERVICE";

export interface SourceRef {
  label: string;
  url: string;
  /** ISO date when the record was last checked against the source. */
  checkedOn: string;
}

export interface Exam {
  id: string;
  slug: string;
  name: Bilingual;
  shortName: string;
  organization: Organization;
  category: CategorySlug;
  examType: ExamType;
  mode?: Bilingual;
  description?: Bilingual;
  /** Number of posts, only when stated in an official document. */
  posts?: number;
  dates: {
    applicationStart?: ExamDate;
    applicationEnd?: ExamDate;
    correctionEnd?: ExamDate;
    exam?: ExamDate;
    admitCard?: ExamDate;
    answerKey?: ExamDate;
    result?: ExamDate;
  };
  officialUrl: string;
  notificationUrl?: string;
  rulebookUrl?: string;
  /** Our own mock test series for this exam (may live outside /examhelp, e.g. "/tests.html"). */
  testSeries?: { href: string; title: Bilingual; sub: Bilingual; cta: Bilingual };
  syllabusUrl?: string;
  applyUrl?: string;
  /** Eligibility, fee, pattern etc. stay undefined until officially sourced. */
  details?: {
    eligibility?: Bilingual;
    ageLimit?: Bilingual;
    fee?: Bilingual;
    selectionProcess?: Bilingual;
    pattern?: Bilingual;
    syllabus?: Bilingual;
  };
  featured: boolean;
  popular?: boolean;
  source: SourceRef;
  updatedAt: string;
}

/** Status derived at render time from dates + "now". */
export type ExamPhase =
  | "APPLICATION_UPCOMING"
  | "APPLICATION_OPEN"
  | "APPLICATION_CLOSED"
  | "EXAM_UPCOMING"
  | "EXAM_COMPLETED"
  /** Exam date has passed but it was only tentative — wait for official word. */
  | "AWAITING_UPDATE"
  | "NOT_NOTIFIED";

export type ProductStatus = "AVAILABLE" | "COMING_SOON" | "AVAILABLE_SOON";

export interface Price {
  /** Price in rupees. The base ₹299 model. */
  amount: number;
  /** Only set when a real discount exists. Never invent one. */
  originalAmount?: number;
  currency: "INR";
}

export interface NoteProduct {
  id: string;
  slug: string;
  title: Bilingual;
  subject: Bilingual;
  shortDescription: Bilingual;
  category: CategorySlug;
  /** Related exam slugs for internal linking. */
  examSlugs: string[];
  /** Null until the PDF is finalised. */
  pages: number | null;
  languages: Lang[];
  format: "PDF";
  price: Price;
  status: ProductStatus;
  topics: Bilingual[];
  /** Sample page image paths, empty until uploaded. */
  samplePages: string[];
  /** Chapter list of the finished PDF (shown on the landing page). */
  chapters?: Bilingual[];
  /**
   * Razorpay Payment Link / Payment Page URL (e.g. https://rzp.io/rzp/xxxx).
   * Works on static hosting. Leave empty until the product is ready to sell.
   */
  paymentUrl?: string;
  /** Product id in the secure checkout (supabase/functions/notes-checkout), e.g. "ag3-en". */
  checkoutProduct?: string;
  /** Combo product id (this PDF + the matching test series), e.g. "ag3-combo-hi". */
  comboProduct?: string;
  /** Dedicated shareable landing page, if any. */
  landingPath?: string;
  featured: boolean;
  updatedAt: string;
}

export type NotificationType =
  | "NEW_RECRUITMENT"
  | "APPLICATION_OPEN"
  | "LAST_DATE"
  | "DATE_CHANGE"
  | "ADMIT_CARD"
  | "ANSWER_KEY"
  | "RESULT"
  | "COUNSELLING"
  | "IMPORTANT_NOTICE";

export interface ExamNotification {
  id: string;
  type: NotificationType;
  title: Bilingual;
  organization: Organization;
  examSlug?: string;
  /** ISO date the notice was published, only when the official source states it. */
  publishedOn?: string;
  officialUrl: string;
  source: SourceRef;
}

export interface Faq {
  id: string;
  question: Bilingual;
  answer: Bilingual;
  group: "general" | "notes" | "dates" | "affiliation";
}
