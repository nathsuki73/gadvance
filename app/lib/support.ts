/**
 * Single source of truth for GADvance support contact details.
 *
 * Every public page, help text, and documentation article should import from
 * here instead of hard-coding an address, so the contact can change in one
 * place.
 */
export const SUPPORT_EMAIL = "projectgadvance@gmail.com";

export const SUPPORT_SUBJECTS = {
  support: "GADvance Support Request",
  bug: "GADvance Bug Report",
  security: "GADvance Security Concern",
  account: "GADvance Account Assistance",
  documentation: "GADvance Documentation Assistance",
  organization: "GADvance Organization Inquiry",
} as const;

export type SupportTopic = keyof typeof SUPPORT_SUBJECTS;

/** Builds a `mailto:` link with a descriptive subject line. */
export function supportMailto(topic: SupportTopic = "support"): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_SUBJECTS[topic])}`;
}
