import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CreditCard, Lock, ShieldCheck, Truck, ArrowLeft,
  CheckCircle2, AlertCircle
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import {
  generateCSRFToken, storeCSRFToken, validateCSRFToken,
  validateEmail, validatePhone, validateAddress, validateCard,
  sanitizeInput, rateLimiter
} from '../utils/security'

export default function Checkout({ addToast }) {
  const { cart, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [csrfToken, setCsrfToken] = useState('')
  const [errors, setErrors] = useState({})
  const [honeypot, setHoneypot] = useState('')

  const [email, setEmail] = useState('')
  const [address, setAddress] = useState({
    street: '', city: '', state: '', zip: '',                     country: 'EC'
  })
  const [card, setCard] = useState({
    number: '', expiry: '', cvv: '', name: ''
  })
  const [saveInfo, setSaveInfo] = useState(false)

  useEffect(() => {
    const token = generateCSRFToken()
    setCsrfToken(token)
    storeCSRFToken(token)
  }, [])

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-dark mb-3">Tu carrito está vacío</h1>
          <p className="text-gray-500 mb-8">Agrega productos a tu carrito antes de continuar con la compra.</p>
          <Link to="/products" className="btn-primary">Comprar Ahora</Link>
        </div>
      </div>
    )
  }

  const shipping = cartTotal >= 50 ? 0 : 9.99
  const tax = Math.round(cartTotal * 0.08 * 100) / 100
  const total = Math.round((cartTotal + shipping + tax) * 100) / 100

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    if (honeypot) return

    if (!validateCSRFToken(csrfToken)) {
      addToast('Sesión expirada. Por favor, recarga la página.', 'error')
      return
    }

    const emailValid = validateEmail(email)
    const addressValid = validateAddress(address)

    const newErrors = {}
    if (!emailValid) newErrors.email = 'Se requiere un correo electrónico válido'
    if (!addressValid.valid) newErrors.address = addressValid.errors[0]

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setStep(2)
  }

  const handlePayment = async (e) => {
    e.preventDefault()

    if (!rateLimiter('payment', 3, 60000)) {
      addToast('Demasiados intentos de pago. Por favor, espera.', 'error')
      return
    }

    if (!validateCSRFToken(csrfToken)) {
      addToast('Sesión expirada. Por favor, recarga la página.', 'error')
      return
    }

    const cardValid = validateCard(card)
    if (!cardValid.valid) {
      setErrors({ payment: cardValid.errors[0] })
      return
    }

    setProcessing(true)
    setErrors({})

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const serverTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + shipping + tax

      if (Math.abs(serverTotal - total) > 0.01) {
        addToast('Discrepancia de precios detectada. Por favor, recarga.', 'error')
        setProcessing(false)
        return
      }

      setStep(3)
      clearCart()
      addToast('¡Pago exitoso! Pedido realizado.', 'success')
    } catch {
      addToast('Pago fallido. Por favor, intenta de nuevo.', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16)
    return cleaned.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2)
    }
    return cleaned
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 lg:pt-28 pb-16"
    >
      <div className="container-custom max-w-5xl">
        <button
          onClick={() => step > 1 && setStep(step - 1)}
          className={`flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-8 transition-colors ${
            step === 1 ? 'pointer-events-none opacity-0' : ''
          }`}
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className="flex items-center justify-center gap-4 mb-12">
          {['Información', 'Pago', 'Confirmación'].map((label, i) => (
            <div key={label} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > i + 1 ? 'bg-emerald-600 text-white' :
                  step === i + 1 ? 'bg-emerald-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > i + 1 ? <CheckCircle2 size={18} /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  step === i + 1 ? 'text-dark' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className={`w-12 sm:w-20 h-0.5 ${
                step > i + 1 ? 'bg-emerald-600' : 'bg-gray-200'
              }`} />}
            </div>
          ))}
        </div>

        {step === 3 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-dark mb-3">¡Pedido Confirmado!</h1>
            <p className="text-gray-500 mb-2 max-w-md mx-auto">
              Gracias por tu compra. Recibirás un correo de confirmación en{' '}
              <span className="font-medium text-dark">{sanitizeInput(email)}</span>
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Order #GM-{Date.now().toString(36).toUpperCase()}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary">
                Seguir Comprando
              </Link>
              <Link to="/" className="btn-secondary">
                Volver al Inicio
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              {step === 1 ? (
                <form onSubmit={handleAddressSubmit} className="space-y-6">
                  <div className="card p-6">
                    <h2 className="text-lg font-bold text-dark mb-1">Información de Contacto</h2>
                    <p className="text-sm text-gray-500 mb-4">Enviaremos tu recibo aquí</p>

                    <input
                      type="text"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo Electrónico</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors({}) }}
                        placeholder="you@example.com"
                        maxLength={254}
                        className={`input-field ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                        required
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle size={14} /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="card p-6">
                    <h2 className="text-lg font-bold text-dark mb-4">Dirección de Envío</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          placeholder="Av. Amazonia y Colón"
                          maxLength={200}
                          className="input-field"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            placeholder="Quito"
                            maxLength={100}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Provincia</label>
                          <select
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            className="input-field"
                          >
                            <option value="">Seleccionar provincia</option>
                            <option value="Pichincha">Pichincha</option>
                            <option value="Guayas">Guayas</option>
                            <option value="Azuay">Azuay</option>
                            <option value="Loja">Loja</option>
                            <option value="Manabí">Manabí</option>
                            <option value="Santo Domingo">Santo Domingo de los Tsáchilas</option>
                            <option value="Esmeraldas">Esmeraldas</option>
                            <option value="Chimborazo">Chimborazo</option>
                            <option value="Tungurahua">Tungurahua</option>
                            <option value="Cotopaxi">Cotopaxi</option>
                            <option value="Imbabura">Imbabura</option>
                            <option value="Cañar">Cañar</option>
                            <option value="Morona Santiago">Morona Santiago</option>
                            <option value="Zamora Chinchipe">Zamora Chinchipe</option>
                            <option value="Orellana">Orellana</option>
                            <option value="Sucumbíos">Sucumbíos</option>
                            <option value="Pastaza">Pastaza</option>
                            <option value="Napo">Napo</option>
                            <option value="Galápagos">Galápagos</option>
                            <option value="El Oro">El Oro</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Código Postal</label>
                          <input
                            type="text"
                            value={address.zip}
                            onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                            placeholder="170101"
                            maxLength={10}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">País</label>
                          <select
                            value={address.country}
                            onChange={(e) => setAddress({ ...address, country: e.target.value })}
                            className="input-field"
                          >
                            <option value="EC">Ecuador</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    {errors.address && (
                      <p className="mt-3 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.address}
                      </p>
                    )}
                  </div>

                  <input type="hidden" name="csrf_token" value={csrfToken} />

                  <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                    Continuar al Pago
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock size={18} className="text-emerald-600" />
                      <h2 className="text-lg font-bold text-dark">Detalles del Pago</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del Titular</label>
                        <input
                          type="text"
                          value={card.name}
                          onChange={(e) => setCard({ ...card, name: e.target.value })}
                          placeholder="Juan Pérez"
                          maxLength={100}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Número de Tarjeta</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={card.number}
                            onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="input-field pl-12"
                            required
                          />
                          <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Vencimiento</label>
                          <input
                            type="text"
                            value={card.expiry}
                            onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                          <input
                            type="password"
                            value={card.cvv}
                            onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                            placeholder="123"
                            maxLength={4}
                            className="input-field"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {errors.payment && (
                      <p className="mt-4 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.payment}
                      </p>
                    )}
                  </div>

                  <label className="card p-4 flex items-center gap-3 cursor-pointer hover:border-emerald-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-sm text-gray-600">Guardar información de pago para próxima compra</span>
                  </label>

                  <button
                    type="submit"
                    disabled={processing}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Pagar {formatCurrency(total)}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="card p-6 sticky top-28">
                <h2 className="text-lg font-bold text-dark mb-4">Resumen del Pedido</h2>

                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-light-gray flex-shrink-0 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark line-clamp-1">{item.name}</p>
                        <p className="text-sm text-gray-500">Cant: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-dark">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 py-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío</span>
                    <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>
                      {shipping === 0 ? 'Gratis' : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>IVA (8%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-dark text-lg pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    { icon: ShieldCheck, text: 'Cifrado SSL' },
                    { icon: Truck, text: `Envío: ${shipping === 0 ? 'Gratis' : 'Estándar'}` },
                    { icon: Lock, text: 'Pago Seguro' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                      <item.icon size={16} className="text-emerald-600" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
