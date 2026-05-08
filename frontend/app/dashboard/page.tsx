export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold">Missing Discord server ID</h1>
        <p className="text-muted-foreground">
          Use a URL with your Discord server ID to open the dashboard.
        </p>
        <code className="block rounded-md border bg-muted p-3 text-sm">
          http://localhost:3000/dashboard/&lt;guild_id&gt;
        </code>
      </div>
    </main>
  );
}
