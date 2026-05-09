/**
 * FacebookAvatar
 *
 * Renders the classic "no profile picture set" silhouette
 * (light grey background, darker head-and-shoulders silhouette).
 * Use as a placeholder where a real headshot will go later.
 */
export function FacebookAvatar({
  className = "",
  ariaLabel = "Profile photo placeholder",
}: {
  className?: string
  ariaLabel?: string
}) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`relative bg-[#E4E6EB] flex items-end justify-center overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMax meet"
        className="w-full h-full"
        aria-hidden="true"
      >
        <circle cx="50" cy="38" r="18" fill="#BCC0C4" />
        <path
          d="M50 60 C29 60 13 77 13 100 L87 100 C87 77 71 60 50 60 Z"
          fill="#BCC0C4"
        />
      </svg>
    </div>
  )
}
