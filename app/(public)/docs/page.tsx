import Link from "next/link";
import { ArrowRight, LifeBuoy } from "lucide-react";
import { DOC_GROUPS, docsInGroup } from "./_lib/registry";
import { SUPPORT_EMAIL, supportMailto } from "@/app/lib/support";

export default function DocsHome() {
  return (
    <div className="max-w-4xl py-8 lg:py-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">GADvance documentation</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">Learn how GADvance works</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-500">
        Step-by-step guides for setting up your account, joining your organization, taking adaptive assessments, and
        understanding your results.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/docs/getting-started" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
          Get started <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link href="/docs/how-bkt-works" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
          How BKT works
        </Link>
      </div>

      {DOC_GROUPS.map((group) => (
        <section key={group} aria-labelledby={`group-${group}`} className="mt-12">
          <h2 id={`group-${group}`} className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">{group}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {docsInGroup(group).map((doc) => (
              <Link key={doc.slug} href={`/docs/${doc.slug}`} className="group rounded-2xl border border-zinc-200 p-5 transition-colors hover:border-violet-200 hover:bg-violet-50/40">
                <span className="flex items-center justify-between font-medium text-zinc-900">
                  {doc.title}
                  <ArrowRight size={16} aria-hidden="true" className="text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </span>
                <span className="mt-1.5 block text-sm leading-6 text-zinc-500">{doc.description}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-14 flex flex-col gap-3 rounded-2xl border border-violet-100 bg-violet-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <LifeBuoy size={22} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium text-zinc-900">Can&apos;t find what you need?</p>
            <p className="text-sm text-zinc-600">The support team answers questions about accounts, courses, and bugs.</p>
          </div>
        </div>
        <a href={supportMailto("documentation")} className="shrink-0 text-sm font-medium text-primary underline">{SUPPORT_EMAIL}</a>
      </div>
    </div>
  );
}
