"use client";

import React from "react";
import ReactDOM from "react-dom";

type EnrollmentRequiredDialogProps = {
  open: boolean;
  onClose: () => void;
  courseTitle?: string;
};

const EnrollmentRequiredDialog = ({
  open,
  onClose,
  courseTitle,
}: EnrollmentRequiredDialogProps) => {
  // Safe runtime execution guard for Next.js SSR hydration environments
  if (!open || typeof window === "undefined") return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-900/10 backdrop-blur-md p-4 animate-fade-in">
      {/* Container Card matches your Logout Dialog styling */}
      <div className="w-full max-w-md rounded-[24px] border border-zinc-100 bg-white p-10 shadow-xl shadow-zinc-200/40 transition-all">
        {/* Content Layout */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light tracking-tight text-zinc-900 leading-tight lowercase">
            access is{" "}
            <span className="italic font-serif text-[#8b5cf6]">locked</span>
          </h2>

          <p className="mt-4 text-base text-zinc-400 font-light leading-relaxed lowercase">
            please enroll in{" "}
            {courseTitle ? (
              <strong className="font-normal text-zinc-600">
                {courseTitle}
              </strong>
            ) : (
              "this course"
            )}{" "}
            to view and interact with the instructional syllabus roadmap
            modules.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <button
            onClick={onClose}
            className="w-full rounded-md border border-zinc-200 bg-white px-6 py-4 text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-700 font-medium lowercase"
          >
            close
          </button>

          <button
            onClick={() => {
              onClose();
              // Smoothly brings them back up to the top enrollment hero action banner
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full flex items-center justify-center rounded-md bg-[#8b5cf6] px-6 py-4 text-white transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-purple-50 font-medium lowercase"
          >
            enroll now
          </button>
        </div>

        {/* Subtle branding anchor matching the curriculum layout */}
        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">
            gadvance philippines
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default EnrollmentRequiredDialog;
