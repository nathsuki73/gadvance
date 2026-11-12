import type { Metadata } from "next";
import DocsShell from "./_components/DocsShell";

export const metadata: Metadata = {
  title: { default: "Documentation", template: "%s | GADvance Docs" },
  description: "Guides for GADvance learners: getting started, adaptive assessments, how Bayesian Knowledge Tracing works, and FAQs.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
