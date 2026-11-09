import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/provider/SessionProvider";
import logoIcon from "@/app/assets/logo.ico";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "GADvance is an adaptive e-learning platform for gender sensitivity and Gender and Development (GAD) education. Assessments adjust to each learner using Bayesian Knowledge Tracing.";

export const metadata: Metadata = {
  title: {
    default: "GADvance | Adaptive Gender and Development Learning",
    template: "%s | GADvance",
  },
  description: SITE_DESCRIPTION,
  applicationName: "GADvance",
  icons: {
    icon: logoIcon.src,
  },
  openGraph: {
    type: "website",
    siteName: "GADvance",
    title: "GADvance | Adaptive Gender and Development Learning",
    description: SITE_DESCRIPTION,
    locale: "en_PH",
  },
  twitter: {
    card: "summary",
    title: "GADvance | Adaptive Gender and Development Learning",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
