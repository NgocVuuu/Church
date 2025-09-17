export default function CrossIcon({ className = 'w-8 h-8' }) {
  // SVG uses currentColor so parent text color controls the fill/stroke (we'll set to primary)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="10"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* Outer ornate cross outline */}
      <path
        d="M128 12c14 0 26 12 26 26v22h22c14 0 26 12 26 26s-12 26-26 26h-22v104c0 14-12 26-26 26s-26-12-26-26V112H80c-14 0-26-12-26-26s12-26 26-26h22V38c0-14 12-26 26-26z"
      />
      {/* Inner inset cross to mimic double-line effect */}
      <path
        d="M128 26c6 0 12 6 12 12v34h34c6 0 12 6 12 12s-6 12-12 12h-34v118c0 6-6 12-12 12s-12-6-12-12V96H82c-6 0-12-6-12-12s6-12 12-12h34V38c0-6 6-12 12-12z"
        strokeWidth="6"
      />
    </svg>
  )
}
