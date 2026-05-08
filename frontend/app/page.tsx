export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold">Open a Jukebot dashboard</h1>
        <p className="text-muted-foreground">
          Add your Discord server ID to the URL to open its dashboard.
        </p>
        <code className="block rounded-md border bg-muted p-3 text-sm">
          http://localhost:3000/&lt;guild_id&gt;
        </code>
      </div>
    </main>
  );
}
