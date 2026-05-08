import GuildDashboard from "@/components/guild-dashboard";

type Props = {
  params: Promise<{
    guild_id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { guild_id } = await params;
  return <GuildDashboard guildId={guild_id} />;
}
