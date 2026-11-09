import Link from "next/link";
import { Faq, H2, P } from "../_components/primitives";
import { SUPPORT_EMAIL, supportMailto } from "@/app/lib/support";

export default function FaqArticle() {
  return (
    <>
      <H2 id="account">Account access</H2>
      <Faq question="I did not receive the verification email.">
        Check your spam and promotions folders, and make sure you typed your email correctly. Verification links expire
        after 30 minutes; choose resend on the verification page or sign up again to get a new one.
      </Faq>
      <Faq question="I forgot my password.">
        Choose <strong>Forgot password</strong> on the <Link href="/auth/signin" className="text-primary underline">sign-in page</Link> and
        enter your email. The reset link expires after 30 minutes, and only the newest link works. For security you can
        request up to three reset emails every 15 minutes.
      </Faq>
      <Faq question="I signed up with Google. Do I need a password?">
        No. Continue signing in with the same Google account. If you also want to sign in with a password, use
        Forgot password to set one.
      </Faq>
      <Faq question="Sign-in says my account is not allowed here.">
        The learner site is for learner accounts. Administrator accounts sign in through the GADvance Admin Portal.
      </Faq>

      <H2 id="adaptive">Adaptive learning</H2>
      <Faq question="Why did I get different questions than my classmate?">
        Checkpoint quizzes choose questions from your own mastery estimate, so two learners rarely see the same set.
        See <Link href="/docs/how-bkt-works" className="text-primary underline">How BKT works</Link>.
      </Faq>
      <Faq question="Why did one wrong answer drop my mastery so much?">
        When your estimate is still low, each answer carries a lot of weight. As you answer more questions the estimate
        becomes steadier, and correct answers quickly bring it back up.
      </Faq>
      <Faq question="Can I see my mastery estimate?">
        Yes. While you are in a module, the lesson progress panel lists the module&apos;s knowledge components and shows
        your estimated mastery for each one, based on your responses so far. Use the refresh button to update it.
      </Faq>

      <H2 id="assessment-questions">Assessments</H2>
      <Faq question="I lost my connection during a quiz. Is my work lost?">
        No. Answers are saved as you go. Reopen the assessment to continue the attempt that is in progress.
      </Faq>
      <Faq question="Can I retake an assessment?">
        Where the course allows retakes, a retake option appears on the result screen. Your earlier attempts stay on
        record.
      </Faq>
      <Faq question="Why can I not open the next part of the module?">
        Some assessments must be passed before you can continue. Review the suggested lessons and try again.
      </Faq>

      <H2 id="organization-questions">Organizations</H2>
      <Faq question="My join code does not work.">
        Join codes are 6 characters and are not case-sensitive. Check that you copied the whole code, then ask your
        administrator to confirm it; administrators can change a code, which makes the old one stop working.
      </Faq>
      <Faq question="How do I leave an organization?">
        Open <strong>Organizations</strong> in your workspace and choose leave on the organization. You lose access to
        learning plans that are only available through it.
      </Faq>

      <H2 id="mobile">Mobile access</H2>
      <Faq question="Can I use GADvance on my phone?">
        Yes. GADvance runs in the browser and adapts to phone and tablet screens. There is no separate app to install.
      </Faq>

      <H2 id="contact">Still need help?</H2>
      <P>
        Email <a href={supportMailto("support")} className="font-medium text-primary underline">{SUPPORT_EMAIL}</a>. For a
        faster answer, use a subject line such as &quot;GADvance Bug Report&quot; or &quot;GADvance Account
        Assistance&quot; and include what you were doing, what you expected, and your device and browser. Never send
        your password.
      </P>
    </>
  );
}
