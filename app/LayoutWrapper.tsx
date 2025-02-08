"use client";

import Footer from "@/components/Footer/Footer";
import Nav from "@/components/Navigation/Nav";
import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
  usersRole: string;
  usersEmail: string;
  children?: React.ReactNode;
}

export default function LayoutWrapper({
  usersRole,
  usersEmail,
  children,
}: LayoutWrapperProps) {
  const pathname = usePathname();

  // Define auth pages where Nav and Footer should NOT be shown
  const authPages = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

  const isAuthPage = authPages.includes(pathname);

  return (
    <main className="flex flex-col min-h-screen">
      {!isAuthPage && <Nav usersEmail={usersEmail} usersRole={usersRole}/>}
      <div className="flex-1">{children}</div>
      {!isAuthPage && <Footer />}
    </main>
  );
}