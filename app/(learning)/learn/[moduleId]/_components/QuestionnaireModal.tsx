"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Check,
} from "lucide-react";

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { choiceIds: string[]; reflectionText: string }) => void;
}

export default function QuestionnaireModal({
  isOpen,
  onClose,
  onSubmit,
}: QuestionnaireModalProps) {
  const [step, setStep] = useState(1);
  // Changed state from a single string to an array to handle checkboxes safely
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [reflection, setReflection] = useState(
    "I learn best when I can watch media content first to get the overall context, combined with structured case summaries to help reinforce the historical data concepts.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const scenarioOptions = [
    {
      id: "A",
      label: "Interactive Videos & Media Clips",
      desc: "I learn best watching short documentaries, explainer videos, dynamic visual summaries, and media clips.",
    },
    {
      id: "B",
      label: "Deep Dive Readings & Essays",
      desc: "I learn best by reading structured text explanations, sociological case studies, and written articles.",
    },
  ];

  // Helper function to toggle checkboxes cleanly in the array hook
  const handleToggleCheckbox = (id: string) => {
    setSelectedChoices((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleNextStep = () => {
    if (step < 3) setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChoices.length === 0 || !reflection.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      onSubmit({
        choiceIds: selectedChoices,
        reflectionText: reflection,
      });
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-200">
      {/* Mobile: Full Screen | Desktop: Large centered card */}
      <div className="relative flex flex-col justify-between w-full h-full sm:h-auto sm:max-w-2xl rounded-none sm:rounded-2xl border-0 sm:border border-zinc-100 bg-white p-6 md:p-10 shadow-2xl transition-all overflow-y-auto">
        <div>
          {/* Header Block */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c4b5fd] text-white shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 md:text-2xl">
                  Personalize Your Learning
                </h2>
                <p className="text-sm text-zinc-400 font-light mt-0.5">
                  Step {step} of 3 &bull; Setting up your workspace
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-[#a78bfa] transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Master Form Content Pipeline */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* STEP 1: WELCOME & THE TOPIC CONTEXT */}
            {step === 1 && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-5 md:p-6">
                  <span className="text-xs font-bold tracking-wider text-[#a78bfa] uppercase block mb-2">
                    Current Module Focus
                  </span>
                  <p className="text-base md:text-lg leading-relaxed text-zinc-700 font-medium">
                    &ldquo;Analyzing workplace pipelines, structural barriers,
                    and how historical wage gaps impact leadership
                    representation in professional fields.&rdquo;
                  </p>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed md:text-base">
                  Welcome! Before starting, our adaptive setup will check your
                  layout preferences. Instead of an intimidating test, this
                  quick walkthrough configures your dashboard design to match
                  the exact way you process information best.
                </p>
              </div>
            )}

            {/* STEP 2: MULTI-SELECT CHECKBOX CONFIGURATION */}
            {step === 2 && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-zinc-500 md:text-base">
                    How do you prefer to explore this topic?
                  </span>
                  <p className="text-xs text-zinc-400 font-light">
                    Select all formats that apply to your style.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3.5">
                  {scenarioOptions.map((option) => {
                    const isChecked = selectedChoices.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleToggleCheckbox(option.id)}
                        className={`group flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all ${
                          isChecked
                            ? "border-[#a78bfa] bg-[#c4b5fd]/5 shadow-sm"
                            : "border-zinc-100 bg-white hover:bg-zinc-50/80"
                        }`}
                      >
                        {/* Custom Minimalist Checkbox Box Structure */}
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                            isChecked
                              ? "border-[#a78bfa] bg-[#a78bfa] text-white"
                              : "border-zinc-300 bg-white group-hover:border-zinc-400"
                          }`}
                        >
                          {isChecked && (
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-zinc-800 md:text-base">
                            {option.label}
                          </span>
                          <p className="text-xs md:text-sm text-zinc-400 font-light leading-relaxed">
                            {option.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: REFLECTION TEXT INPUT */}
            {step === 3 && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reflection"
                    className="text-sm font-semibold text-zinc-500 md:text-base"
                  >
                    In a sentence or two, tell us more about what helps you
                    learn best:
                  </label>
                  <p className="text-xs md:text-sm text-zinc-400 font-light">
                    Our backend engine uses your text snippet to adjust the
                    depth and difficulty layers of your active workspace.
                  </p>
                </div>
                <textarea
                  id="reflection"
                  rows={5}
                  required
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Example: I follow along better when I can watch animated explainers or media case clips... / I focus much easier when I can read detailed articles and text passages..."
                  className="w-full rounded-xl border border-zinc-200 p-4 text-sm text-zinc-800 placeholder-zinc-400 transition-all focus:border-[#a78bfa] focus:outline-none focus:ring-1 focus:ring-[#a78bfa]/30"
                />
              </div>
            )}
          </form>
        </div>

        {/* Dynamic Footer Navigation Controls */}
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
                disabled={step === 2 && selectedChoices.length === 0}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-95 disabled:scale-100 disabled:opacity-40"
              >
                Continue
                <ArrowRight className="h-4 w-4 text-[#a78bfa]" />
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
                    Setting Up Layout...
                  </>
                ) : (
                  <>
                    Launch Workspace
                    <CheckCircle2 className="h-4 w-4 text-[#a78bfa]" />
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
