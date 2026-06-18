import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { RouteProgress } from "@/components/route-progress";
import { IntroGate } from "@/components/site/intro-gate";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jasminetals — Full-Service Event Planning",
    template: "%s · Jasminetals",
  },
  description:
    "Jasminetals is a full-service event planning studio crafting weddings, corporate gatherings, and unforgettable celebrations across Delhi NCR.",
  metadataBase: new URL("https://jasminetals.com"),
  openGraph: {
    title: "Jasminetals — Full-Service Event Planning",
    description:
      "Weddings, corporate, social & destination events — beautifully planned, flawlessly coordinated.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ivory text-ink">
        <RouteProgress />
        <IntroGate />
        <AuthProvider>
          <AuthModal />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
