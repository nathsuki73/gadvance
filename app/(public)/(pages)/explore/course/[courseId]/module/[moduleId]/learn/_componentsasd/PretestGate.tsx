// components/explore/module/PretestGate.tsx

"use client";

import React, { useState } from "react";

import Pretest from "@/app/components/pretest";

type PretestGateProps = {
  moduleTitle: string;
  accentColor: string;
  children: React.ReactNode;
};

const PretestGate = ({
  moduleTitle,
  accentColor,
  children,
}: PretestGateProps) => {
  const [isCompleted, setIsCompleted] =
    useState(false);

  if (!isCompleted) {
    return (
      <div className="rounded-3xl bg-white md:p-9">
        <Pretest
          isOpen
          moduleTitle={moduleTitle}
          accentColor={accentColor}
          onClose={() =>
            setIsCompleted(true)
          }
          onComplete={() =>
            setIsCompleted(true)
          }
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default PretestGate;