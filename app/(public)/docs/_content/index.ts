import type { ComponentType } from "react";
import Introduction from "./Introduction";
import GettingStarted from "./GettingStarted";
import ProjectOverview from "./ProjectOverview";
import PlatformFeatures from "./PlatformFeatures";
import AssessmentsAndResults from "./AssessmentsAndResults";
import HowBktWorks from "./HowBktWorks";
import FaqArticle from "./Faq";

/** Article body components keyed by registry slug. */
export const DOC_CONTENT: Record<string, ComponentType> = {
  introduction: Introduction,
  "getting-started": GettingStarted,
  "project-overview": ProjectOverview,
  "platform-features": PlatformFeatures,
  "assessments-and-results": AssessmentsAndResults,
  "how-bkt-works": HowBktWorks,
  faq: FaqArticle,
};
