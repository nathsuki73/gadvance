import Link from "next/link";
import { H2, P, UL } from "../_components/primitives";

export default function PlatformFeatures() {
  return (
    <>
      <H2 id="accounts">Accounts and sign-in</H2>
      <UL>
        <li>Sign up with an email and password, or with Google.</li>
        <li>Email sign-ups are confirmed with a verification link that expires after 30 minutes.</li>
        <li>Forgot your password? Request a reset link from the sign-in page. Each link expires after 30 minutes, and requesting a new one cancels the previous link.</li>
      </UL>

      <H2 id="workspace">Your workspace</H2>
      <P>After you sign in, your workspace is the starting point. From there you can:</P>
      <UL>
        <li>See your enrolled courses under <strong>My Courses</strong> and continue where you left off.</li>
        <li>Browse <strong>Explore</strong> for other learning plans.</li>
        <li>Manage your <strong>Organizations</strong>.</li>
        <li>Update your profile, photo, and location.</li>
        <li>Search across courses from the header.</li>
      </UL>

      <H2 id="organizations">Organizations</H2>
      <P>
        Organizations are schools, offices, or agencies that use GADvance with their members. Joining one gives you
        access to the learning plans it provides. Join with an invitation link or a 6-digit code, and leave at any time
        from the Organizations page.
      </P>

      <H2 id="courses">Courses, modules, and lessons</H2>
      <UL>
        <li><strong className="font-medium text-zinc-800">Learning plans (courses)</strong> group one or more modules.</li>
        <li><strong className="font-medium text-zinc-800">Modules</strong> are divided into sections that contain lessons and assessments.</li>
        <li><strong className="font-medium text-zinc-800">Lessons</strong> are pages of reading and media. Your progress through each page is saved.</li>
      </UL>

      <H2 id="assessments">Assessments</H2>
      <UL>
        <li>Pre-tests and post-tests measure what you know before and after a module.</li>
        <li>Adaptive checkpoint quizzes adjust question difficulty using <Link href="/docs/how-bkt-works" className="text-primary underline">Bayesian Knowledge Tracing</Link>.</li>
        <li>Polls and surveys collect your opinions. They are not graded.</li>
      </UL>

      <H2 id="progress">Progress and results</H2>
      <P>
        GADvance tracks completed lessons and assessments in each module, and shows your assessment scores and whether
        you passed. It also keeps a mastery estimate for each topic. The estimate is not shown on screen; it is used to
        choose checkpoint question difficulty and to suggest lessons to review after an assessment.
      </P>

      <H2 id="certificates">Certificates</H2>
      <P>
        Some learning plans award a certificate when you complete them. If yours does, the certificate is generated
        with your name, and each one carries a verification code. Anyone can check a code on the{" "}
        <Link href="/verify" className="text-primary underline">certificate verification page</Link>.
      </P>
    </>
  );
}
