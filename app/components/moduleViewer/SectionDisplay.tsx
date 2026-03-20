import React from "react";

type SectionDisplayProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
};

const SectionDisplay = ({
  title,
  description,
  children,
}: SectionDisplayProps) => {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
      {(title || description) && (
        <header className="mb-4 border-b border-zinc-100 pb-3">
          {title ? (
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-2 text-sm text-zinc-600">{description}</p>
          ) : null}
        </header>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
};

export default SectionDisplay;
