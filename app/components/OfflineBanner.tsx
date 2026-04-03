interface OfflineBannerProps {
  visible: boolean
}

export function OfflineBanner({ visible }: OfflineBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-14 left-0 right-0 z-[9] bg-amber-50 border-b border-amber-200 py-2 px-4 text-center transition-transform duration-200 ease-in-out ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <p className="text-sm text-amber-800">
        Offline -- changes won't sync until reconnected
      </p>
    </div>
  )
}
