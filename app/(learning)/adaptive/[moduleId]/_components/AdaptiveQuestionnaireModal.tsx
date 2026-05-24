"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";

type PreferenceType = "video" | "reading" | null;

interface AdaptiveQuestionnaireModalProps {
  isOpen?: boolean;
  onSubmit: (preference: PreferenceType) => void;
}

export default function AdaptiveQuestionnaireModal({
  isOpen = true,
  onSubmit,
}: AdaptiveQuestionnaireModalProps) {
  const [step, setStep] = useState(1);
  const [selectedPreference, setSelectedPreference] =
    useState<PreferenceType>(null);
  const [reflection, setReflection] = useState(
    "I prefer a mix of visual and text content to reinforce my learning.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const preferenceOptions = [
    {
      id: "video" as const,
      label: "Video & Visual Content",
      desc: "I learn best watching explainer videos, animations, visual diagrams, and dynamic media clips.",
      icon: "🎬",
    },
    {
      id: "reading" as const,
      label: "Reading & Text Articles",
      desc: "I learn best by reading detailed written content, case studies, articles, and structured text explanations.",
      icon: "📚",
    },
  ];

  const handleNextStep = () => {
    if (step < 3) setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPreference || !reflection.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      onSubmit(selectedPreference);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col justify-between w-full h-full sm:h-auto sm:max-w-2xl rounded-none sm:rounded-2xl border-0 sm:border border-zinc-100 bg-white p-6 md:p-10 shadow-2xl transition-all overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c4b5fd] text-white shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
                  Adaptive Learning Setup
                </h2>
                <p className="text-sm text-zinc-400 font-light mt-0.5">
                  Step {step} of 3 &bull; Configure your learning style
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-[#a78bfa] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* STEP 1: Welcome */}
            {step === 1 && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <div className="rounded-2xl bg-linear-to-br from-[#faf5ff] to-[#f5f3ff] border border-[#e9d5ff] p-6">
                  <p className="text-sm leading-relaxed text-zinc-700">
                    Welcome to Adaptive Learning! This mode personalizes your
                    lesson content based on your preferred learning style. Your
                    responses will shape which content formats and block types
                    appear throughout your lessons.
                  </p>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  We'll ask you two quick questions to configure your dashboard,
                  then immediately load your personalized content.
                </p>
              </div>
            )}

            {/* STEP 2: Preference Selection */}
            {step === 2 && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-zinc-500 md:text-base">
                    How do you prefer to learn?
                  </span>
                  <p className="text-xs text-zinc-400 font-light">
                    Select your primary learning style.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3.5">
                  {preferenceOptions.map((option) => {
                    const isChecked = selectedPreference === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedPreference(option.id)}
                        className={`group flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all ${
                          isChecked
                            ? "border-[#a78bfa] bg-[#c4b5fd]/5 shadow-sm"
                            : "border-zinc-100 bg-white hover:bg-zinc-50/80"
                        }`}
                      >
                        <div className="text-2xl mt-0.5">{option.icon}</div>
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-sm font-bold text-zinc-800 md:text-base">
                            {option.label}
                          </span>
                          <p className="text-xs md:text-sm text-zinc-400 font-light leading-relaxed">
                            {option.desc}
                          </p>
                        </div>
                        <div
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                            isChecked
                              ? "border-[#a78bfa] bg-[#a78bfa] text-white"
                              : "border-zinc-300 bg-white group-hover:border-zinc-400"
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Reflection */}
            {step === 3 && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reflection"
                    className="text-sm font-semibold text-zinc-500 md:text-base"
                  >
                    Tell us more about your learning style:
                  </label>
                  <p className="text-xs md:text-sm text-zinc-400 font-light">
                    This helps us fine-tune the difficulty and pacing of your
                    lessons.
                  </p>
                </div>
                <textarea
                  id="reflection"
                  rows={5}
                  required
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Example: I learn better when... / I struggle with..."
                  className="w-full rounded-xl border border-zinc-200 p-4 text-sm text-zinc-800 placeholder-zinc-400 transition-all focus:border-[#a78bfa] focus:outline-none focus:ring-1 focus:ring-[#a78bfa]/30"
                />
              </div>
            )}
          </form>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 border-t border-zinc-100 pt-5 flex items-center justify-between pb-4 sm:pb-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-colors disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
          </div>

          <div>
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={step === 2 && !selectedPreference}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-95 disabled:scale-100 disabled:opacity-40"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !reflection.trim()}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-95 disabled:scale-100 disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    Start Learning
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
