// "use client";

// import React, { useState, useEffect } from "react";
// import { getSession, useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { finishOnBoarding } from "../(public)/actions/onboarding";

// const Onboarding = () => {
//   const { data: session, update, status } = useSession();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [isRedirecting, setIsRedirecting] = useState(false);
//   const normalizedStatus = session?.user?.status?.trim().toLowerCase();
//   const shouldShowRedirecting =
//     isRedirecting ||
//     (status === "authenticated" && normalizedStatus === "active");

//   const waitForActiveSession = async () => {
//     for (let i = 0; i < 8; i += 1) {
//       const latest = await getSession();
//       const latestStatus = latest?.user?.status?.trim().toLowerCase();
//       if (latestStatus === "active") {
//         return true;
//       }

//       await new Promise((resolve) => setTimeout(resolve, 150));
//     }

//     return false;
//   };

//   // 1. TOP LEVEL HOOK: This watches for session updates globally
//   useEffect(() => {
//     if (status === "authenticated" && normalizedStatus === "active") {
//       router.replace("/workspace/module");
//     }
//   }, [status, normalizedStatus, router]);

//   // Handle loading state
//   if (status === "loading" || shouldShowRedirecting) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
//         <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-sm border border-zinc-100 text-center">
//           <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Almost there</h1>
//           <p className="text-gray-400 text-sm mt-2">
//             Redirecting you to Workspace Module...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const googleFirst = session?.user?.firstName || "";
//   const googleLast = session?.user?.lastName || "";

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const formData = new FormData(e.currentTarget);
//       const payload = {
//         firstName: String(formData.get("firstName") ?? ""),
//         middleName: String(formData.get("middleName") ?? ""),
//         lastName: String(formData.get("lastName") ?? ""),
//       };

//       const result = await finishOnBoarding(payload);

//       if (!result.success) {
//         alert(result.error);
//         return;
//       }

//       const nextStatus = result.user?.status ?? "active";
//       const nextEmail = result.user?.email ?? session?.user?.email;
//       const nextFirstName = result.userProfile?.first_name ?? payload.firstName;
//       const nextMiddleName =
//         result.userProfile?.middle_name ?? payload.middleName ?? "";
//       const nextLastName = result.userProfile?.last_name ?? payload.lastName;

//       const updatedSession = await update({
//         ...session,
//         user_profile: {
//           first_name: nextFirstName,
//           middle_name: nextMiddleName || null,
//           last_name: nextLastName,
//         },
//         user: {
//           ...session?.user,
//           status: nextStatus,
//           email: nextEmail,
//           firstName: nextFirstName,
//           middleName: nextMiddleName || null,
//           lastName: nextLastName,
//         },
//       });

//       const updatedStatus = updatedSession?.user?.status?.trim().toLowerCase();
//       if (updatedStatus !== "active") {
//         await waitForActiveSession();
//       }

//       setIsRedirecting(true);
//       console.log("User", result);
//       router.replace("/workspace/module");
//     } catch (error) {
//       console.error("Failed to complete onboarding:", error);
//       alert("Unable to finish onboarding right now. Please try again.");
//       setIsRedirecting(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
//       <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-sm border border-zinc-100">
//         <div className="text-center mb-8">
//           <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-100">
//             <span className="text-white font-black text-xl">G</span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             Complete Your Profile
//           </h1>
//           <p className="text-gray-400 text-sm mt-2">
//             Help us personalize your Gadvance experience.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block tracking-wider">
//               First Name
//             </label>
//             <input
//               name="firstName"
//               required
//               defaultValue={googleFirst}
//               className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base"
//             />
//           </div>

//           <div>
//             <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block tracking-wider">
//               Middle Name (Optional)
//             </label>
//             <input
//               name="middleName"
//               placeholder="Your middle name"
//               className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base"
//             />
//           </div>

