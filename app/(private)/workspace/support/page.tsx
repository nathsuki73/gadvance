import React from "react";
import Header from "@/app/(public)/_components/header/Header";
import Footer from "@/app/components/Footer";
import { HelpCircle, LifeBuoy, Mail, FileText } from "lucide-react";

const Support = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-zinc-900">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Support Hero */}
        <div className="mb-12 bg-white p-12 rounded-[40px] border border-zinc-100 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl mb-6">
            <LifeBuoy size={32} />
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight">
            How can we help?
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Search our knowledge base or reach out to our team. We&apos;re here
            to ensure your learning journey with Gadvance is smooth and
            impactful.
          </p>
        </div>

        {/* Support Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Help Center Card */}
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <HelpCircle size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Help Center</h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Browse through our detailed guides and frequently asked questions.
            </p>
            <button className="text-blue-600 font-bold text-sm hover:underline">
              Browse Articles →
            </button>
          </div>

          {/* Documentation Card */}
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Documentation</h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Learn more about our platform&apos;s features and how to maximize
              your learning.
            </p>
            <button className="text-teal-600 font-bold text-sm hover:underline">
              Read Docs →
            </button>
          </div>

          {/* Contact Us Card */}
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Contact Us</h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Can&apos;t find what you&apos;re looking for? Talk to a member of
              our support team.
            </p>
            <button className="text-pink-600 font-bold text-sm hover:underline">
              Send Message →
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center p-8 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
          <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
            Average response time: &lt; 24 hours
          </p>
        </div>
      </main>

      {/* Footer added here */}
      <Footer />
    </div>
  );
};

export default Support;
