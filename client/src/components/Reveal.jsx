import { useReveal } from '../hooks/useReveal'

export default function Reveal({ children, className = '', as: Tag = 'div', effect = 'fade-up', delay = 0 }) {
  const { ref, visible } = useReveal()
  const base = effect === 'fade-up'
    ? 'opacity-0 translate-y-4'
    : 'opacity-0'
  const shown = effect === 'fade-up'
    ? 'opacity-100 translate-y-0'
    : 'opacity-100'
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} will-change-transform transition-all duration-700 ease-out ${visible ? shown : base}`}
    >
      {children}
    </Tag>
  )
}
