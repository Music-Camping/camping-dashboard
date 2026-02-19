import { AppSidebar } from "@/components/sidebar";
import { PresentationProvider } from "@/contexts/presentation-context";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PresentationProvider>
      <AppSidebar>{children}</AppSidebar>
    </PresentationProvider>
  );
}
