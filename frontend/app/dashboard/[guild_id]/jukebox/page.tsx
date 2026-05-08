import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    guild_id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { guild_id } = await params;
  redirect(`/dashboard/${guild_id}`);
}
