export default function FacebookIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* Facebook "f" glyph (no surrounding box/circle) */}
      <path d="M15.75 3.5c-.9-.02-1.81 0-2.71 0-2.39 0-3.99 1.53-3.99 4.11V9H6.5v3h2.55v8h3.16v-8h2.57l.46-3h-3.03V7.84c0-.88.29-1.34 1.38-1.34h1.69V3.5z" />
    </svg>
  )
}
