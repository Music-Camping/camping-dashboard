import { AppSidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppSidebar>{children}</AppSidebar>;
}
