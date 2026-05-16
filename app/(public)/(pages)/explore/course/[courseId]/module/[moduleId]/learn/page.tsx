// app/courses/[courseId]/modules/[moduleId]/learn/page.tsx

"use client";

import React, {
  use,
  useEffect,
  useState,
} from "react";

import { Loader2 } from "lucide-react";

import { notFound } from "next/navigation";

import ModuleViewer from "./_componentsasd/ModuleViewer";
import { ModuleResponse } from "../types";
import { getLearningModule } from "../service";

const LearnPage = ({
  params,
}: {
  params: Promise<{
    moduleId: string;
  }>;
}) => {
  const resolvedParams = use(params);

  const moduleId =
    resolvedParams.moduleId;

  const [module, setModule] =
    useState<ModuleResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const result =
          await getLearningModule(
            moduleId,
          );

        if (
          !result.success ||
          !result.data
        ) {
          throw new Error();
        }

        setModule(result.data);
      } catch (err) {
        console.error(err);

        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error || !module) {
    notFound();
  }

  return (
    <ModuleViewer module={module} />
  );
};

export default LearnPage;