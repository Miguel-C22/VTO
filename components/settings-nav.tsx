"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  roles: string[];
}

interface SettingsNavProps {
  tabs: Tab[];
}

export function SettingsNav({ tabs }: SettingsNavProps) {
  const pathname = usePathname();

  return (
    <div className="border-b border-border mb-8">
      <nav className="flex space-x-8" aria-label="Settings tabs">
        {tabs.map((tab) => {
          const isActive = pathname === `/settings/${tab.id}`;
          return (
            <Link
              key={tab.id}
              href={`/settings/${tab.id}`}
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}