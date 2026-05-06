import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-clip">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
