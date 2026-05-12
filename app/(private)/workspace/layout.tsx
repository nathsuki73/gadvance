export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#fffdf8] text-zinc-900">
      {children}
    </div>
  );
}
