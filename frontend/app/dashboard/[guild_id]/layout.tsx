import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <Toaster />
            <div className="flex overflow-auto w-full max-h-screen p-2 gap-2">
                {children}
            </div>
        </SidebarProvider>
    )
}