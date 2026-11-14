import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { ChevronDown, ChevronRight, Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { adjacentDocs, getDoc, type DocMeta } from "../_lib/registry";

/* ---------- Headings with anchor links ---------- */

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="group mt-14 scroll-mt-32 text-2xl font-semibold tracking-tight text-zinc-900 first:mt-0">
      {children}
      <a href={`#${id}`} className="ml-2 text-zinc-300 opacity-0 transition-opacity hover:text-primary focus:opacity-100 group-hover:opacity-100" aria-label="Link to this section">
        #
      </a>
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 text-lg font-semibold text-zinc-900">{children}</h3>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 leading-7 text-zinc-600">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-zinc-600 marker:text-violet-300">{children}</ul>;
}

/* ---------- Callouts ---------- */

const CALLOUT_STYLES = {
  note: { icon: Info, box: "border-sky-200 bg-sky-50/60", title: "text-sky-900" },
  tip: { icon: Lightbulb, box: "border-violet-200 bg-violet-50/60", title: "text-violet-900" },
  warning: { icon: TriangleAlert, box: "border-amber-200 bg-amber-50/70", title: "text-amber-900" },
} as const;

export function Callout({ kind = "note", title, children }: { kind?: keyof typeof CALLOUT_STYLES; title: string; children: ReactNode }) {
  const style = CALLOUT_STYLES[kind];
  const Icon = style.icon;
  return (
    <div className={`mt-6 rounded-2xl border p-4 sm:p-5 ${style.box}`} role="note">
      <p className={`flex items-center gap-2 text-sm font-semibold ${style.title}`}>
        <Icon size={16} aria-hidden="true" /> {title}
      </p>
      <div className="mt-2 text-sm leading-6 text-zinc-700">{children}</div>
    </div>
  );
}

/* ---------- Numbered steps ---------- */

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="mt-6 space-y-5 [counter-reset:step]">{children}</ol>;
}

export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="relative pl-12 [counter-increment:step] before:absolute before:left-0 before:top-0 before:flex before:h-8 before:w-8 before:items-center before:justify-center before:rounded-full before:bg-violet-100 before:text-sm before:font-semibold before:text-primary before:content-[counter(step)]">
      <p className="font-medium text-zinc-900">{title}</p>
      <div className="mt-1 text-sm leading-6 text-zinc-600">{children}</div>
    </li>
  );
}

/* ---------- Figures (diagrams and screenshots) ---------- */

export function Figure({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 sm:p-6">{children}</div>
      <figcaption className="mt-3 text-center text-xs leading-5 text-zinc-500">{caption}</figcaption>
    </figure>
  );
}

export function Screenshot({ src, alt, caption }: { src: StaticImageData; alt: string; caption: string }) {
  return (
    <figure className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm">
        <Image src={src} alt={alt} sizes="(min-width: 1024px) 720px, 100vw" className="h-auto w-full" placeholder="blur" />
      </div>
      <figcaption className="mt-3 text-center text-xs leading-5 text-zinc-500">{caption}</figcaption>
    </figure>
  );
}

/* ---------- FAQ ---------- */

export function Faq({ question, children }: { question: string; children: ReactNode }) {
  return (
    <details className="group mt-3 rounded-xl border border-zinc-200 bg-white open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 text-left font-medium text-zinc-900 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-primary transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-zinc-100 px-5 pb-5 pt-3 text-sm leading-6 text-zinc-600">{children}</div>
    </details>
  );
}

/* ---------- Page chrome ---------- */

export function Breadcrumbs({ doc }: { doc: DocMeta }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li><Link href="/docs" className="hover:text-primary">Docs</Link></li>
        <li aria-hidden="true"><ChevronRight size={12} /></li>
        <li>{doc.group}</li>
        <li aria-hidden="true"><ChevronRight size={12} /></li>
        <li aria-current="page" className="font-medium text-zinc-700">{doc.title}</li>
      </ol>
    </nav>
  );
}

export function TableOfContents({ doc }: { doc: DocMeta }) {
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">On this page</p>
      <ul className="space-y-2 border-l border-zinc-100">
        {doc.toc.map((entry) => (
          <li key={entry.id}>
            <a href={`#${entry.id}`} className="-ml-px block border-l border-transparent pl-3 text-zinc-500 hover:border-primary hover:text-zinc-900">
              {entry.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DocArticle({ doc, children }: { doc: DocMeta; children: ReactNode }) {
  const { previous, next } = adjacentDocs(doc.slug);
  const related = doc.related.map(getDoc).filter((d): d is DocMeta => Boolean(d));

  return (
    <div className="flex gap-10 py-8 lg:py-10">
      <article className="min-w-0 max-w-3xl flex-1">
        <Breadcrumbs doc={doc} />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">{doc.title}</h1>
        <p className="mt-3 text-lg leading-8 text-zinc-500">{doc.description}</p>

        <details className="mt-6 rounded-xl border border-zinc-200 xl:hidden">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-700">On this page</summary>
          <div className="px-4 pb-4"><TableOfContents doc={doc} /></div>
        </details>

        <div className="mt-10">{children}</div>

        {related.length > 0 && (
          <section aria-labelledby="related-articles" className="mt-16 border-t border-zinc-100 pt-8">
            <h2 id="related-articles" className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Related articles</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link key={r.slug} href={`/docs/${r.slug}`} className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-violet-200 hover:bg-violet-50/40">
                  <span className="block text-sm font-medium text-zinc-900">{r.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-zinc-500">{r.description}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <nav aria-label="Article pagination" className="mt-10 flex flex-col gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:justify-between">
          {previous ? (
            <Link href={`/docs/${previous.slug}`} className="text-sm text-zinc-500 hover:text-primary">&larr; {previous.title}</Link>
          ) : <span />}
          {next && (
            <Link href={`/docs/${next.slug}`} className="text-sm font-medium text-primary hover:text-primary-hover sm:text-right">{next.title} &rarr;</Link>
          )}
        </nav>
      </article>

      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-24"><TableOfContents doc={doc} /></div>
      </aside>
    </div>
  );
}
