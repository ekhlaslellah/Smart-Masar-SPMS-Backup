import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geist = Geist({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "Smart Masar SPMS — منظومة إدارة الاستراتيجية والأهداف والأداء المؤسسي",
  description: "المنظومة الرقمية المتكاملة لإدارة الاستراتيجية والأهداف المؤسسية واتفاقيات الأداء الوظيفي في سمارت مسار (Smart Masar).",
  openGraph: {
    title: "Smart Masar SPMS — منظومة إدارة الاستراتيجية والأهداف والأداء المؤسسي",
    description: "المنظومة الرقمية المتكاملة لإدارة الاستراتيجية والأهداف المؤسسية واتفاقيات الأداء الوظيفي في سمارت مسار (Smart Masar).",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
