import Link from "next/link";
import { Callout, H2, P, Screenshot, Step, Steps } from "../_components/primitives";
import { SUPPORT_EMAIL, supportMailto } from "@/app/lib/support";
import signupShot from "../_assets/signup.webp";
import workspaceShot from "../_assets/workspace.webp";
import joinShot from "../_assets/join.webp";
import courseShot from "../_assets/course.webp";

export default function GettingStarted() {
  return (
    <>
      <P>
        Setting up takes a few minutes. You need an email address you can open, and if you are joining through a school
        or workplace, the 6-digit join code your administrator gave you.
      </P>

      <H2 id="create-account">1. Create your account</H2>
      <Steps>
        <Step title="Open the sign-up page">
          Select <strong>Sign Up</strong> in the top navigation, or go to <Link href="/auth/signup" className="text-primary underline">the sign-up page</Link>.
        </Step>
        <Step title="Choose how to sign up">
          Enter your email and a password, or continue with your Google account. With Google you can skip email
          verification because Google has already confirmed your address.
        </Step>
      </Steps>
      <Screenshot
        src={signupShot}
        alt="The GADvance Create Account page with fields for email address, password, and confirm password, a Create Account button, and a Sign in with Google button. Callout 1 marks the email field and callout 2 marks the Google button."
        caption="The sign-up page. (1) Sign up with email and password, or (2) continue with Google."
      />

      <H2 id="verify-email">2. Verify your email</H2>
      <Steps>
        <Step title="Open the verification email">
          GADvance sends a message titled &quot;Verify your email to finish creating your GADvance account&quot;.
        </Step>
        <Step title="Select Verify email address">The link opens GADvance and activates your account.</Step>
      </Steps>
      <Callout kind="warning" title="The link expires after 30 minutes">
        If it expires, choose resend on the verification page or sign up again to get a new link. Check
        your spam or promotions folder if the email does not arrive within a few minutes.
      </Callout>

      <H2 id="set-up-profile">3. Set up your profile</H2>
      <P>The first time you sign in, a short onboarding asks for three things:</P>
      <Steps>
        <Step title="Personal details">Your first and last name are required. Middle name, age, gender, and birthday are optional.</Step>
        <Step title="Contact and location">Optional. Your region, province, city or municipality, and barangay.</Step>
        <Step title="Photo and bio">Optional. Add a profile photo (JPEG or PNG, up to 5 MB) and a short bio.</Step>
      </Steps>
      <P>You can change these details later from your profile in the workspace.</P>

      <H2 id="join-organization">4. Join your organization</H2>
      <P>Skip this step if you are learning on your own.</P>
      <Steps>
        <Step title="Use the invitation link or code">
          Open the invitation link from your administrator, or go to <strong>Organizations</strong> in your workspace and
          choose <strong>Enter Code Manually</strong>.
        </Step>
        <Step title="Enter the 6-digit join code">GADvance shows the organization so you can confirm it before joining.</Step>
        <Step title="Select Confirm & Join">The organization&apos;s learning plans now appear for you.</Step>
      </Steps>
      <Screenshot
        src={workspaceShot}
        alt="The learner workspace welcome screen with a Discover Organizations card and a View Organizations button, plus Recently viewed modules and learning stats. Callout 1 marks View Organizations and callout 2 marks My Courses in the header."
        caption="Your workspace. (1) View Organizations to join one. (2) My Courses lists the courses you are enrolled in."
      />
      <Screenshot
        src={joinShot}
        alt="The join organization confirmation screen showing a verified organization named Sample State University with Enter Different Code and Confirm and Join buttons. Callout 1 marks the organization name and callout 2 marks Confirm and Join."
        caption="After you enter a code, (1) check the organization name, then (2) select Confirm & Join. Sample data shown."
      />

      <H2 id="find-and-enroll">5. Find a course and enroll</H2>
      <Steps>
        <Step title="Open Explore">Browse the available learning plans (courses) and open one to see its modules.</Step>
        <Step title="Enroll">Select <strong>Enroll now</strong> and confirm. Enrolled courses appear under <strong>My Courses</strong>.</Step>
      </Steps>
      <Screenshot
        src={courseShot}
        alt="A course page for Gender and Development with its description, an Enroll Now button, and a Module Overview listing three modules. Callout 1 marks Enroll Now and callout 2 marks the module overview."
        caption="A course page. (1) Enroll now to start. (2) The module overview shows what the course covers. Sample data shown."
      />

      <H2 id="start-learning">6. Start learning</H2>
      <P>
        Open a module to begin. Most modules start with a pre-test, then lessons and checkpoint quizzes, and end with a
        post-test. Your place is saved as you go, so you can leave and resume later. See{" "}
        <Link href="/docs/assessments-and-results" className="text-primary underline">Assessments and results</Link> for
        what to expect from each assessment.
      </P>
      <Callout kind="tip" title="Need a hand?">
        Email <a href={supportMailto("account")} className="font-medium text-primary underline">{SUPPORT_EMAIL}</a> with the
        subject &quot;GADvance Account Assistance&quot;.
      </Callout>
    </>
  );
}
