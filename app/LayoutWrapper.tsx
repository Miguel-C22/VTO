"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Footer from "@/components/Footer/Footer";
import Nav from "@/components/Navigation/Nav";

interface LayoutWrapperProps {
  usersRole: string | null;
  usersEmail: string;
  children?: React.ReactNode;
}

const publicRoutes = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/user-settings",
];

const rolePermissions: Record<string, string[]> = {
  associate: ["/associates"],
  manager: ["/management", "/management/associates", "/management/history", "/associates"],
};

export default function LayoutWrapper({
  usersRole,
  usersEmail,
  children,
}: LayoutWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow access if the requested route is public
    if (publicRoutes.includes(pathname)) return;

    // Redirect if no user email is found
    if (!usersEmail) {
      router.push("/sign-in");
      return;
    }

    // If user has no role, redirect to assign role page
    if (!usersRole) {
      router.push("/assign-users-role");
      return;
    }

    // Check if user role has permission for the requested route
    const allowedRoutes = rolePermissions[usersRole] || [];
    if (!allowedRoutes.includes(pathname)) {
      router.push("/sign-in"); // Redirect unauthorized users
    }
  }, [pathname, usersEmail, usersRole, router]);

  // Define auth pages where Nav and Footer should NOT be shown
  const authPages = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password",  "/assign-users-role"];

  const isAuthPage = authPages.includes(pathname);

  return (
    <main className="flex flex-col min-h-screen">
      {!isAuthPage && <Nav usersEmail={usersEmail} usersRole={usersRole} />}
      <div className="flex-1">{children}</div>
      {!isAuthPage && <Footer />}
    </main>
  );
}