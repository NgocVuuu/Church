import { Link } from 'react-router-dom'
import CrossIcon from './icons/CrossIcon'
import FacebookIcon from './icons/FacebookIcon'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-6 font-sans mt-8">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <span className="text-primary">
            <CrossIcon className="w-7 h-7" />
          </span>
          <span className="font-script text-2xl md:text-3xl text-white">Gx.Đông Vinh</span>
        </div>
      </div>
    </footer>
  )
}
