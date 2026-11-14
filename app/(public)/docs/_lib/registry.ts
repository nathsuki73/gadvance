/**
 * Learner documentation registry.
 *
 * Every article is listed here once. Navigation, search, breadcrumbs,
 * related links, and static route generation all read from this list.
 */
export type DocGroup = "Start here" | "Using GADvance" | "Adaptive learning" | "Help";

export type TocEntry = { id: string; title: string };

export type DocMeta = {
  slug: string;
  title: string;
  description: string;
  group: DocGroup;
  /** Extra words that should match this article in search. */
  keywords: string[];
  toc: TocEntry[];
  related: string[];
};

/** The downloadable PDF of every article, built by `npm run docs:pdf`. */
export const DOCS_PDF_PATH = "/downloads/gadvance-documentation.pdf";

export const DOC_GROUPS: DocGroup[] = ["Start here", "Using GADvance", "Adaptive learning", "Help"];

export const DOCS: DocMeta[] = [
  {
    slug: "introduction",
    title: "Introduction",
    description: "What GADvance is, who it is for, and how this documentation is organized.",
    group: "Start here",
    keywords: ["about", "overview", "welcome", "gad", "gender and development"],
    toc: [
      { id: "what-is-gadvance", title: "What is GADvance?" },
      { id: "who-it-is-for", title: "Who it is for" },
      { id: "how-it-works", title: "How it works at a glance" },
      { id: "using-these-docs", title: "Using these docs" },
    ],
    related: ["getting-started", "project-overview", "how-bkt-works"],
  },
  {
    slug: "getting-started",
    title: "Getting started",
    description: "Create an account, verify your email, set up your profile, join an organization, and start your first course.",
    group: "Start here",
    keywords: ["sign up", "register", "account", "verify", "email", "onboarding", "profile", "join", "enroll", "google"],
    toc: [
      { id: "create-account", title: "1. Create your account" },
      { id: "verify-email", title: "2. Verify your email" },
      { id: "set-up-profile", title: "3. Set up your profile" },
      { id: "join-organization", title: "4. Join your organization" },
      { id: "find-and-enroll", title: "5. Find a course and enroll" },
      { id: "start-learning", title: "6. Start learning" },
    ],
    related: ["platform-features", "assessments-and-results", "faq"],
  },
  {
    slug: "project-overview",
    title: "Project overview",
    description: "Background, objectives, SDG alignment, and the high-level architecture of GADvance.",
    group: "Start here",
    keywords: ["background", "objectives", "sdg 4", "sdg 5", "architecture", "team", "lspu", "research", "thesis"],
    toc: [
      { id: "background", title: "Background" },
      { id: "objectives", title: "Core objectives" },
      { id: "sdg-alignment", title: "SDG 4 and SDG 5 alignment" },
      { id: "architecture", title: "High-level architecture" },
      { id: "team", title: "Development team" },
    ],
    related: ["introduction", "how-bkt-works"],
  },
  {
    slug: "platform-features",
    title: "Platform features",
    description: "A tour of everything available to learners: dashboard, organizations, courses, lessons, assessments, progress, and certificates.",
    group: "Using GADvance",
    keywords: ["dashboard", "workspace", "courses", "modules", "lessons", "organizations", "certificates", "progress", "search", "profile"],
    toc: [
      { id: "accounts", title: "Accounts and sign-in" },
      { id: "workspace", title: "Your workspace" },
      { id: "organizations", title: "Organizations" },
      { id: "courses", title: "Courses, modules, and lessons" },
      { id: "assessments", title: "Assessments" },
      { id: "progress", title: "Progress and results" },
      { id: "certificates", title: "Certificates" },
    ],
    related: ["getting-started", "assessments-and-results", "how-bkt-works"],
  },
  {
    slug: "assessments-and-results",
    title: "Assessments and results",
    description: "Pre-tests, post-tests, adaptive checkpoint quizzes, passing scores, retakes, and remedial review.",
    group: "Using GADvance",
    keywords: ["pre-test", "post-test", "quiz", "checkpoint", "passing score", "retake", "results", "review", "remedial", "poll", "survey"],
    toc: [
      { id: "types", title: "Types of assessments" },
      { id: "assessment-flow", title: "How a module flows" },
      { id: "checkpoints", title: "Adaptive checkpoint quizzes" },
      { id: "passing", title: "Passing scores and moving on" },
      { id: "review", title: "Remedial review" },
      { id: "retakes", title: "Retakes and saved progress" },
    ],
    related: ["how-bkt-works", "platform-features", "faq"],
  },
  {
    slug: "how-bkt-works",
    title: "How BKT works",
    description: "How Bayesian Knowledge Tracing estimates your mastery after each answer and chooses question difficulty.",
    group: "Adaptive learning",
    keywords: ["bayesian knowledge tracing", "bkt", "mastery", "probability", "guess", "slip", "transition", "prior", "bloom", "difficulty", "adaptive"],
    toc: [
      { id: "idea", title: "The idea in one minute" },
      { id: "parameters", title: "The four parameters" },
      { id: "update", title: "How an answer updates mastery" },
      { id: "worked-example", title: "Worked example" },
      { id: "difficulty", title: "Choosing question difficulty" },
      { id: "length", title: "How long a checkpoint is" },
      { id: "mastery-vs-score", title: "Mastery is not your score" },
    ],
    related: ["assessments-and-results", "introduction"],
  },
  {
    slug: "faq",
    title: "FAQs and troubleshooting",
    description: "Answers to common questions about accounts, adaptive learning, assessments, organizations, and mobile access.",
    group: "Help",
    keywords: ["help", "problem", "error", "password", "forgot", "login", "sign in", "mobile", "phone", "contact", "support", "bug", "join code", "code", "organization", "retake", "verification"],
    toc: [
      { id: "account", title: "Account access" },
      { id: "adaptive", title: "Adaptive learning" },
      { id: "assessment-questions", title: "Assessments" },
      { id: "organization-questions", title: "Organizations" },
      { id: "mobile", title: "Mobile access" },
      { id: "contact", title: "Still need help?" },
    ],
    related: ["getting-started", "assessments-and-results"],
  },
];

export function getDoc(slug: string): DocMeta | undefined {
  return DOCS.find((doc) => doc.slug === slug);
}

export function docsInGroup(group: DocGroup): DocMeta[] {
  return DOCS.filter((doc) => doc.group === group);
}

/** Previous and next article in reading order. */
export function adjacentDocs(slug: string): { previous?: DocMeta; next?: DocMeta } {
  const index = DOCS.findIndex((doc) => doc.slug === slug);
  return {
    previous: index > 0 ? DOCS[index - 1] : undefined,
    next: index >= 0 && index < DOCS.length - 1 ? DOCS[index + 1] : undefined,
  };
}

/** Case-insensitive search over titles, descriptions, keywords, and headings. */
export function searchDocs(query: string, docs: DocMeta[] = DOCS): DocMeta[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return docs
    .map((doc) => {
      const haystack = [doc.title, doc.description, ...doc.keywords, ...doc.toc.map((t) => t.title)]
        .join(" ")
        .toLowerCase();
      const title = doc.title.toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return null;
      const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 3 : 1), 0);
      return { doc, score };
    })
    .filter((hit): hit is { doc: DocMeta; score: number } => hit !== null)
    .sort((a, b) => b.score - a.score)
    .map((hit) => hit.doc);
}
