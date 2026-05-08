import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

type Props = {
  children: React.ReactNode;
};

export default function DashboardFrame({ children }: Props) {
  return (
    <SidebarProvider>
      <Toaster />
      <div className="flex overflow-auto w-full max-h-screen p-2 gap-2">
        {children}
      </div>
    </SidebarProvider>
  );
}
