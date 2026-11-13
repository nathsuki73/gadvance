import type { Metadata } from "next";
import { DOC_CONTENT } from "@/app/(public)/docs/_content";
import { DOC_GROUPS, DOCS, docsInGroup } from "@/app/(public)/docs/_lib/registry";
import { SUPPORT_EMAIL } from "@/app/lib/support";
import PrintToolbar from "./PrintToolbar";

/**
 * Every documentation article on one page, laid out for A4 paper.
 *
 * This page is the source of the downloadable PDF
 * (public/downloads/gadvance-documentation.pdf, built by `npm run docs:pdf`).
 * It reads the same registry and article components as /docs, so the PDF
 * cannot drift from the website. It lives outside the (public) route group
 * so it does not get the site header, footer, or docs sidebar.
 */
export const metadata: Metadata = {
  title: "GADvance Documentation (PDF)",
  description: "All GADvance learner documentation on one printable page.",
  robots: { index: false, follow: false },
};

const PRINT_CSS = `
@page { size: A4; margin: 18mm 16mm 20mm; }
@media print {
  html, body { background: #fff !important; }
  .print-hidden { display: none !important; }
  .print-sheet { max-width: none !important; padding: 0 !important; }
  .print-cover { min-height: 250mm; }
}
.print-sheet { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.print-article, .print-contents { break-before: page; }
.print-sheet h1, .print-sheet h2, .print-sheet h3 { break-after: avoid; }
.print-sheet figure, .print-sheet [role="note"], .print-sheet details,
.print-sheet li, .print-sheet tr, .print-sheet svg, .print-sheet img { break-inside: avoid; }
.print-sheet h2 > a[aria-label="Link to this section"] { display: none; }
.print-sheet details > summary svg { display: none; }
`;

export default function DocsPrintPage() {
  const year = new Date().getFullYear();

  return (
    <div className="bg-white text-zinc-900">
      <style>{PRINT_CSS}</style>
      <PrintToolbar siteUrl={process.env.NEXT_PUBLIC_SITE_URL} />

      <main className="print-sheet mx-auto max-w-3xl px-6 py-10">
        <section className="print-cover flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">GADvance documentation</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-900">Learner guide</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-500">
            Step-by-step guides for setting up your account, joining your organization, taking adaptive assessments,
            and understanding your results.
          </p>
          <p className="mt-16 text-sm text-zinc-500">
            GADvance is an adaptive e-learning platform for gender sensitivity and Gender and Development (GAD)
            education.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Support: {SUPPORT_EMAIL} &middot; {year}
          </p>
        </section>

        <nav aria-label="Contents" className="print-contents">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Contents</h2>
          {DOC_GROUPS.map((group) => (
            <div key={group} className="mt-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">{group}</p>
              <ol className="mt-3 space-y-3">
                {docsInGroup(group).map((doc) => (
                  <li key={doc.slug}>
                    <a href={`#doc-${doc.slug}`} className="font-medium text-zinc-900 underline decoration-zinc-300">
                      {DOCS.indexOf(doc) + 1}. {doc.title}
                    </a>
                    <span className="mt-0.5 block text-sm leading-6 text-zinc-500">{doc.description}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </nav>

        {DOCS.map((doc, index) => {
          const Content = DOC_CONTENT[doc.slug];
          if (!Content) return null;
          return (
            <article key={doc.slug} id={`doc-${doc.slug}`} className="print-article">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {index + 1}. {doc.group}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{doc.title}</h1>
              <p className="mt-3 text-lg leading-8 text-zinc-500">{doc.description}</p>
              <div className="mt-8">
                <Content />
              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
}
