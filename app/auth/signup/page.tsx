// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { GoogleButton } from "@/app/components/ui/GoogleButton";
// import { handleSignIn } from "../../lib/auth";
// import { handleRegistration } from "./actions";
// import { z } from "zod";
// import { useSession } from "next-auth/react";
// import logoIcon from "@/app/assets/logo.ico";
// import LoginImg from "@/app/assets/LoginImg.webp";

// const signUpSchema = z
//   .object({
//     email: z.string().email("Invalid email address"),
//     password: z
//       .string()
//       .min(8, "Password must be at least 8 characters")
//       .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
//       .regex(/[0-9]/, "Password must contain at least one number"),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// const SignUp = () => {
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   // Handle auto-redirect if session exists
//   useEffect(() => {
//     if (status === "authenticated") {
//       if (session?.user?.status === "onboarding") {
//         router.push("/onboarding");
//       } else {
//         router.push("/workspace/module");
//       }
//     }
//   }, [status, session, router]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     if (errors[e.target.name]) {
//       setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});

//     const result = signUpSchema.safeParse(formData);
//     if (!result.success) {
//       const formattedErrors: Record<string, string> = {};
//       result.error.issues.forEach((issue) => {
//         formattedErrors[String(issue.path[0])] = issue.message;
//       });
//       setErrors(formattedErrors);
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await handleRegistration(
//         formData.email,
//         formData.password,
//         formData.confirmPassword,
//       );
//       if (response.success) {
//         setLoading(false);
//         router.push(
//           `/auth/verify-otp?context=signup&email=${encodeURIComponent(formData.email)}`,
//         );
//       } else {
//         setLoading(false);
//         setErrors({ form: response.error || "An error occurred" });
//       }
//     } catch (err) {
//       setLoading(false);
//       console.error("Registration Error:", err);
//       setErrors({ form: "Connection failed. Check your network." });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-zinc-900">
//       <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-sm flex overflow-hidden min-h-[650px] border border-zinc-100">
//         <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-between">
//           <div>
//             {/* Logo */}
//             <div className="flex items-center gap-2 mb-10">
//               <div className="relative h-9 w-9 shrink-0">
//                 <img
//                   src={logoIcon.src}
//                   alt="GADVance logo"
//                   className="h-full w-full object-contain"
//                 />
//               </div>
//               <span className="text-xl font-semibold tracking-tight text-gray-800">
//                 GADVance
//               </span>
//             </div>

//             {/* --- ADDED LOADING STATE START --- */}
//             {status === "loading" ? (
//               <div className="flex flex-col items-center justify-center py-12">
//                 <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
//                 <p className="text-sm text-gray-400 font-medium">
//                   Verifying session...
//                 </p>
//               </div>
//             ) : status === "authenticated" ? (
//               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//                 <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
//                   Welcome back!
//                 </h1>
//                 <p className="text-gray-400 mb-10 text-sm">
//                   Redirecting you to your workspace...
//                 </p>
//               </div>
//             ) : (
//               /* --- ADDED LOADING STATE END --- */
//               <>
//                 <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
//                   Create <br />{" "}
//                   <span className="text-teal-500">New Account</span>
//                 </h1>
//                 <p className="text-gray-400 mb-8 text-sm">
//                   Please fill in the details below to secure your account.
//                 </p>

//                 {errors.form && (
//                   <p className="text-xs text-red-500 font-semibold mb-3">
//                     {errors.form}
//                   </p>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div>
//                     <input
//                       name="email"
//                       type="email"
//                       placeholder="Email Address"
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-4 rounded-xl border ${
//                         errors.email ? "border-red-400" : "border-gray-200"
//                       } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50`}
//                     />
//                     {errors.email && (
//                       <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase tracking-wider">
//                         {errors.email}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <input
//                       name="password"
//                       type="password"
//                       placeholder="Password"
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-4 rounded-xl border ${
//                         errors.password ? "border-red-400" : "border-gray-200"
//                       } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50`}
//                     />
//                     {errors.password && (
//                       <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase tracking-wider">
//                         {errors.password}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <input
//                       name="confirmPassword"
//                       type="password"
//                       placeholder="Confirm Password"
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-4 rounded-xl border ${
//                         errors.confirmPassword
//                           ? "border-red-400"
//                           : "border-gray-200"
//                       } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50`}
//                     />
//                     {errors.confirmPassword && (
//                       <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase tracking-wider">
//                         {errors.confirmPassword}
//                       </p>
//                     )}
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-100 mt-2 active:scale-[0.98] disabled:opacity-70"
//                   >
//                     {loading ? "Creating Account..." : "Sign Up"}
//                   </button>

//                   <div className="relative flex items-center py-6">
//                     <div className="flex-grow border-t border-gray-100"></div>
//                     <span className="flex-shrink mx-4 text-gray-300 text-[10px] uppercase tracking-widest font-bold">
//                       Or continue with
//                     </span>
//                     <div className="flex-grow border-t border-gray-100"></div>
//                   </div>

//                   <GoogleButton onClick={handleSignIn} />
//                 </form>
//               </>
//             )}
//           </div>

//           {!session && status !== "loading" && (
//             <p className="text-sm text-gray-500 mt-8">
//               Already have an account?{" "}
//               <Link
//                 href="/auth/signin"
//                 className="text-teal-600 font-bold hover:underline"
//               >
//                 Sign In
//               </Link>
//             </p>
//           )}
//         </div>

//         {/* Right Side: Decorative Panel */}
//         <div className="hidden lg:block lg:w-1/2 p-6">
//           <div className="relative h-full w-full overflow-hidden rounded-[2.5rem]">
//             <Image
//               src={LoginImg}
//               alt="Login illustration"
//               fill
//               priority
//               className="object-cover"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUp;


"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleButton } from "@/app/components/ui/GoogleButton";
import { handleSignIn } from "../../lib/auth";
import { handleRegistration } from "./actions";
import { z } from "zod";
import { useSession } from "next-auth/react";
import logoIcon from "@/app/assets/logo.ico";

const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignUp = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.status === "onboarding") {
        router.push("/onboarding");
      } else {
        router.push("/workspace/module");
      }
    }
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await handleRegistration(
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      if (response.success) {
        setLoading(false);
        router.push(
          `/auth/verify-otp?context=signup&email=${encodeURIComponent(
            formData.email
          )}`
        );
      } else {
        setLoading(false);
        setErrors({ form: response.error || "An error occurred" });
      }
    } catch (err) {
      setLoading(false);
      console.error("Registration Error:", err);
      setErrors({ form: "Connection failed. Check your network." });
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      {/* Left Side: Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        {/* Logo - Top Left */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="relative h-7 w-7">
            <img
              src={logoIcon.src}
              alt="GADVance logo"
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">GADvance</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          {status === "loading" ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#00A8CC] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-zinc-400 font-medium tracking-tight">
                Verifying session...
              </p>
            </div>
          ) : session ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
                Welcome back!
              </h1>
              <p className="text-zinc-400 mb-10 text-sm lowercase font-light">
                Redirecting to your workspace...
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-8 tracking-tight">
                Create Account
              </h1>
              <p className="text-zinc-400 mb-8 text-sm font-light">
                Fill in the details to secure your account
              </p>

              {errors.form && (
                <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-red-600">
                  {errors.form}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.email ? "border-red-400" : "border-zinc-100"
                    } focus:outline-none focus:ring-4 focus:ring-sky-50/50 focus:border-[#00A8CC] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50`}
                  />
                  {errors.email && (
                    <p className="text-[9px] text-red-500 font-bold mt-1.5 uppercase tracking-wider">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                      Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.password ? "border-red-400" : "border-zinc-100"
                      } focus:outline-none focus:ring-4 focus:ring-sky-50/50 focus:border-[#00A8CC] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                      Confirm
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.confirmPassword ? "border-red-400" : "border-zinc-100"
                      } focus:outline-none focus:ring-4 focus:ring-sky-50/50 focus:border-[#00A8CC] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50`}
                    />
                  </div>
                </div>
                {(errors.password || errors.confirmPassword) && (
                  <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider">
                    {errors.password || errors.confirmPassword}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-sky-100 active:scale-[0.98] disabled:opacity-70 mt-2"
                >
                  {loading ? "Creating Account..." : "Create account"}
                </button>

                <div className="relative flex items-center py-2">
                  <div className="grow border-t border-zinc-100"></div>
                  <span className="shrink mx-4 text-zinc-300 text-[12px] uppercase tracking-[0.2em] font-bold">
                    Or
                  </span>
                  <div className="grow border-t border-zinc-100"></div>
                </div>

                <GoogleButton onClick={handleSignIn} />
              </form>
            </>
          )}

          {!session && status !== "loading" && (
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mt-8 text-center">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-[#00A8CC] hover:underline transition-colors"
              >
                sign in
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Right Side: Decorative Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-[#00A8CC] flex-col items-center justify-center p-12 text-white relative"
        style={{
          clipPath: "ellipse(100% 100% at 100% 50%)",
        }}
      >
        <div className="text-center px-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-[1.1] tracking-tight">
            Empower. Educate.
            <br />
            <span className="font-semibold italic font-serif">
              Advance Equity.
            </span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            Join our learning community. empower yourself with knowledge, build
            meaningful connections, and create an inclusive future.
          </p>
        </div>

        <div className="absolute bottom-12 left-0 right-0 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. all rights reserved.
        </div>
      </div>
    </div>
  );
};

export default SignUp;