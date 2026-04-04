export function OfflineShell() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background px-4">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <span className="text-primary font-heading font-bold text-2xl">M</span>
      </div>
      <h2 className="font-heading text-xl font-semibold text-foreground">You're offline</h2>
      <p className="text-sm text-muted-foreground/60 mt-2">
        Connect to the internet to see tasks.
      </p>
    </div>
  )
}
