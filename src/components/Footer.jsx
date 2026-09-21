import { Link } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { validateEmail, sanitizeInput } from '../utils/security'

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (validateEmail(newsletterEmail)) {
      setSubscribed(true)
      setNewsletterEmail('')
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  const footerLinks = {
    Tienda: [
      { label: 'Todos los Productos', to: '/products' },
      { label: 'Café Orgánico', to: '/products' },
      { label: 'Cacao y Chocolate', to: '/products' },
      { label: 'Hogar y Limpieza', to: '/products' },
    ],
    Soporte: [
      { label: 'Contáctanos', to: '/' },
      { label: 'Preguntas Frecuentes', to: '/' },
      { label: 'Información de Envío', to: '/' },
      { label: 'Devoluciones', to: '/' },
    ],
    Empresa: [
      { label: 'Sobre Nosotros', to: '/' },
      { label: 'Sostenibilidad', to: '/' },
      { label: 'Blog', to: '/' },
      { label: 'Prensa', to: '/' },
    ],
    Legal: [
      { label: 'Política de Privacidad', to: '/' },
      { label: 'Términos de Servicio', to: '/' },
      { label: 'Política de Cookies', to: '/' },
    ],
  }

  return (
    <footer className="bg-dark text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold">
                Green<span className="text-emerald-400">Mart</span>
              </span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-6">
              Productos ecológicos y naturales seleccionados con cuidado para calidad y sostenibilidad.
              Compra con confianza sabiendo que cada producto es artesanal y responsable con el medio ambiente.
            </p>

            <div>
              <h3 className="font-semibold mb-3">Mantente Actualizado</h3>
              {subscribed ? (
                <p className="text-emerald-400 text-sm">¡Gracias por suscribirte!</p>
              ) : (
                <form onSubmit={handleNewsletter} className="flex">
                  <div className="relative flex-1 max-w-xs">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Ingresa tu correo electrónico"
                      maxLength={254}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/10 rounded-l-lg text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 bg-emerald-600 hover:bg-emerald-700 rounded-r-lg transition-colors"
                    aria-label="Subscribe"
                  >
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-emerald-400 text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 GreenMart Ecuador. Av. Amazonia N36-52 y Calle Whymper, Quito, Ecuador.
          </p>
          <div className="flex items-center gap-4">
            {['Visa', 'Mastercard', 'Amex', 'PayPal'].map(method => (
              <span key={method} className="text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
