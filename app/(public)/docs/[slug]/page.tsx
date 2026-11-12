import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocArticle } from "../_components/primitives";
import { DOC_CONTENT } from "../_content";
import { DOCS, getDoc } from "../_lib/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
    openGraph: { title: `${doc.title} | GADvance Docs`, description: doc.description, type: "article" },
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  const Content = DOC_CONTENT[slug];
  if (!doc || !Content) notFound();

  return (
    <DocArticle doc={doc}>
      <Content />
    </DocArticle>
  );
}
