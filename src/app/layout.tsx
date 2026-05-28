import type { Metadata } from "next";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/shared/providers/providers";
import { ExtensionCleanup } from "@/shared/components/extension-cleanup";
import { createSupabaseServerClient } from "@/core/lib/supabase/server";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudioHub",
  description: "Plataforma profissional de gestão de estúdios",
  icons: {
    icon: "/logo.png?v=2",
    shortcut: "/logo.png?v=2",
    apple: "/logo.png?v=2",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${manrope.variable} ${jetBrainsMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-zinc-100" suppressHydrationWarning>
        <ExtensionCleanup />
        <Providers initialUser={user ?? null} initialSession={session ?? null}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
