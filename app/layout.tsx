import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/toggle-theme";
import { createClient } from "@/utils/supabase/server";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user has completed onboarding
  let isOnboardingComplete = false;
  let userRole = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, role")
      .eq("id", user.id)
      .single();

    isOnboardingComplete = !!(profile && profile.dealership_id);
    userRole = profile?.role;
  }

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          {user && isOnboardingComplete ? (
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1">
                <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex h-14 items-center justify-between px-4">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2">
                      <ModeToggle />
                    </div>
                  </div>
                </header>
                <div className="flex-1">
                  {children}
                </div>
              </main>
            </SidebarProvider>
          ) : (
            // No sidebar for auth pages and onboarding pages
            <div className="min-h-screen">
              {children}
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
