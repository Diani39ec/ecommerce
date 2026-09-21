import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'

export default function Cart({ addToast }) {
  const { cart, removeItem, updateQuantity, cartTotal, cartCount, clearCart } = useCart()

  const handleRemove = (id, name) => {
    removeItem(id)
    addToast(`${name} eliminado del carrito`, 'info')
  }

  const handleQuantityChange = (id, newQty) => {
    if (newQty < 1) {
      const item = cart.find(i => i.id === id)
      if (item) handleRemove(id, item.name)
      return
    }
    updateQuantity(id, newQty)
  }

  const shipping = cartTotal >= 50 ? 0 : 9.99
  const tax = Math.round(cartTotal * 0.08 * 100) / 100
  const total = Math.round((cartTotal + shipping + tax) * 100) / 100

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center pt-20"
      >
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-dark mb-3">Tu Carrito Está Vacío</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            Parece que aún no has agregado nada a tu carrito. ¡Empieza a comprar para llenarlo!
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Empezar a Comprar
            <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 lg:pt-28 pb-16"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-dark">
            Carrito de Compras
            <span className="text-gray-400 text-lg ml-3">({cartCount} artículos)</span>
          </h1>
          <button
            onClick={() => { clearCart(); addToast('Carrito vaciado', 'info') }}
            className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            Vaciar Carrito
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-4 lg:p-6"
              >
                <div className="flex gap-4">
                  <Link
                    to={`/product/${item.id}`}
                    className="w-20 h-20 lg:w-28 lg:h-28 rounded-xl overflow-hidden bg-light-gray flex-shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link
                          to={`/product/${item.id}`}
                          className="font-semibold text-dark hover:text-emerald-600 transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id, item.name)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-3 py-1 font-semibold text-sm min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <p className="font-bold text-dark text-lg">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-28">
              <h2 className="text-lg font-bold text-dark mb-6">Resumen del Pedido</h2>

              <div className="space-y-3 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} artículos)</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>
                    {shipping === 0 ? 'Gratis' : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IVA (8%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-dark text-lg py-4">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {shipping > 0 && (
                <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg p-3 mb-4 text-center">
                  Agrega {formatCurrency(50 - cartTotal)} más para envío gratis!
                </p>
              )}

              <Link
                to="/checkout"
                className="btn-primary w-full flex items-center justify-center gap-2 py-4"
              >
                Finalizar Compra
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/products"
                className="block text-center text-emerald-600 hover:text-emerald-700 font-medium mt-4 transition-colors"
              >
                Seguir Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
