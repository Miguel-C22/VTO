import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  LogOut,
  BarChart3,
  Users,
  Building,
  BookOpen,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOutAction } from "@/app/actions";
import { createClient } from "@/utils/supabase/server";

// All menu items with role requirements
const allMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ["manager"],
  },
  {
    title: "Alerts",
    url: "/alerts",
    icon: BarChart3,
    roles: ["manager"],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    roles: ["manager"],
  },
  {
    title: "Sales Associate",
    url: "/sales-assist-form",
    icon: Inbox,
    roles: ["manager", "associate"],
  },
  {
    title: "MY Training Plan",
    url: "/my-training-plan",
    icon: BookOpen,
    roles: ["associate"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["manager", "associate"],
  },
];

export async function AppSidebar() {
  // Get user profile data
  const supabase = await createClient();

  let userRole = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      userRole = profile?.role;
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
  }

  // Filter menu items based on user role
  const visibleItems = allMenuItems.filter(
    (item) => userRole && item.roles.includes(userRole)
  );
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <form action={signOutAction} className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
