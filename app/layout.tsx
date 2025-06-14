import { Geist } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "./LayoutWrapper";
import getUserData from "@/utils/getUserData";
import { ChoicesProvider } from "@/context/ChoicesContext";
import { CommentProvider } from "@/context/CommentContext";
import { SubmissionsProvider } from "@/context/SubmissionsContext";

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

async function getServerData() {
  const { data, authUser } = await getUserData();
  const usersEmail = authUser?.email || "";
  let usersRole = "";

  if (data) {
    usersRole = data[0]?.role_name || "";
  }

  return { usersEmail, usersRole };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user data on the server side
  const { usersEmail, usersRole } = await getServerData();

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
          <ChoicesProvider>
            <CommentProvider>
              <SubmissionsProvider>
                <main className="flex flex-col min-h-screen">
                  <LayoutWrapper usersEmail={usersEmail} usersRole={usersRole}>
                    {children}
                  </LayoutWrapper>
                </main>
              </SubmissionsProvider>
            </CommentProvider>
          </ChoicesProvider>
      </body>
    </html>
  );
}

