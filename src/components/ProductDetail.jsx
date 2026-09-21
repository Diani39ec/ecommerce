import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingBag, Star, Check, Shield, Truck, RotateCcw } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import products from '../data/products'

export default function ProductDetail({ addToast }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, getItemQuantity } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  const product = products.find(p => p.id === Number(id))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark mb-4">Producto no encontrado</h1>
          <Link to="/products" className="btn-primary">
            Ver Productos
          </Link>
        </div>
      </div>
    )
  }

  const inCart = getItemQuantity(product.id)
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const handleAddToCart = () => {
    setAdding(true)
    addItem(product.id, quantity)
    addToast(`${quantity} ${product.name} agregado al carrito`, 'success')
    setTimeout(() => setAdding(false), 600)
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 lg:pt-24 pb-16"
    >
      <div className="container-custom">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden bg-light-gray aspect-square"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                {product.badge}
              </span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-emerald-600 font-medium uppercase tracking-wider text-sm mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-dark mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-gray-500">
                {product.rating} ({product.reviews} reseñas)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-dark">{formatCurrency(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                    -{discount}% dto.
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {product.features && (
              <div className="grid grid-cols-2 gap-3 mb-8">
                {product.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-gray-600 hover:text-emerald-600 transition-colors font-semibold"
                >
                  -
                </button>
                <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="px-4 py-3 text-gray-600 hover:text-emerald-600 transition-colors font-semibold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-4"
              >
                <ShoppingBag size={20} />
                {adding ? '¡Agregado!' : inCart > 0 ? `Agregar Más (${inCart} en carrito)` : 'Agregar al Carrito'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              {[
                { icon: Truck, text: 'Envío Gratis' },
                { icon: Shield, text: 'Pago Seguro' },
                { icon: RotateCcw, text: 'Devoluciones 30 Días' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 text-center">
                  <item.icon size={20} className="text-emerald-600" />
                  <span className="text-xs text-gray-500">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-16 border-t border-gray-100 pt-12">
          <div className="flex gap-8 border-b border-gray-100 mb-8">
            {['descripción', 'características', 'reseñas'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-medium capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="max-w-3xl">
            {activeTab === 'descripción' && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}
            {activeTab === 'características' && product.features && (
              <ul className="space-y-3">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check size={18} className="text-emerald-600" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            {activeTab === 'reseñas' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-bold text-dark">{product.rating}</span>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{product.reviews} reseñas</p>
                  </div>
                </div>
                <p className="text-gray-500">¡Reseñas de clientes próximamente!</p>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-dark mb-8">También Te Puede Gustar</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map(p => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="card overflow-hidden group"
                >
                  <div className="aspect-square bg-light-gray overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-dark text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-emerald-600 font-bold mt-1">{formatCurrency(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
