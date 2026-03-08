import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // send code to backend to exchange for token
      const res = await fetch("/api/auth/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.isNewUser) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    }

    handleAuth();
  }, []);

  return <p>Logging you in...</p>;
}
