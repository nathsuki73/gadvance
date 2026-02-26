import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Header Navigation */}
      <Header />

      {/* Main Content Hero */}
      <main className="flex flex-col items-center justify-center pt-32">
        <h1 className="text-4xl font-light text-zinc-400">
          Advancing Gender and Development.
        </h1>
      </main>
    </div>
  );
}