//           <div>
//             <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block tracking-wider">
//               Last Name
//             </label>
//             <input
//               name="lastName"
//               required
//               defaultValue={googleLast}
//               className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-zinc-900 hover:bg-teal-600 text-white py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 mt-4 text-sm uppercase tracking-widest"
//           >
//             {loading ? "Creating Profile..." : "Finish Setup"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Onboarding;

"use client";

import React, { useState, useEffect } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import logoIcon from "@/app/assets/logo.ico";

const OnboardingPageOne = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Local state to hold form values for "Back" button persistence
  const [persistedData, setPersistedData] = useState<any>(null);

  const normalizedStatus = session?.user?.status?.trim().toLowerCase();
  const shouldShowRedirecting = isRedirecting || (status === "authenticated" && normalizedStatus === "active");

  // Load data from LocalStorage if user is coming back from Page 2
  useEffect(() => {
    const savedData = localStorage.getItem("onboarding_p1");
    if (savedData) {
      setPersistedData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && normalizedStatus === "active") {
      router.replace("/workspace");
    }
  }, [status, normalizedStatus, router]);

  if (status === "loading" || shouldShowRedirecting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans overflow-hidden">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">verifying session...</p>
        </div>
      </div>
    );
  }

  const googleFirst = persistedData?.firstName || session?.user?.firstName || "";
  const googleLast = persistedData?.lastName || session?.user?.lastName || "";

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const pageOneData = {
      firstName: formData.get("firstName"),
      middleName: formData.get("middleName"),
      lastName: formData.get("lastName"),
      age: formData.get("age"),
      gender: formData.get("gender"),
      dob: formData.get("dob"),
    };
    
    // Save to LocalStorage
    localStorage.setItem("onboarding_p1", JSON.stringify(pageOneData));
    
    // REDIRECT TO PAGE 2 (ContactLocation)
    router.push("/onboarding/contact-location");
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="relative h-7 w-7">
            <img src={logoIcon.src} alt="GADvance" className="object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-tight">GADvance</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-10">
            <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-[0.4em]">step 01 / 03</span>
            <h1 className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">Personal Identity</h1>
            <p className="text-zinc-400 text-sm font-light mt-2">Let's start with your basic information.</p>
          </div>

          <form className="space-y-5" onSubmit={handleNext}>
            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="First Name" 
                name="firstName" 
                defaultValue={googleFirst} 
                required 
              />
              <InputField 
                label="Last Name" 
                name="lastName" 
                defaultValue={googleLast} 
                required 
              />
            </div>

            <InputField 
                label="Middle Name" 
                name="middleName" 
                defaultValue={persistedData?.middleName || ""} 
                placeholder="Optional" 
            />

            <div className="grid grid-cols-2 gap-4">
               <InputField 
                label="Age" 
                name="age" 
                type="number" 
                defaultValue={persistedData?.age || ""} 
                required 
               />
               <InputField 
                label="Gender" 
                name="gender" 
                defaultValue={persistedData?.gender || ""} 
                placeholder="e.g. Female" 
                required 
               />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">Date of Birth</label>
              <input
                name="dob"
                type="date"
                required
                defaultValue={persistedData?.dob || ""}
                className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 bg-zinc-50/50 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] mt-4"
            >
              Continue to Address
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-[#8b5cf6] flex-col items-center justify-center p-12 text-white relative"
        style={{ clipPath: 'ellipse(100% 100% at 100% 50%)' }}>
        <div className="text-center px-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-[1.1] tracking-tight">
            Tell us about <br />
            <span className="font-semibold italic font-serif">who you are.</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            Your identity is the foundation of your journey here. We use this to 
            personalize your curriculum and verify your certifications.
          </p>
        </div>
        <div className="absolute bottom-12 text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, type = "text", placeholder, defaultValue, required = false }: any) => (
  <div>
    <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">{label}</label>
    <input
      name={name}
      type={type}
      required={required}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50 text-sm"
    />
  </div>
);

export default OnboardingPageOne;
