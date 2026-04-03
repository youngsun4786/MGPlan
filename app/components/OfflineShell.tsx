export function OfflineShell() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background px-4">
      <img
        src="/pwa-192x192.png"
        width={64}
        height={64}
        alt="Maison"
        className="mb-4"
      />
      <h2 className="text-xl font-semibold text-foreground">
        You're offline
      </h2>
      <p className="text-base text-muted-foreground mt-2">
        Connect to the internet to see tasks.
      </p>
    </div>
  )
}
