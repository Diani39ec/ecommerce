import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, Menu, X, User, LogOut } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { sanitizeInput } from '../utils/security'
import SearchBar from './SearchBar'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const { cartCount } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/products', label: 'Productos' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-bold text-dark hidden sm:block">
              Green<span className="text-emerald-600">Mart</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-600 hover:text-emerald-600 font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <SearchBar compact />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden p-2 text-gray-600 hover:text-emerald-600 transition-colors"
              aria-label="Buscar"
            >
              <Search size={22} />
            </button>

            <div className="relative" ref={userMenuRef}>
              {isAuthenticated ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                  aria-label="Account"
                >
                  <User size={22} />
                </button>
              )}

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-dark">{sanitizeInput(user.name)}</p>
                        <p className="text-sm text-gray-500 truncate">{sanitizeInput(user.email)}</p>
                      </div>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-sm text-gray-500 mb-3 text-center">Inicia sesión para la mejor experiencia</p>
                      <Link
                        to="/"
                        onClick={() => setUserMenuOpen(false)}
                        className="block w-full text-center btn-primary text-sm py-2"
                      >
                        Iniciar Sesión
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors"
              aria-label="Carrito"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 badge">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-emerald-600 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="lg:hidden pb-4 animate-slide-up">
            <SearchBar onClose={() => setShowSearch(false)} />
          </div>
        )}

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-slide-up">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-2 text-gray-600 hover:text-emerald-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
