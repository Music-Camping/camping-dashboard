"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { FilterProvider } from "@/hooks/use-filters";
import { logout } from "@/lib/auth/actions";
import { usePresentationContext } from "@/contexts/presentation-context";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { label: "Relatórios", href: "/relatorios", icon: FileTextIcon },
  { label: "Configurações", href: "/configuracoes", icon: SettingsIcon },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isPresentationMode } = usePresentationContext();

  return (
    <SidebarProvider defaultOpen>
      <FilterProvider>
        {!isPresentationMode && (
          <Sidebar collapsible="icon">
            <SidebarHeader className="h-16 border-b p-0">
              <div className="flex h-full items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                <img
                  src="/camping.png"
                  alt="Camping"
                  className="size-8 shrink-0 rounded-md"
                />
                <h2 className="font-[family-name:var(--font-montserrat)] text-lg font-extrabold tracking-wide text-[#E8DED2] group-data-[collapsible=icon]:hidden">
                  CAMPING
                </h2>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.label}
                          >
                            <Link href={item.href}>
                              <Icon />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Sair" onClick={() => logout()}>
                    <LogOutIcon />
                    <span>Sair</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        )}
        <SidebarInset>
          {!isPresentationMode && <AppHeader />}
          <div
            className={
              isPresentationMode
                ? "h-screen overflow-hidden"
                : "flex flex-1 flex-col gap-4 p-4"
            }
          >
            {children}
          </div>
        </SidebarInset>
      </FilterProvider>
    </SidebarProvider>
  );
}
