import DashboardFrame from "@/components/dashboard-frame";

export default function GuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardFrame>{children}</DashboardFrame>;
}
