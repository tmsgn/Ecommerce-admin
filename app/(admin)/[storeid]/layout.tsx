import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumbs } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import prismadb from "@/lib/prismadb";
import { ThemeProvider } from "@/providers/theme-provider";
import { DarkModeToggle } from "@/components/dark-mode-toggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { storeid: string };
}

export default async function DashboardLayout({
  children,
  params: { storeid },
}: DashboardLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const store = await prismadb.store.findFirst({
    where: {
      userId: userId,
      id: storeid,
    },
  });

  if (!store) {
    redirect("/sign-in");
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar storeid={storeid} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <DynamicBreadcrumbs />
              <div className="flex-1" />
              <DarkModeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto px-4 pt-2">
            <Separator className="mb-4" />
            <div className="">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
