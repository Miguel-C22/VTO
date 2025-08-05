import { ThemeProvider } from "next-themes";
import { ModeToggle } from "@/components/toggle-theme";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
