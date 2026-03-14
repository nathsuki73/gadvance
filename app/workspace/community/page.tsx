import React from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Users, MessageSquare, Share2 } from "lucide-react";

const Community = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-zinc-900">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="mb-12 bg-white p-10 rounded-[40px] border border-zinc-100 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-6">
            <Users size={32} />
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight">
            Our Community
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Connect with learners from around the world. Share insights, ask
            questions, and grow together in a space built for collaboration.
          </p>
        </div>

        {/* Community Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Discussion Forums</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Engage in meaningful conversations about course materials and
              industry trends.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Share2 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Resource Sharing</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Upload and access helpful study guides, templates, and
              community-made content.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Study Groups</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Join or create groups to collaborate on projects and prepare for
              certifications.
            </p>
          </div>
        </div>
      </main>

      {/* Footer added here */}
      <Footer />
    </div>
  );
};

export default Community;
